import React, { useEffect, useState } from 'react';
import {
    Clock,
    User,
    MoreVertical,
    X,
    RotateCcw,
    Download,
    Copy,
    Star,
    Edit2,
    Save,
    Trash2,
    Plus,
    Sun,
    Moon,
    ArrowLeft,
    Menu,
    Mail,
    Circle,
    Code,
    File,
    Loader2,
    FileText,
    Check,
    Sparkles,
    Globe,
    FileCode,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { createNamedSnapshot, applySnapshotToDoc } from '../util/yjsSnapshots';
import * as Y from 'yjs';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { AiOutlineHistory } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useSaveVersionMutation, useGetAllversionsQuery, useGeneratePdfMutation } from '../api/docApi';
import { getWordCountFromYdoc } from '../util/wordCount';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '../components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { InputField } from './InputField';
import { toast } from 'sonner';
import { Buffer } from 'buffer';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { getInitials } from '../util/getInitials.js';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card.js';
import { useEditor, EditorContext, EditorContent } from '@tiptap/react';
import { FaRedo } from 'react-icons/fa';
import { FaRegFilePdf } from 'react-icons/fa6';
import { IoLogoMarkdown } from 'react-icons/io5';

// VersionViewer.jsx
import { Collaboration } from '@tiptap/extension-collaboration';
import { useDeleteVersionMutation, useUpdateVersionMutation } from '../api/versionApi.js';

import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

import { style, style2 } from '../util/htmlStyles.js';
import TurndownService from 'turndown';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { Awareness } from 'y-protocols/awareness.js';

export const VersionViewer = ({ selectedVersion, versionUpdateBase64, onEditorReady }) => {
    const [ydoc] = useState(() => new Y.Doc());

    // Apply update before editor is created
    useEffect(() => {
        if (versionUpdateBase64) {
            const binaryUpdate = Buffer.from(versionUpdateBase64, 'base64');
            Y.applyUpdate(ydoc, binaryUpdate);
        }
    }, [versionUpdateBase64]);

    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            Collaboration.configure({
                document: ydoc,
                field: 'default',
            }),
            StarterKit.configure({ history: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
            TrailingNode,
            Link.configure({ openOnClick: false }),
        ],
        onCreate: ({ editor }) => onEditorReady?.(editor),
    });

    if (!editor) return <div>Loading...</div>;

    return (
        <div className='prose dark:prose-invert p-4 border bg-white dark:bg-gray-900 rounded-xl'>
            <EditorContent editor={editor} />
        </div>
    );
};

const VersionComponent = ({ setVersionopen }) => {
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [showCloningModal, setShowCloningModal] = useState(false);
    const [expandedVersions, setExpandedVersions] = useState({});
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [versionName, setVersionName] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const [previewEditor, setPreviewEditor] = useState(null);

    const [restoreLoading, setIsRestoreLoading] = useState(false);
    const [iscloneLoading, setIsCloneLoading] = useState(false);

    const { editorId } = useParams();
    const { ydoc, awareness, assignedColor } = useSocket();
    const user = useSelector((state) => state.user.user);

    const [saveVersion] = useSaveVersionMutation();
    const [deleteVersion, { isLoading: isDeleteLoading }] = useDeleteVersionMutation();
    const [updateVersion, { isLoading: isUpdating }] = useUpdateVersionMutation();
    const [generatePdf, { isLoading, isSuccess, error }] = useGeneratePdfMutation();

    const {
        data,
        isLoading: isVersionLoading,
        // error,
        refetch,
    } = useGetAllversionsQuery(
        { editorId },
        {
            refetchOnMountOrArgChange: true,
            pollingInterval: 5000,
        },
    );

    const confirmSaveVersion = async () => {
        if (!ydoc || !awareness) {
            console.warn('❌ Cannot save version: editor or Ydoc missing');
            return;
        }
        console.log(awareness.getStates());
        if (!ydoc || !awareness || awareness.getStates().size === 0) {
            console.warn('❌ Cannot save version: Ydoc or awareness not ready');
            toast.error('Editor is not ready yet. Please wait.');
            return;
        }
        try {
            const update = Y.encodeStateAsUpdate(ydoc);
            const fragment = ydoc.getXmlFragment('default');
            console.log('📝 Saving fragment:', fragment.toJSON());
            console.log('💾 Saving update with length:', update.byteLength);
            if (!update || update.byteLength < 20) {
                console.warn('⚠️ Update too small. Likely not ready. Skipping save.');
                return;
            }
            const updateBase64 = Buffer.from(update).toString('base64');
            try {
                const decoded = Buffer.from(updateBase64, 'base64');
                Y.decodeUpdate(decoded);
            } catch (decodeErr) {
                console.error('❌ Cannot save: Invalid Yjs update:', decodeErr.message);
                return;
            }
            const collaborators = Array.from(awareness.getStates())
                .map(([clientId, state]) => {
                    if (!state?.user?.id) return null; // skip invalid entries
                    return {
                        user: state.user.id,
                        role: state.user.role || 'editor',
                        color: state.user.color || null,
                    };
                })
                .filter(Boolean);

            const res = await saveVersion({
                documentId: editorId,
                update: updateBase64,
                name: versionName || `${new Date().toLocaleString()}`,
                description: versionDescription || '',
                author: { data: user._id, color: assignedColor },
                wordCount: getWordCountFromYdoc(ydoc),
                collaborators,
            }).unwrap();
            if (!res || !res.success) {
                throw new Error('Failed to save version');
            }
            setSaveVersionDialogOpen(false);
            setVersionName('');
            setVersionDescription('');
            toast.success('Version saved successfully!');
        } catch (err) {
            console.error('❌ Failed to save version:', err);
            toast.error('Failed to save version. Please try again.');
        }
    };

    const duplicateSelectedVersion = async () => {
        if (!selectedVersion) {
            toast.error('No version selected');
            return;
        }
        setIsCloneLoading(true);

        try {
            // Mongo stores Buffer under { type: 'Buffer', data: [...] }
            const updateBase64 = Buffer.from(selectedVersion.update.data).toString('base64');

            const res = await saveVersion({
                documentId: selectedVersion.documentId,
                update: updateBase64,
                name: versionName || `${selectedVersion.name} (Copy)`,
                description: versionDescription || selectedVersion.description,
                author: selectedVersion.author, // keep original author metadata
                wordCount: selectedVersion.wordCount,
                collaborators: selectedVersion.collaborators,
                source: 'manual',
            }).unwrap();

            if (!res || !res.success) {
                throw new Error('Failed to duplicate version');
            }

            setShowCloningModal(false);
            toast.success('✅ Version duplicated successfully!');
            return res;
        } catch (err) {
            console.error('❌ Failed to duplicate version:', err);
            toast.error('Failed to duplicate version');
        } finally {
            setIsCloneLoading(false);
        }
    };

    const restoreVersion = async () => {
        setIsRestoreLoading(true);
        try {
            let decodedUpdate;

            if (selectedVersion.update?.data) {
                // Stored as Buffer in DB
                decodedUpdate = Uint8Array.from(selectedVersion.update.data);
            } else if (typeof selectedVersion.update === 'string') {
                // Fallback: base64
                decodedUpdate = Uint8Array.from(Buffer.from(selectedVersion.update, 'base64'));
            } else {
                throw new Error('Unknown update format');
            }

            // 1. Get the shared fragment Tiptap is using
            const fragment = ydoc.getXmlFragment('default');

            // 2. Clear existing content
            fragment.delete(0, fragment.length); // clear all child nodes

            // 3. Apply the stored snapshot update into the SAME ydoc
            const tempDoc = new Y.Doc();
            Y.applyUpdate(tempDoc, decodedUpdate);

            // 4. Get the fragment from the snapshot doc
            const snapshotFragment = tempDoc.getXmlFragment('default');

            // 5. Insert cloned content into the live ydoc
            snapshotFragment.toArray().forEach((node) => {
                fragment.push([node.clone()]);
            });

            console.log('✅ Version restored. Current doc:', ydoc.toJSON());
            setVersionopen(false);
        } catch (error) {
            console.log('Error occured while restoring version:', error);
        } finally {
            setIsRestoreLoading(false);
        }
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('.version-sidebar');
            setIsSidebarHidden(sidebar?.classList.contains('hidden'));
        });

        const target = document.querySelector('.version-sidebar');
        if (target) {
            observer.observe(target, { attributes: true, attributeFilter: ['class'] });
        }

        return () => observer.disconnect();
    }, []);

    const toggleSidebar = () => {
        const el = document.querySelector('.version-sidebar');
        if (el) {
            el.classList.toggle('hidden');
            setIsSidebarHidden(el.classList.contains('hidden'));
        }
    };

    const handleVersionClick = (version) => {
        const fragment = ydoc.getXmlFragment('default');
        console.log('📝 selected fragment:', fragment.toJSON());
        setSelectedVersion(version);
    };

    const toggleExpanded = (versionId) => {
        setExpandedVersions((prev) => ({
            ...prev,
            [versionId]: !prev[versionId],
        }));
    };

    const handleRestore = (version) => {
        setShowRestoreModal(true);
        setSelectedVersion(version);
    };

    const handleNameVersion = async () => {
        try {
            const res = await updateVersion({
                documentId: editorId,
                title: versionName,
                description: versionDescription,
                versionId: selectedVersion._id,
            });
            if (res?.data?.success) {
                setSelectedVersion((prev) => ({
                    ...prev,
                    title: versionName,
                    description: versionDescription,
                }));
                setVersionName('');
                setVersionDescription('');
                refetch();
                toast.success('Success', { description: res?.data?.message || "Successfully updated version's name" });
                setShowNameModal(false);
            } else {
                console.log(res);
                throw new Error(res?.error?.data?.message);
            }
        } catch (error) {
            toast.error('Error updating version', {
                description: error.message,
            });
        }
    };

    const removeVersion = async () => {
        try {
            const res = await deleteVersion({ documentId: editorId, versionId: selectedVersion._id });
            if (res?.data?.success) {
                toast.success('Successfully removed version');
                setSelectedVersion(null);
                refetch();
            }
        } catch (error) {
            console.log(error.message);
            toast.error('Failed to remove version', {
                description: error.message,
            });
        }
    };

    const UserAvatar = ({ name, size = 'sm', bgColor }) => {
        const sizeClasses = {
            xs: 'w-5 h-5 text-xs',
            sm: 'w-6 h-6 text-xs',
            md: 'w-8 h-8 text-sm',
        };

        return (
            <div
                className={`${bgColor || 'bg-gray-500'} ${
                    sizeClasses[size]
                } rounded-full flex items-center justify-center text-white font-medium relative group`}
                style={{ backgroundColor: bgColor || 'bg-gray-500' }}
            >
                {getInitials(name)}
            </div>
        );
    };

    const handleDownload = async (editor, format, versionName = 'version') => {
        if (!editor) return;

        let blob, fileName;

        switch (format) {
            case 'txt': {
                function serializeNode(node, context = {}, index = 0, depth = 0) {
                    switch (node.type.name) {
                        case 'heading': {
                            const level = node.attrs.level;
                            return `${'#'.repeat(level)} ${node.textContent}\n`;
                        }

                        case 'paragraph': {
                            return `${'  '.repeat(depth)}${node.textContent}\n`;
                        }

                        case 'bulletList': {
                            return node.content.content
                                .map((li) => serializeNode(li, { list: 'bullet' }, 0, depth))
                                .join('\n');
                        }

                        case 'orderedList': {
                            return node.content.content
                                .map((li, i) => serializeNode(li, { list: 'ordered' }, i, depth))
                                .join('\n');
                        }

                        case 'listItem': {
                            let marker = '';
                            if (node.attrs?.checked !== undefined) {
                                // Task list
                                marker = node.attrs.checked ? '[x]' : '[ ]';
                            } else if (context.list === 'bullet') {
                                marker = '-';
                            } else if (context.list === 'ordered') {
                                marker = `${index + 1}.`;
                            }

                            const content = node.content.content
                                .map((child, i) => serializeNode(child, {}, i, depth + 1))
                                .join('');

                            return `${'  '.repeat(depth)}${marker} ${content.trim()}`;
                        }

                        case 'blockquote': {
                            return node.content.content
                                .map((child) => `${'  '.repeat(depth)}> ${serializeNode(child, {}, 0, depth + 1)}`)
                                .join('\n');
                        }

                        case 'codeBlock': {
                            return `\n${'  '.repeat(depth)}\`\`\`\n${node.textContent}\n${'  '.repeat(depth)}\`\`\`\n`;
                        }

                        case 'image': {
                            const src = node.attrs?.src || '[Image]';
                            return `${'  '.repeat(depth)}[Image: ${src}]`;
                        }

                        case 'text': {
                            let text = node.text || '';
                            if (node.marks) {
                                node.marks.forEach((mark) => {
                                    if (mark.type.name === 'bold') text = `**${text}**`;
                                    if (mark.type.name === 'italic') text = `*${text}*`;
                                    if (mark.type.name === 'strike') text = `~~${text}~~`;
                                    if (mark.type.name === 'underline') text = `__${text}__`;
                                    if (mark.type.name === 'code') text = `\`${text}\``;
                                });
                            }
                            return text;
                        }

                        default: {
                            if (node.content?.content) {
                                return node.content.content
                                    .map((child, i) => serializeNode(child, context, i, depth))
                                    .join('\n');
                            }
                            return node.textContent || '';
                        }
                    }
                }

                const walker = editor.state.doc.content.content.map((node, i) => serializeNode(node, {}, i));

                const plainText = walker.join('\n\n');
                blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
                fileName = `${versionName}.txt`;
                break;
            }

            case 'md': {
                const turndownService = new TurndownService();

                // === Highlight with colors ===
                turndownService.addRule('markWithColor', {
                    filter: 'mark',
                    replacement: (content, node) => {
                        const color = node.getAttribute('data-color') || node.style.backgroundColor || '';

                        const colorMap2 = {
                            'var(--tt-color-highlight-yellow)': '#b1a205',
                            'var(--tt-color-highlight-green)': '#03a73d',
                            'var(--tt-color-highlight-blue)': '#046cb1',
                            'var(--tt-color-highlight-purple)': '#5b04b8',
                            'var(--tt-color-highlight-red)': '#9e030e',
                            'var(--tt-color-highlight-gray)': 'rgb(133, 133, 131)',
                            'var(--tt-color-highlight-brown)': 'rgb(109, 66, 66)',
                            'var(--tt-color-highlight-orange)': 'rgb(171, 74, 5)',
                            'var(--tt-color-highlight-pink)': 'rgb(126, 5, 116)',
                            'var(--tt-color-highlight-yellow-contrast)': '#58531e',
                            'var(--tt-color-highlight-green-contrast)': '#47855d',
                            'var(--tt-color-highlight-blue-contrast)': '#5e86a1',
                            'var(--tt-color-highlight-purple-contrast)': '#4c3564',
                            'var(--tt-color-highlight-red-contrast)': '#643539',
                            'var(--tt-color-highlight-gray-contrast)': 'rgba(255, 255, 255, 0.094)',
                            'var(--tt-color-highlight-brown-contrast)': 'rgba(184, 101, 69, 0.25)',
                            'var(--tt-color-highlight-orange-contrast)': 'rgba(233, 126, 37, 0.2)',
                            'var(--tt-color-highlight-pink-contrast)': 'rgba(220, 76, 145, 0.22)',
                        };

                        const colorName = colorMap2[color] || '#faf594';
                        return `<mark style='background-color: ${colorName};color:white'>${content}</mark>`;
                        // return `==${content}=={${colorName}}`;
                    },
                });

                // === Text alignment (safe for H1–H6, P) ===
                turndownService.addRule('textAlign', {
                    filter: (node) => node.nodeName === 'P' || /^H[1-6]$/.test(node.nodeName),
                    replacement: (content, node) => {
                        const align = node.style.textAlign;
                        if (align && align !== 'left') {
                            return `<${node.nodeName.toLowerCase()} align="${align}">${content}</${node.nodeName.toLowerCase()}>\n\n`;
                        }
                        if (node.nodeName === 'P') return `${content}\n\n`;
                        return `<${node.nodeName.toLowerCase()}>${content}</${node.nodeName.toLowerCase()}>\n\n`;
                    },
                });

                // === Task list items ===
                turndownService.addRule('taskList', {
                    filter: (node) => node.nodeName === 'UL' && node.getAttribute('data-type') === 'taskList',
                    replacement: (content, node) => {
                        const items = node.querySelectorAll('li[data-type="taskItem"]');
                        let md = '';
                        items.forEach((li) => {
                            const checked = li.getAttribute('data-checked') === 'true';
                            const text = li.innerText.trim();
                            md += `<div style="display:flex;align-items:center;"><input type="checkbox" ${
                                checked ? 'checked' : ''
                            }> ${checked ? `<strike>${text}</strike>` : text}</div>\n`;
                        });
                        return md + '\n';
                    },
                });

                //  `<div style="display:flex;align-items:center;justify-content"><input type="checkbox" > Task 1</div>`

                // === Figures with captions ===
                turndownService.addRule('figureWithCaption', {
                    filter: 'figure',
                    replacement: (content, node) => {
                        const img = node.querySelector('img');
                        const caption = node.querySelector('figcaption');
                        if (img) {
                            const alt = img.alt || '';
                            const src = img.src || '';
                            let md = `![${alt}](${src})`;
                            if (caption) {
                                md += `\n*${caption.textContent}*`;
                            }
                            return md;
                        }
                        return content;
                    },
                });

                turndownService.addRule('pre', {
                    filter: 'pre',
                    replacement: (content) => {
                        return `\`\`\`\n${content}\n\`\`\`\n`;
                    },
                });

                turndownService.addRule('u', {
                    filter: 'u',
                    replacement: (content) => {
                        return `<ins>${content}</ins>`;
                    },
                });

                turndownService.addRule('s', {
                    filter: 's',
                    replacement: (content) => {
                        return `<strike>${content}</strike>`;
                    },
                });

                // === Run conversion ===
                const markdown = turndownService.turndown(editor.getHTML());
                blob = new Blob([markdown], { type: 'text/markdown' });
                fileName = `${versionName}.md`;
                break;
            }

            case 'html': {
                const html = `
                    <html>
                        <head>
                            <style>${style}</style>
                            <title>${versionName}</title>
                        </head>
                        <body class='tiptap'>
                        ${editor.getHTML()}
                        </body>
                    </html>
                `;

                blob = new Blob([html], { type: 'text/html' });
                fileName = `${versionName}.html`;
                break;
            }

            // TASK: Fix this formatting ASAP
            case 'docx': {
                toast.info('This format is not supported yet.', {
                    description: 'Please try other formats.',
                });
                return;
            }

            case 'pdf': {
                const htmlContent = `
                    <html>
                        <head>
                            <style>${style2}</style>
                            <title>${versionName}</title>
                        </head>
                        <body class='tiptap'>
                            ${editor.getHTML()}
                        </body>
                    </html>
                `;
                console.log(htmlContent);

                try {
                    blob = await generatePdf(htmlContent).unwrap();
                    fileName = `${versionName}.pdf`;
                    console.log('✅ PDF downloaded successfully!');
                } catch (err) {
                    console.error('Failed to download PDF:', err);
                    toast.error('Failed to generate PDF');
                    return;
                }
                break;
            }

            default:
                toast.error('Unsupported format in frontend');
                return;
        }

        if (!(blob instanceof Blob)) {
            console.error('Download failed: not a Blob', blob);
            toast.error('Failed to generate file');
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const [downloadingFormat, setDownloadingFormat] = useState(null);
    const [completedFormat, setCompletedFormat] = useState(null);

    const handleFormatDownload = async (format) => {
        setDownloadingFormat(format.type);
        await handleDownload(previewEditor, format.type, selectedVersion.name);
        setDownloadingFormat(null);
        setCompletedFormat(format.type);
        setTimeout(() => setCompletedFormat(null), 2500);
    };

    const formats = [
        {
            type: 'pdf',
            label: 'PDF Document',
            description: 'Best for printing and official documents',
            icon: FaRegFilePdf,
            colorLight: 'text-red-600',
            colorDark: 'dark:text-red-400',
            bgColorLight: 'bg-red-50',
            bgColorDark: 'dark:bg-red-950/30',
            borderColorLight: 'border-red-200',
            borderColorDark: 'dark:border-red-800/50',
            hoverBgLight: 'hover:bg-red-100',
            hoverBgDark: 'dark:hover:bg-red-900/30',
            iconBgLight: 'bg-red-50',
            iconBgDark: 'dark:bg-red-950/50',
            iconBorderLight: 'border-red-200',
            iconBorderDark: 'dark:border-red-800/50',
            popular: true,
        },
        {
            type: 'docx',
            label: 'Word Document',
            description: 'Editable in Microsoft Word',
            icon: FileText,
            colorLight: 'text-blue-600',
            colorDark: 'dark:text-blue-400',
            bgColorLight: 'bg-blue-50',
            bgColorDark: 'dark:bg-blue-950/30',
            borderColorLight: 'border-blue-200',
            borderColorDark: 'dark:border-blue-800/50',
            hoverBgLight: 'hover:bg-blue-100',
            hoverBgDark: 'dark:hover:bg-blue-900/30',
            iconBgLight: 'bg-blue-50',
            iconBgDark: 'dark:bg-blue-950/50',
            iconBorderLight: 'border-blue-200',
            iconBorderDark: 'dark:border-blue-800/50',
            popular: false,
        },
        {
            type: 'md',
            label: 'Markdown',
            description: 'Developer-friendly plain text',
            icon: IoLogoMarkdown,
            colorLight: 'text-purple-600',
            colorDark: 'dark:text-purple-400',
            bgColorLight: 'bg-purple-50',
            bgColorDark: 'dark:bg-purple-950/30',
            borderColorLight: 'border-purple-200',
            borderColorDark: 'dark:border-purple-800/50',
            hoverBgLight: 'hover:bg-purple-100',
            hoverBgDark: 'dark:hover:bg-purple-900/30',
            iconBgLight: 'bg-purple-50',
            iconBgDark: 'dark:bg-purple-950/50',
            iconBorderLight: 'border-purple-200',
            iconBorderDark: 'dark:border-purple-800/50',
            popular: false,
        },
        {
            type: 'html',
            label: 'HTML',
            description: 'Web page format',
            icon: Globe,
            colorLight: 'text-orange-600',
            colorDark: 'dark:text-orange-400',
            bgColorLight: 'bg-orange-50',
            bgColorDark: 'dark:bg-orange-950/30',
            borderColorLight: 'border-orange-200',
            borderColorDark: 'dark:border-orange-800/50',
            hoverBgLight: 'hover:bg-orange-100',
            hoverBgDark: 'dark:hover:bg-orange-900/30',
            iconBgLight: 'bg-orange-50',
            iconBgDark: 'dark:bg-orange-950/50',
            iconBorderLight: 'border-orange-200',
            iconBorderDark: 'dark:border-orange-800/50',
            popular: false,
        },
        {
            type: 'txt',
            label: 'Plain Text',
            description: 'Simple text file',
            icon: File,
            colorLight: 'text-slate-600',
            colorDark: 'dark:text-slate-400',
            bgColorLight: 'bg-slate-50',
            bgColorDark: 'dark:bg-slate-950/30',
            borderColorLight: 'border-slate-200',
            borderColorDark: 'dark:border-slate-800/50',
            hoverBgLight: 'hover:bg-slate-100',
            hoverBgDark: 'dark:hover:bg-slate-900/30',
            iconBgLight: 'bg-slate-50',
            iconBgDark: 'dark:bg-slate-950/50',
            iconBorderLight: 'border-slate-200',
            iconBorderDark: 'dark:border-slate-800/50',
            popular: false,
        },
    ];

    console.log(selectedVersion);

    if (isVersionLoading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <p className='text-gray-500 dark:text-gray-400'>Loading version history...</p>
            </div>
        );
    }

    return (
        <div className={`h-screen w-screen flex dark:bg-gray-900 bg-gray-50`}>
            {/* Editor Section */}
            <div className='dark:bg-gray-800 bg-white h-full w-full dark:border-gray-700 border-gray-200 border-r shadow-sm flex flex-col'>
                {/* Editor Header */}
                <div
                    className={`p-4 dark:border-gray-700 dark:bg-gray-900 border-gray-200 bg-gray-50 border-b flex justify-between items-center`}
                >
                    {selectedVersion ? (
                        <span className={`ms-10 text-sm md:text-lg font-medium dark:text-white text-gray-800`}>
                            Version Preview: {selectedVersion.name}
                        </span>
                    ) : (
                        <span className={`ms-10 text-sm md:text-lg font-medium dark:text-white text-gray-800`}>
                            Select a version
                        </span>
                    )}
                    <div className='flex items-center gap-4'>
                        {selectedVersion ? (
                            <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
                                <DialogTrigger asChild>
                                    <button
                                        type='button'
                                        className='flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    >
                                        {restoreLoading ? (
                                            <>
                                                <Loader2 className='w-4 h-4 animate-spin' />
                                                <span className='hidden md:block'>Restoring...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaRedo className='w-4 h-4 rotate-40' />
                                                <span className='hidden md:block'>Restore Version</span>
                                            </>
                                        )}
                                    </button>
                                </DialogTrigger>

                                <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 px-5 py-4'>
                                    <DialogHeader>
                                        <DialogTitle className='text-lg font-semibold'>Confirm Restore</DialogTitle>
                                        <DialogDescription>
                                            <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                                                Restoring will replace the current version with the selected version.
                                                You can always undo this action.
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>

                                    <DialogFooter className='flex justify-end gap-2'>
                                        <DialogClose asChild>
                                            <Button
                                                type='button'
                                                variant='secondary'
                                                className='px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-md'
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type='button'
                                            variant='primary'
                                            onClick={async () => {
                                                await restoreVersion(selectedVersion);
                                                setShowRestoreModal(false);
                                            }}
                                            className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                                            disabled={restoreLoading}
                                        >
                                            {restoreLoading ? (
                                                <>
                                                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                    Restoring...
                                                </>
                                            ) : (
                                                'Restore'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Dialog open={saveVersionDialogOpen} onOpenChange={setSaveVersionDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        type='button'
                                        className='flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    >
                                        <Save className='w-4 h-4' />
                                        <span className='md:block hidden'>Save version</span>
                                    </button>
                                </DialogTrigger>

                                <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 px-5 py-4'>
                                    <DialogHeader>
                                        <DialogTitle className='font-medium dark:text-white text-gray-900'>
                                            Save current version
                                        </DialogTitle>
                                        <DialogDescription>
                                            Save the current state of the document as a new version. You can give it a
                                            name and description.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Version Name Input */}
                                    <div className=''>
                                        <Label htmlFor='version-name' className='mb-4 block'>
                                            Version Name (optional)
                                        </Label>
                                        <div className='relative'>
                                            <AiOutlineHistory
                                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-10 ${
                                                    isFocused
                                                        ? 'text-blue-500 dark:text-blue-400'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}
                                            />
                                            <input
                                                id='version-name'
                                                type='text'
                                                placeholder='Enter version name...'
                                                value={versionName}
                                                onChange={(e) => setVersionName(e.target.value)}
                                                onFocus={() => setIsFocused(true)}
                                                onBlur={() => setTimeout(() => setIsFocused(false), 0)}
                                                className={`w-full py-3 pl-10 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                                                    isFocused
                                                        ? 'border-blue-500 dark:border-blue-400'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Version Description Textarea */}
                                    <div className=''>
                                        <Label htmlFor='version-description' className='mb-4 block'>
                                            Version Description (optional)
                                        </Label>
                                        <textarea
                                            id='version-description'
                                            rows={3}
                                            placeholder='Add a short description...'
                                            value={versionDescription}
                                            onChange={(e) => setVersionDescription(e.target.value)}
                                            // className={`w-full min-h-12 max-h-20 custom-scrollbar py-3 px-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                            //     transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 border-gray-300 dark:border-gray-600}`}
                                            className='w-full min-h-12 max-h-20 custom-scrollbar p-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                                                            transition-all duration-200 focus:border-blue-500'
                                        />
                                    </div>

                                    {/* Footer Actions */}
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <button
                                                type='button'
                                                className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                                            >
                                                Cancel
                                            </button>
                                        </DialogClose>
                                        <button
                                            onClick={() => confirmSaveVersion()}
                                            type='submit'
                                            className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                                        >
                                            Save Version
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {isSidebarHidden && (
                            <button
                                className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
                                onClick={toggleSidebar}
                            >
                                <Menu className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Editor Content */}
                <div className='max-h-screen overflow-y-auto p-6'>
                    {/* <div className={`dark:text-gray-400 text-gray-400 text-center mt-20`}> */}
                    {selectedVersion && (
                        <>
                            <div className='mt-4' key={selectedVersion._id}>
                                <VersionViewer
                                    selectedVersion={selectedVersion}
                                    versionUpdateBase64={selectedVersion?.update}
                                    onEditorReady={setPreviewEditor}
                                />
                            </div>
                        </>
                    )}
                    {/* </div> */}
                </div>
            </div>

            {/* Wrapper */}
            <div className='version-sidebar bg-white dark:bg-gray-800 h-full absolute sm:relative w-full md:w-2/3 lg:w-[30%] border-l border-gray-200 dark:border-gray-700 flex flex-col'>
                {/* Header */}
                <div className='p-4 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex-shrink-0 z-[5]'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                            <span className='text-lg font-medium text-gray-800 dark:text-white'>Version history</span>
                        </div>
                        <button
                            className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
                            onClick={() => {
                                document.querySelector('.version-sidebar').classList.toggle('hidden');
                            }}
                        >
                            <Menu className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                        </button>
                    </div>
                    <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                        {data?.versions.length} versions available
                    </div>
                </div>

                {/* Version List */}
                <div className='max-h-screen overflow-y-auto'>
                    <div className='p-3 space-y-3'>
                        {data?.versions && data.versions.length === 0 ? (
                            <div className='text-center text-gray-500 dark:text-gray-400 py-10'>
                                No versions available yet. Start editing to create your first version.
                            </div>
                        ) : (
                            <>
                                {data?.versions.map((version, index) => {
                                    const baseClasses = `group rounded-xl transition-all duration-200 border-2`;
                                    const selectedClasses = `shadow-md ${
                                        selectedVersion?._id === version._id
                                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-600'
                                            : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500'
                                    }`;
                                    return (
                                        <div key={index} className={`${baseClasses} ${selectedClasses}`}>
                                            <div
                                                className='p-4 cursor-pointer'
                                                onClick={() => handleVersionClick(version)}
                                            >
                                                {/* Header */}
                                                <div className='flex items-start justify-between mb-3'>
                                                    <div className='flex items-center gap-2 flex-1'>
                                                        <div
                                                            className={`w-3 h-3 rounded-full ${
                                                                index === 0 ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        />
                                                        <div className='flex-1'>
                                                            <div className='flex items-center gap-2 mb-1'>
                                                                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                                    {version?.name}
                                                                </span>
                                                                {index === 0 && (
                                                                    <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
                                                                        Current
                                                                    </span>
                                                                )}
                                                                {version.isStarred && (
                                                                    <Star className='w-3 h-3 text-yellow-500 fill-current' />
                                                                )}
                                                            </div>
                                                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                                                                {new Date(version.createdAt).toLocaleString([], {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Author */}
                                                <div className='flex items-center gap-2 mb-3'>
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <button className='flex items-center gap-2'>
                                                                <UserAvatar
                                                                    name={version?.author?.data?.name}
                                                                    bgColor={version?.author?.color}
                                                                    size='xs'
                                                                    showTooltip
                                                                />
                                                                <span className='text-sm font-medium text-gray-700 dark:text-gray-200 truncate'>
                                                                    {version?.author?.data?.name}
                                                                </span>
                                                            </button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className='text-xs w-fit'>
                                                            {version?.author?.data?.email}
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>

                                                {/* Collaborators */}
                                                <div className='mb-3'>
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                                            Collaborators ({version.collaborators.length})
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-col gap-1'>
                                                        {version.collaborators.map((c, i) => (
                                                            <div
                                                                key={i}
                                                                className='flex items-center gap-1.5 rounded-full'
                                                            >
                                                                <HoverCard>
                                                                    <HoverCardTrigger asChild>
                                                                        <button className='flex items-center gap-1.5'>
                                                                            <UserAvatar
                                                                                name={c?.user?.name}
                                                                                bgColor={c?.color}
                                                                                size='xs'
                                                                                showTooltip
                                                                            />
                                                                            <span className='text-xs text-gray-700 dark:text-gray-200 truncate'>
                                                                                {c.user?.name}
                                                                            </span>
                                                                        </button>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent className='text-xs w-fit'>
                                                                        {version?.author?.data?.email}
                                                                    </HoverCardContent>
                                                                </HoverCard>
                                                                <span
                                                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                                        {
                                                                            owner: 'text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
                                                                            editor: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
                                                                            Viewer: 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800/30',
                                                                        }[c.role]
                                                                    }`}
                                                                >
                                                                    {c.role.charAt(0).toUpperCase() + c.role.slice(1)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Changes Summary */}
                                                {version.description && (
                                                    <div className='mb-3'>
                                                        <div className='text-xs leading-relaxed bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg'>
                                                            {expandedVersions[version._id]
                                                                ? version.description
                                                                : `${version.description.slice(0, 80)}${
                                                                      version.description.length > 80 ? '...' : ''
                                                                  }`}
                                                            {version?.description?.length > 80 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleExpanded(version._id);
                                                                    }}
                                                                    className='ml-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                                                >
                                                                    {expandedVersions[version._id]
                                                                        ? 'Show less'
                                                                        : 'Show more'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
                                                        <span>{version.wordCount} words</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {selectedVersion?._id === version._id && (
                                                <div className='px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-600'>
                                                    <div className='grid grid-cols-2 gap-2'>
                                                        {!version.isCurrentVersion && (
                                                            <button
                                                                onClick={() => handleRestore(version)}
                                                                className='flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium'
                                                            >
                                                                <RotateCcw className='w-3 h-3' />
                                                                Restore
                                                            </button>
                                                        )}

                                                        <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
                                                            <DialogTrigger asChild>
                                                                <button
                                                                    type='button'
                                                                    className='
                                                                        flex items-center justify-center gap-1
                                                                        px-4 py-2
                                                                        text-xs font-medium
                                                                        text-white
                                                                        bg-green-600 hover:bg-green-700
                                                                        dark:bg-green-500 dark:hover:bg-green-600
                                                                        rounded-lg
                                                                        focus:outline-none
                                                                        transition-colors duration-200
                                                                        shadow-sm
                                                                        '
                                                                    onClick={() => {
                                                                        setVersionName(selectedVersion.name);
                                                                        setVersionDescription(
                                                                            selectedVersion.description,
                                                                        );
                                                                    }}
                                                                >
                                                                    {isUpdating ? (
                                                                        <>
                                                                            <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                                            Renaming...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Edit2 className='size-4' />
                                                                            Rename
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </DialogTrigger>

                                                            <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 px-5 py-4'>
                                                                <DialogHeader>
                                                                    <DialogTitle className='font-medium dark:text-white text-gray-900'>
                                                                        Name this version
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                            Give your version a name to make it easier
                                                                            to identify.
                                                                        </p>
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                {/* Version Name Input */}
                                                                <div className=''>
                                                                    <Label
                                                                        htmlFor='version-name'
                                                                        className='mb-4 block'
                                                                    >
                                                                        Version Name (optional)
                                                                    </Label>
                                                                    <div className='relative'>
                                                                        <AiOutlineHistory
                                                                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-10 ${
                                                                                isFocused
                                                                                    ? 'text-green-500 dark:text-green-400'
                                                                                    : 'text-gray-400 dark:text-gray-500'
                                                                            }`}
                                                                        />
                                                                        <input
                                                                            id='version-name'
                                                                            type='text'
                                                                            placeholder='Enter version name...'
                                                                            value={versionName}
                                                                            onChange={(e) =>
                                                                                setVersionName(e.target.value)
                                                                            }
                                                                            onFocus={() => setIsFocused(true)}
                                                                            onBlur={() =>
                                                                                setTimeout(() => setIsFocused(false), 0)
                                                                            }
                                                                            className={`w-full py-3 pl-10 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                                                                                isFocused
                                                                                    ? 'border-green-500 dark:border-green-400'
                                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Version Description Textarea */}
                                                                <div className=''>
                                                                    <Label
                                                                        htmlFor='version-description'
                                                                        className='mb-4 block'
                                                                    >
                                                                        Version Description (optional)
                                                                    </Label>
                                                                    <textarea
                                                                        id='version-description'
                                                                        rows={3}
                                                                        placeholder='Add a short description...'
                                                                        value={versionDescription}
                                                                        onChange={(e) =>
                                                                            setVersionDescription(e.target.value)
                                                                        }
                                                                        className='w-full min-h-12 max-h-20 custom-scrollbar p-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                                                            transition-all duration-200 focus:border-green-500'
                                                                    />
                                                                </div>

                                                                {/* Footer Actions */}
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <button
                                                                            type='button'
                                                                            className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </DialogClose>
                                                                    <button
                                                                        onClick={() => handleNameVersion()}
                                                                        type='submit'
                                                                        className='flex items-center justify-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md'
                                                                    >
                                                                        {isUpdating ? (
                                                                            <>
                                                                                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                                                Updating...
                                                                            </>
                                                                        ) : (
                                                                            <>Update Version</>
                                                                        )}
                                                                    </button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <button
                                                                    // className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'
                                                                    className='
                                                                        flex items-center justify-center gap-1
                                                                        px-4 py-2
                                                                        text-xs font-medium
                                                                        text-white
                                                                        bg-amber-600 hover:bg-amber-700
                                                                        dark:bg-amber-500 dark:hover:bg-amber-600
                                                                        rounded-lg
                                                                        focus:outline-none
                                                                        transition-colors duration-200
                                                                        shadow-sm
                                                                        '
                                                                >
                                                                    <Download className='w-4 h-4' />
                                                                    <span className='text-xs text-nowrap'>Export</span>
                                                                </button>
                                                            </DialogTrigger>

                                                            <DialogContent className='sm:max-w-[500px] p-0 gap-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'>
                                                                {/* Header Section */}
                                                                <div className='px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800'>
                                                                    <DialogHeader>
                                                                        <DialogTitle className='text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                                                                            <div className='w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center'>
                                                                                <Download className='w-4 h-4 text-white dark:text-slate-900' />
                                                                            </div>
                                                                            Export Document
                                                                        </DialogTitle>
                                                                        <DialogDescription className='text-sm text-slate-600 dark:text-slate-400 mt-2'>
                                                                            Select a format to download{' '}
                                                                            <span className='font-medium text-slate-900 dark:text-slate-100'>
                                                                                {selectedVersion?.name ||
                                                                                    'your document'}
                                                                            </span>
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                </div>

                                                                {/* Format Grid */}
                                                                <div className='px-6 py-5 space-y-2 max-h-[60vh] overflow-y-auto'>
                                                                    {formats.map((format) => {
                                                                        const Icon = format.icon;
                                                                        const isDownloading =
                                                                            downloadingFormat === format.type;
                                                                        const isCompleted =
                                                                            completedFormat === format.type;
                                                                        const isDisabled =
                                                                            downloadingFormat !== null &&
                                                                            !isDownloading;

                                                                        return (
                                                                            <button
                                                                                key={format.type}
                                                                                onClick={() =>
                                                                                    handleFormatDownload(format)
                                                                                }
                                                                                disabled={isDisabled}
                                                                                className={`group w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                                                                                    isDisabled
                                                                                        ? 'opacity-40 cursor-not-allowed'
                                                                                        : `${format.borderColorLight} ${format.borderColorDark} ${format.hoverBgLight} ${format.hoverBgDark} hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 hover:scale-[1.02] active:scale-[0.98]`
                                                                                } focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 relative overflow-hidden`}
                                                                            >
                                                                                {/* Background Effect */}
                                                                                <div
                                                                                    className={`absolute inset-0 ${format.bgColorLight} ${format.bgColorDark} opacity-50`}
                                                                                />

                                                                                {/* Popular Badge */}
                                                                                {format.popular &&
                                                                                    !isDownloading &&
                                                                                    !isCompleted && (
                                                                                        <div className='absolute top-2 right-2 px-2 py-0.5 bg-amber-400 dark:bg-amber-500 text-amber-900 dark:text-amber-950 text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm'>
                                                                                            <Sparkles className='w-3 h-3' />
                                                                                            Popular
                                                                                        </div>
                                                                                    )}

                                                                                <div className='relative flex items-center gap-4 flex-1'>
                                                                                    {/* Icon */}
                                                                                    <div
                                                                                        className={`flex-shrink-0 w-12 h-12 rounded-lg ${
                                                                                            format.iconBgLight
                                                                                        } ${format.iconBgDark} border ${
                                                                                            format.iconBorderLight
                                                                                        } ${
                                                                                            format.iconBorderDark
                                                                                        } flex items-center justify-center transition-transform ${
                                                                                            !isDisabled &&
                                                                                            'group-hover:scale-110'
                                                                                        }`}
                                                                                    >
                                                                                        {isDownloading ? (
                                                                                            <Loader2
                                                                                                className={`w-6 h-6 ${format.colorLight} ${format.colorDark} animate-spin`}
                                                                                            />
                                                                                        ) : isCompleted ? (
                                                                                            <CheckCircle2 className='w-6 h-6 text-green-600 dark:text-green-400' />
                                                                                        ) : (
                                                                                            <Icon
                                                                                                className={`w-6 h-6 ${format.colorLight} ${format.colorDark}`}
                                                                                            />
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Text Content */}
                                                                                    <div className='flex-1 text-left min-w-0'>
                                                                                        <div className='flex items-center gap-2'>
                                                                                            <h4 className='font-semibold text-slate-900 dark:text-slate-100 text-sm'>
                                                                                                {format.label}
                                                                                            </h4>
                                                                                            <span className='text-xs font-mono text-slate-500 dark:text-slate-400'>
                                                                                                .{format.type}
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate'>
                                                                                            {format.description}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Status/Action */}
                                                                                <div className='relative flex-shrink-0 ml-3'>
                                                                                    {isDownloading ? (
                                                                                        <div className='text-right'>
                                                                                            <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
                                                                                                Preparing...
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : isCompleted ? (
                                                                                        <div className='flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800/50'>
                                                                                            <CheckCircle2 className='w-3.5 h-3.5' />
                                                                                            <span className='text-xs font-medium'>
                                                                                                Downloaded
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <ArrowRight
                                                                                            className={`w-5 h-5 ${
                                                                                                format.colorLight
                                                                                            } ${
                                                                                                format.colorDark
                                                                                            } transition-transform ${
                                                                                                !isDisabled &&
                                                                                                'group-hover:translate-x-1'
                                                                                            }`}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Footer Info */}
                                                                <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800'>
                                                                    <div className='flex items-start gap-3'>
                                                                        <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center'>
                                                                            <Sparkles className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                                                                        </div>
                                                                        <div className='flex-1'>
                                                                            <p className='text-xs font-medium text-slate-900 dark:text-slate-100 mb-0.5'>
                                                                                Quick Tip
                                                                            </p>
                                                                            <p className='text-xs text-slate-600 dark:text-slate-400 leading-relaxed'>
                                                                                PDF is ideal for viewing and printing,
                                                                                while DOCX allows full editing
                                                                                capabilities.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Dialog
                                                            open={showCloningModal}
                                                            onOpenChange={setShowCloningModal}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <button
                                                                    onClick={() => {
                                                                        setVersionName(selectedVersion.name);
                                                                        setVersionDescription(
                                                                            selectedVersion.description,
                                                                        );
                                                                    }}
                                                                    // className='flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'
                                                                    className='flex items-center justify-center gap-1
                                                                        text-xs font-medium
                                                                        text-white
                                                                        bg-purple-600 hover:bg-purple-700
                                                                        dark:bg-purple-500 dark:hover:bg-purple-600
                                                                        rounded-lg
                                                                        focus:outline-none
                                                                        transition-colors duration-200
                                                                        shadow-sm'
                                                                >
                                                                    <Copy className='size-3' />
                                                                    <span className='py-2'>Clone</span>
                                                                </button>
                                                            </DialogTrigger>

                                                            <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 px-5 py-4'>
                                                                <DialogHeader>
                                                                    <DialogTitle className='font-medium dark:text-white text-gray-900'>
                                                                        Clone this version
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                            Preserve this version by saving a duplicate
                                                                            record in the database.
                                                                        </p>
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                {/* Version Name Input */}
                                                                <div className=''>
                                                                    <Label
                                                                        htmlFor='version-name'
                                                                        className='mb-4 block'
                                                                    >
                                                                        Version Name (optional)
                                                                    </Label>
                                                                    <div className='relative'>
                                                                        <AiOutlineHistory
                                                                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-10 ${
                                                                                isFocused
                                                                                    ? 'text-purple-500 dark:text-purple-500'
                                                                                    : 'text-gray-400 dark:text-gray-500'
                                                                            }`}
                                                                        />
                                                                        <input
                                                                            id='version-name'
                                                                            type='text'
                                                                            placeholder='Enter version name...'
                                                                            value={versionName}
                                                                            onChange={(e) =>
                                                                                setVersionName(e.target.value)
                                                                            }
                                                                            onFocus={() => setIsFocused(true)}
                                                                            onBlur={() =>
                                                                                setTimeout(() => setIsFocused(false), 0)
                                                                            }
                                                                            className={`w-full py-3 pl-10 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                                                                                isFocused
                                                                                    ? 'border-purple-500 dark:border-purple-500'
                                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Version Description Textarea */}
                                                                <div className=''>
                                                                    <Label
                                                                        htmlFor='version-description'
                                                                        className='mb-4 block'
                                                                    >
                                                                        Version Description (optional)
                                                                    </Label>
                                                                    <textarea
                                                                        id='version-description'
                                                                        rows={3}
                                                                        placeholder='Add a short description...'
                                                                        value={versionDescription}
                                                                        onChange={(e) =>
                                                                            setVersionDescription(e.target.value)
                                                                        }
                                                                        className='w-full min-h-12 max-h-20 custom-scrollbar p-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                                                            transition-all duration-200 focus:border-purple-500'
                                                                    />
                                                                </div>

                                                                {/* Footer Actions */}
                                                                <DialogFooter>
                                                                    <DialogClose asChild>
                                                                        <button
                                                                            type='button'
                                                                            className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </DialogClose>
                                                                    <button
                                                                        onClick={() => duplicateSelectedVersion()}
                                                                        type='submit'
                                                                        // className='flex items-center justify-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md'
                                                                        className='
                                                                                    flex items-center justify-center
                                                                                    px-5 py-2.5
                                                                                    bg-purple-600 text-white
                                                                                    hover:bg-purple-700
                                                                                    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
                                                                                    rounded-lg
                                                                                    font-medium
                                                                                    transition-colors duration-200
                                                                                    shadow-sm
                                                                                    '
                                                                    >
                                                                        {iscloneLoading ? (
                                                                            <>
                                                                                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                                                Cloning...
                                                                            </>
                                                                        ) : (
                                                                            <>Clone Version</>
                                                                        )}
                                                                    </button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        {!version.isCurrentVersion && (
                                                            // button to remove the version
                                                            <Dialog
                                                                open={showRemoveModal}
                                                                onOpenChange={setShowRemoveModal}
                                                            >
                                                                <DialogTrigger asChild>
                                                                    <button
                                                                        type='button'
                                                                        className='col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-600 text-xs rounded-lg font-medium'
                                                                    >
                                                                        {isDeleteLoading ? (
                                                                            <>
                                                                                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                                                Removing...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Trash2 className='size-4' />
                                                                                Remove this version
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </DialogTrigger>

                                                                <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 p-5'>
                                                                    <DialogHeader>
                                                                        <DialogTitle className='text-lg font-semibold'>
                                                                            Remove this version
                                                                        </DialogTitle>
                                                                        <DialogDescription className='text-md'>
                                                                            <p
                                                                                className={`dark:text-gray-300 text-md text-gray-600`}
                                                                            >
                                                                                This version will be permanently
                                                                                deleted. This action cannot be undone.
                                                                            </p>
                                                                        </DialogDescription>
                                                                    </DialogHeader>

                                                                    <DialogFooter className='flex justify-end gap-2'>
                                                                        <DialogClose asChild>
                                                                            <Button
                                                                                type='button'
                                                                                variant='secondary'
                                                                                className='p-5 bg-gray-800 text-white hover:bg-gray-700 rounded-md'
                                                                                onClick={async () => {
                                                                                    setShowRemoveModal(false);
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <Button
                                                                            type='button'
                                                                            variant='primary'
                                                                            onClick={async () => {
                                                                                await removeVersion(
                                                                                    selectedVersion._id,
                                                                                );
                                                                                setShowRemoveModal(false);
                                                                            }}
                                                                            className='p-5 text-md bg-red-600 text-white hover:bg-red-700 rounded-md'
                                                                            disabled={isDeleteLoading}
                                                                        >
                                                                            {isDeleteLoading ? (
                                                                                <>
                                                                                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                                                                                    Removing...
                                                                                </>
                                                                            ) : (
                                                                                'Remove'
                                                                            )}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionComponent;
