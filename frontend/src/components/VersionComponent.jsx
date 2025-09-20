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
    Loader2,
} from 'lucide-react';
import { createNamedSnapshot, applySnapshotToDoc } from '../util/yjsSnapshots';
import * as Y from 'yjs';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { AiOutlineHistory } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useSaveVersionMutation, useGetAllversionsQuery } from '../api/docApi';
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

import TurndownService from 'turndown';

export const VersionViewer = ({ versionUpdateBase64, onEditorReady }) => {
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
    const [expandedVersions, setExpandedVersions] = useState({});
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [versionName, setVersionName] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const [previewEditor, setPreviewEditor] = useState(null);

    const [restoreLoading, setIsRestoreLoading] = useState(false);

    const { editorId } = useParams();
    const { ydoc, awareness, assignedColor } = useSocket();
    const user = useSelector((state) => state.user.user);

    const [saveVersion] = useSaveVersionMutation();
    const [deleteVersion, { isLoading: isDeleteLoading }] = useDeleteVersionMutation();
    const [updateVersion, { isLoading: isUpdating }] = useUpdateVersionMutation();

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

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className={`dark:bg-gray-800 bg-white rounded-lg p-6 max-w-md w-full mx-4`}>
                    <h3 className={`text-lg font-medium mb-4 dark:text-white text-gray-900`}>{title}</h3>
                    {children}
                </div>
            </div>
        );
    };

    const navigate = useNavigate();

    const handleDownload = (editor, format, versionName = 'version') => {
        if (!editor) return;

        let blob, fileName;

        // FIXME: bullet points or showing in inline and other formats also
        switch (format) {
            case 'txt': {
                const walker = editor.state.doc.content.content.map((node) => {
                    if (node.type.name === 'image') {
                        const src = node.attrs?.src || '[Image]';
                        return `[Image: ${src}]`;
                    }
                    return node.textContent;
                });

                const plainText = walker.join('\n\n');
                blob = new Blob([plainText], { type: 'text/plain' });
                fileName = `${versionName}.txt`;
                break;
            }

            // NOTE: md file is working fine.
            case 'md': {
                const turndownService = new TurndownService();

                // === Highlight with colors ===
                turndownService.addRule('markWithColor', {
                    filter: 'mark',
                    replacement: (content, node) => {
                        const color = node.getAttribute('data-color') || node.style.backgroundColor || '';

                        // const colorMap = {
                        //     'var(--tt-color-highlight-yellow)': '#faf594',
                        //     'var(--tt-color-highlight-green)': '#99f9bb',
                        //     'var(--tt-color-highlight-blue)': '#9ab2ff',
                        //     'var(--tt-color-highlight-purple)': '#c697f9',
                        //     'var(--tt-color-highlight-red)': 'hsl(356, 90%, 77%)',
                        //     'var(--tt-color-highlight-gray)': 'rgb(190, 190, 188)',
                        //     'var(--tt-color-highlight-brown)': 'rgb(132, 97, 97)',
                        //     'var(--tt-color-highlight-orange)': 'rgb(252, 176, 99)',
                        //     'var(--tt-color-highlight-pink)': 'rgb(222, 96, 212)',

                        //     'var(--tt-color-highlight-yellow-contrast)': '#faf594',
                        //     'var(--tt-color-highlight-green-contrast)': '#94feb7',
                        //     'var(--tt-color-highlight-blue-contrast)': '#9ed7fe',
                        //     'var(--tt-color-highlight-purple-contrast)': '#c99cfc',
                        //     'var(--tt-color-highlight-red-contrast)': '#ffccd0',
                        //     'var(--tt-color-highlight-gray-contrast)': 'rgba(84, 72, 49, 0.15)',
                        //     'var(--tt-color-highlight-brown-contrast)': 'rgba(210, 162, 141, 0.35)',
                        //     'var(--tt-color-highlight-orange-contrast)': 'rgba(224, 124, 57, 0.27)',
                        //     'var(--tt-color-highlight-pink-contrast)': 'rgba(225, 136, 179, 0.27)',
                        // };

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

            // NOTE: done with the html file formatting
            case 'html': {
                // Get HTML with inline styles if needed
                const style = `
                 <style>
                                
                :root {
        /****************** Basics  ******************/
        overflow-wrap: break-word;
        text-size-adjust: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        /****************** Colors variables  ******************/
        /* Gray alpha (light mode) */
        --tt-gray-light-a-50: rgba(56, 56, 56, 0.04);
        --tt-gray-light-a-100: rgba(15, 22, 36, 0.05);
        --tt-gray-light-a-200: rgba(37, 39, 45, 0.1);
        --tt-gray-light-a-300: rgba(47, 50, 55, 0.2);
        --tt-gray-light-a-400: rgba(40, 44, 51, 0.42);
        --tt-gray-light-a-500: rgba(52, 55, 60, 0.64);
        --tt-gray-light-a-600: rgba(36, 39, 46, 0.78);
        --tt-gray-light-a-700: rgba(35, 37, 42, 0.87);
        --tt-gray-light-a-800: rgba(30, 32, 36, 0.95);
        --tt-gray-light-a-900: rgba(29, 30, 32, 0.98);

        /* Gray (light mode) */
        --tt-gray-light-50: rgba(250, 250, 250, 1);
        --tt-gray-light-100: rgba(244, 244, 245, 1);
        --tt-gray-light-200: rgba(234, 234, 235, 1);
        --tt-gray-light-300: rgba(213, 214, 215, 1);
        --tt-gray-light-400: rgba(166, 167, 171, 1);
        --tt-gray-light-500: rgba(125, 127, 130, 1);
        --tt-gray-light-600: rgba(83, 86, 90, 1);
        --tt-gray-light-700: rgba(64, 65, 69, 1);
        --tt-gray-light-800: rgba(44, 45, 48, 1);
        --tt-gray-light-900: rgba(34, 35, 37, 1);

        /* Gray alpha (dark mode) */
        --tt-gray-dark-a-50: rgba(232, 232, 253, 0.05);
        --tt-gray-dark-a-100: rgba(231, 231, 243, 0.07);
        --tt-gray-dark-a-200: rgba(238, 238, 246, 0.11);
        --tt-gray-dark-a-300: rgba(239, 239, 245, 0.22);
        --tt-gray-dark-a-400: rgba(244, 244, 255, 0.37);
        --tt-gray-dark-a-500: rgba(236, 238, 253, 0.5);
        --tt-gray-dark-a-600: rgba(247, 247, 253, 0.64);
        --tt-gray-dark-a-700: rgba(251, 251, 254, 0.75);
        --tt-gray-dark-a-800: rgba(253, 253, 253, 0.88);
        --tt-gray-dark-a-900: rgba(255, 255, 255, 0.96);

        /* Gray (dark mode) */
        --tt-gray-dark-50: rgba(25, 25, 26, 1);
        --tt-gray-dark-100: rgba(32, 32, 34, 1);
        --tt-gray-dark-200: rgba(45, 45, 47, 1);
        --tt-gray-dark-300: rgba(70, 70, 73, 1);
        --tt-gray-dark-400: rgba(99, 99, 105, 1);
        --tt-gray-dark-500: rgba(124, 124, 131, 1);
        --tt-gray-dark-600: rgba(163, 163, 168, 1);
        --tt-gray-dark-700: rgba(192, 192, 195, 1);
        --tt-gray-dark-800: rgba(224, 224, 225, 1);
        --tt-gray-dark-900: rgba(245, 245, 245, 1);

        /* Brand colors */
        --tt-brand-color-50: rgba(239, 238, 255, 1);
        --tt-brand-color-100: rgba(222, 219, 255, 1);
        --tt-brand-color-200: rgba(195, 189, 255, 1);
        --tt-brand-color-300: rgba(157, 138, 255, 1);
        --tt-brand-color-400: rgba(122, 82, 255, 1);
        --tt-brand-color-500: rgba(98, 41, 255, 1);
        --tt-brand-color-600: rgba(84, 0, 229, 1);
        --tt-brand-color-700: rgba(75, 0, 204, 1);
        --tt-brand-color-800: rgba(56, 0, 153, 1);
        --tt-brand-color-900: rgba(43, 25, 102, 1);
        --tt-brand-color-950: hsla(257, 100%, 9%, 1);

        /* Green */
        --tt-color-green-inc-5: hsla(129, 100%, 97%, 1);
        --tt-color-green-inc-4: hsla(129, 100%, 92%, 1);
        --tt-color-green-inc-3: hsla(131, 100%, 86%, 1);
        --tt-color-green-inc-2: hsla(133, 98%, 78%, 1);
        --tt-color-green-inc-1: hsla(137, 99%, 70%, 1);
        --tt-color-green-base: hsla(147, 99%, 50%, 1);
        --tt-color-green-dec-1: hsla(147, 97%, 41%, 1);
        --tt-color-green-dec-2: hsla(146, 98%, 32%, 1);
        --tt-color-green-dec-3: hsla(146, 100%, 24%, 1);
        --tt-color-green-dec-4: hsla(144, 100%, 16%, 1);
        --tt-color-green-dec-5: hsla(140, 100%, 9%, 1);

        /* Yellow */
        --tt-color-yellow-inc-5: hsla(50, 100%, 97%, 1);
        --tt-color-yellow-inc-4: hsla(50, 100%, 91%, 1);
        --tt-color-yellow-inc-3: hsla(50, 100%, 84%, 1);
        --tt-color-yellow-inc-2: hsla(50, 100%, 77%, 1);
        --tt-color-yellow-inc-1: hsla(50, 100%, 68%, 1);
        --tt-color-yellow-base: hsla(52, 100%, 50%, 1);
        --tt-color-yellow-dec-1: hsla(52, 100%, 41%, 1);
        --tt-color-yellow-dec-2: hsla(52, 100%, 32%, 1);
        --tt-color-yellow-dec-3: hsla(52, 100%, 24%, 1);
        --tt-color-yellow-dec-4: hsla(51, 100%, 16%, 1);
        --tt-color-yellow-dec-5: hsla(50, 100%, 9%, 1);

        /* Red */
        --tt-color-red-inc-5: hsla(11, 100%, 96%, 1);
        --tt-color-red-inc-4: hsla(11, 100%, 88%, 1);
        --tt-color-red-inc-3: hsla(10, 100%, 80%, 1);
        --tt-color-red-inc-2: hsla(9, 100%, 73%, 1);
        --tt-color-red-inc-1: hsla(7, 100%, 64%, 1);
        --tt-color-red-base: hsla(7, 100%, 54%, 1);
        --tt-color-red-dec-1: hsla(7, 100%, 41%, 1);
        --tt-color-red-dec-2: hsla(5, 100%, 32%, 1);
        --tt-color-red-dec-3: hsla(4, 100%, 24%, 1);
        --tt-color-red-dec-4: hsla(3, 100%, 16%, 1);
        --tt-color-red-dec-5: hsla(1, 100%, 9%, 1);

        /* Basic colors */
        --white: rgba(255, 255, 255, 1);
        --black: rgba(14, 14, 17, 1);
        --transparent: rgba(255, 255, 255, 0);

        /****************** Shadow variables  ******************/
        /* Shadows Light */
        --tt-shadow-elevated-md: 0px 16px 48px 0px rgba(17, 24, 39, 0.04),
          0px 12px 24px 0px rgba(17, 24, 39, 0.04),
          0px 6px 8px 0px rgba(17, 24, 39, 0.02),
          0px 2px 3px 0px rgba(17, 24, 39, 0.02);

        /************************************************** Radius variables     **************************************************/
        --tt-radius-xxs: 0.125rem; /* 2px */
        --tt-radius-xs: 0.25rem; /* 4px */
        --tt-radius-sm: 0.375rem; /* 6px */
        --tt-radius-md: 0.5rem; /* 8px */
        --tt-radius-lg: 0.75rem; /* 12px */
        --tt-radius-xl: 1rem; /* 16px */

        /************************************************** Transition variables     **************************************************/
        --tt-transition-duration-short: 0.1s;
        --tt-transition-duration-default: 0.2s;
        --tt-transition-duration-long: 0.64s;
        --tt-transition-easing-default: cubic-bezier(0.46, 0.03, 0.52, 0.96);
        --tt-transition-easing-cubic: cubic-bezier(0.65, 0.05, 0.36, 1);
        --tt-transition-easing-quart: cubic-bezier(0.77, 0, 0.18, 1);
        --tt-transition-easing-circ: cubic-bezier(0.79, 0.14, 0.15, 0.86);
        --tt-transition-easing-back: cubic-bezier(0.68, -0.55, 0.27, 1.55);

        /****************** Contrast variables  ******************/
        --tt-accent-contrast: 8%;
        --tt-destructive-contrast: 8%;
        --tt-foreground-contrast: 8%;
      }

      :root,
      :root *,
      :root ::before,
      :root ::after {
        box-sizing: border-box;
        transition: none var(--tt-transition-duration-default)
          var(--tt-transition-easing-default);
      }

      :root {
        /************************************************** Global colors   **************************************************/
        /* Global colors - Light mode */
        --tt-bg-color: var(--white);
        --tt-border-color: var(--tt-gray-light-a-200);
        --tt-border-color-tint: var(--tt-gray-light-a-100);
        --tt-sidebar-bg-color: var(--tt-gray-light-100);
        --tt-scrollbar-color: var(--tt-gray-light-a-200);
        --tt-cursor-color: var(--tt-brand-color-500);
        --tt-selection-color: rgba(157, 138, 255, 0.2);
        --tt-card-bg-color: var(--white);
        --tt-card-border-color: var(--tt-gray-light-a-100);
      }

      /* Global colors - Dark mode */
      .dark {
        --tt-bg-color: var(--black);
        --tt-border-color: var(--tt-gray-dark-a-200);
        --tt-border-color-tint: var(--tt-gray-dark-a-100);
        --tt-sidebar-bg-color: var(--tt-gray-dark-100);
        --tt-scrollbar-color: var(--tt-gray-dark-a-200);
        --tt-cursor-color: var(--tt-brand-color-400);
        --tt-selection-color: rgba(122, 82, 255, 0.2);
        --tt-card-bg-color: var(--tt-gray-dark-50);
        --tt-card-border-color: var(--tt-gray-dark-a-50);
        --tt-shadow-elevated-md: 0px 16px 48px 0px rgba(0, 0, 0, 0.5),
          0px 12px 24px 0px rgba(0, 0, 0, 0.24),
          0px 6px 8px 0px rgba(0, 0, 0, 0.22),
          0px 2px 3px 0px rgba(0, 0, 0, 0.12);
      }

      /* Text colors */
      :root {
        --tt-color-text-gray: hsl(45, 2%, 46%);
        --tt-color-text-brown: hsl(19, 31%, 47%);
        --tt-color-text-orange: hsl(30, 89%, 45%);
        --tt-color-text-yellow: hsl(38, 62%, 49%);
        --tt-color-text-green: hsl(148, 32%, 39%);
        --tt-color-text-blue: hsl(202, 54%, 43%);
        --tt-color-text-purple: hsl(274, 32%, 54%);
        --tt-color-text-pink: hsl(328, 49%, 53%);
        --tt-color-text-red: hsl(2, 62%, 55%);

        --tt-color-text-gray-contrast: hsla(39, 26%, 26%, 0.15);
        --tt-color-text-brown-contrast: hsla(18, 43%, 69%, 0.35);
        --tt-color-text-orange-contrast: hsla(24, 73%, 55%, 0.27);
        --tt-color-text-yellow-contrast: hsla(44, 82%, 59%, 0.39);
        --tt-color-text-green-contrast: hsla(126, 29%, 60%, 0.27);
        --tt-color-text-blue-contrast: hsla(202, 54%, 59%, 0.27);
        --tt-color-text-purple-contrast: hsla(274, 37%, 64%, 0.27);
        --tt-color-text-pink-contrast: hsla(331, 60%, 71%, 0.27);
        --tt-color-text-red-contrast: hsla(8, 79%, 79%, 0.4);
      }

      .dark {
        --tt-color-text-gray: hsl(0, 0%, 61%);
        --tt-color-text-brown: hsl(18, 35%, 58%);
        --tt-color-text-orange: hsl(25, 53%, 53%);
        --tt-color-text-yellow: hsl(36, 54%, 55%);
        --tt-color-text-green: hsl(145, 32%, 47%);
        --tt-color-text-blue: hsl(202, 64%, 52%);
        --tt-color-text-purple: hsl(270, 55%, 62%);
        --tt-color-text-pink: hsl(329, 57%, 58%);
        --tt-color-text-red: hsl(1, 69%, 60%);

        --tt-color-text-gray-contrast: hsla(0, 0%, 100%, 0.09);
        --tt-color-text-brown-contrast: hsla(17, 45%, 50%, 0.25);
        --tt-color-text-orange-contrast: hsla(27, 82%, 53%, 0.2);
        --tt-color-text-yellow-contrast: hsla(35, 49%, 47%, 0.2);
        --tt-color-text-green-contrast: hsla(151, 55%, 39%, 0.2);
        --tt-color-text-blue-contrast: hsla(202, 54%, 43%, 0.2);
        --tt-color-text-purple-contrast: hsla(271, 56%, 60%, 0.18);
        --tt-color-text-pink-contrast: hsla(331, 67%, 58%, 0.22);
        --tt-color-text-red-contrast: hsla(0, 67%, 60%, 0.25);
      }

      /* Highlight colors */
      :root {
        --tt-color-highlight-yellow: #faf594;
        --tt-color-highlight-green: #99f9bb;
        --tt-color-highlight-blue: #9ab2ff;
        --tt-color-highlight-purple: #c697f9;
        --tt-color-highlight-red: hsl(356, 90%, 77%);
        --tt-color-highlight-gray: rgb(190, 190, 188);
        --tt-color-highlight-brown: rgb(132, 97, 97);
        --tt-color-highlight-orange: rgb(252, 176, 99);
        --tt-color-highlight-pink: rgb(222, 96, 212);

        --tt-color-highlight-yellow-contrast: #faf594;
        --tt-color-highlight-green-contrast: #94feb7;
        --tt-color-highlight-blue-contrast: #9ed7fe;
        --tt-color-highlight-purple-contrast: #c99cfc;
        --tt-color-highlight-red-contrast: #ffccd0;
        --tt-color-highlight-gray-contrast: rgba(84, 72, 49, 0.15);
        --tt-color-highlight-brown-contrast: rgba(210, 162, 141, 0.35);
        --tt-color-highlight-orange-contrast: rgba(224, 124, 57, 0.27);
        --tt-color-highlight-pink-contrast: rgba(225, 136, 179, 0.27);
      }

      .dark {
        --tt-color-highlight-yellow: #b1a205;
        --tt-color-highlight-green: #03a73d;
        --tt-color-highlight-blue: #046cb1;
        --tt-color-highlight-purple: #5b04b8;
        --tt-color-highlight-red: #9e030e;
        --tt-color-highlight-gray: rgb(133, 133, 131);
        --tt-color-highlight-brown: rgb(109, 66, 66);
        --tt-color-highlight-orange: rgb(171, 74, 5);
        --tt-color-highlight-pink: rgb(126, 5, 116);

        --tt-color-highlight-yellow-contrast: #58531e;
        --tt-color-highlight-green-contrast: #47855d;
        --tt-color-highlight-blue-contrast: #5e86a1;
        --tt-color-highlight-purple-contrast: #4c3564;
        --tt-color-highlight-red-contrast: #643539;
        --tt-color-highlight-gray-contrast: rgba(255, 255, 255, 0.094);
        --tt-color-highlight-brown-contrast: rgba(184, 101, 69, 0.25);
        --tt-color-highlight-orange-contrast: rgba(233, 126, 37, 0.2);
        --tt-color-highlight-pink-contrast: rgba(220, 76, 145, 0.22);
      }

      /* List styles */
      ul,ol {
        padding: 0 1rem;
        margin: 1.25rem 1rem 1.25rem 0.4rem;
      }

      ul li p, ol li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }

      /* Code and preformatted text styles */
      code {
        background-color: #F3F7F7;
        border-radius: 0.4rem;
        color: var(--black);
        font-size: 0.85rem;
        padding: 0.25em 0.3em;
      }

      pre {
        background: #F3F7F7;
        border-radius: 0.5rem;
        color: black;
        font-family: 'JetBrainsMono', monospace;
        margin: 1.5rem 0;
        padding: 0.75rem 1rem;
      }

      pre code {
        background: none;
        color: inherit;
        font-size: 0.8rem;
        padding: 0;
      }

	  /*
      blockquote {
        border-left: 4px solid #D1D5DB;
        margin: 1.5rem 0;
        padding-left: 0.6rem;
      }
      */

      hr {
        border: none;
        border-top: 1px solid #9CA3AF;
        margin: 2rem 0;
      }

	
      ul li label input[type="checkbox"] {
        appearance: none;        /* reset native styling */
        width: 1rem;
        height: 1rem;
        border: 2px solid #2940D3;  /* black border */
        border-radius: 0.25rem;  /* optional: rounded corners */
        display: inline-block;
        vertical-align: middle;
      }

      ul li label input[type="checkbox"]:checked {
        background-color: #2940D3;  /* fill when checked */
        border-color: #2940D3;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'><path d='M16.7 5.3a1 1 0 0 0-1.4-1.4L8 11.17 4.7 7.88a1 1 0 0 0-1.4 1.42l4 4a1 1 0 0 0 1.4 0l8-8z'/></svg>");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 1rem 1rem;
      }


      body {
        font-family: 'Inter', sans-serif;
      }

      /* =====================       TEXT DECORATION       ===================== */
      a {
        text-decoration: underline;
      }

      s {
        text-decoration: line-through;
      }

      u {
        text-decoration: underline;
      }

      /* =====================       BLOCKQUOTE       ===================== */
      blockquote {
        position: relative;
        padding-left: 1em;
        padding-top: 0.3em;
        margin: 1.5rem 0;
      }

      blockquote p {
        margin-top: 0;
      }

      blockquote::before,
      blockquote.is-empty::before {
        position: absolute;
        bottom: 0;
        left: 0;
        top: 0;
        height: 100%;
        width: 0.25em;
        background-color: rgba(34, 35, 37, 1);
        content: '';
        border-radius: 0;
      }

      /* =====================       EMOJI       ===================== */
      .tiptap.ProseMirror [data-type='emoji'] img {
        display: inline-block;
        width: 1.25em;
        height: 1.25em;
        cursor: text;
      }
      
      /* =====================       HORIZONTAL RULE       ===================== */
      hr {
        border: none;
        height: 1px;
        background-color: var(--tt-gray-light-a-200);
      }

      /* =====================       LINKS       ===================== */
      a {
        color: var(--tt-brand-color-500);
        text-decoration: underline;
      }

      /* =====================       LISTS       ===================== */
      ul, ol {
        margin-top: 1.5em;
        margin-bottom: 1.5em;
        padding-left: 1.5em;
      }

      ol:first-child,ul:first-child {
        margin-top: 0;
      }

      ol:last-child,
      ul:last-child {
        margin-bottom: 0;
      }

      ol ol,
      ul ul,
      ol ul,
      ul ol {
        margin-top: 0;
        margin-bottom: 0;
      }

      li p {
        margin-top: 0;
      }

      /* Ordered lists */
      ol {
        list-style: decimal;
      }

      ol ol {
        list-style: lower-alpha;
      }

      ol ol ol {
        list-style: lower-roman;
      }

      /* Unordered lists */
      ul:not([data-type="taskList"]) {
        list-style: disc;
      }

      ul:not([data-type="taskList"]) ul {
        list-style: circle;
      }

      ul:not([data-type="taskList"]) ul ul {
        list-style: disc;
      }

      /* Task lists */
      ul[data-type="taskList"] {
        padding-left: 0.25em;
      }

      ul[data-type="taskList"] li {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
      }

      ul[data-type="taskList"] li:not(:has(> p:first-child)) {
        list-style-type: none;
      }

      ul[data-type="taskList"] li[data-checked="true"] > div > p {
        opacity: 0.5;
        text-decoration: line-through;
      }

      ul[data-type="taskList"] li[data-checked="true"] > div > p span {
        text-decoration: line-through;
      }

      ul[data-type="taskList"] li label {
        position: relative;
        padding-top: 4px;
        padding-right: 8px;
      }

      ul[data-type="taskList"] li label input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      ul[data-type="taskList"] li label span {
        display: block;
        width: 1em;
        height: 1em;
        border: 1px solid var(--tt-gray-light-a-200);
        border-radius: 0.25rem;
        position: relative;
        cursor: pointer;
        background-color: var(--tt-gray-light-a-100);
        transition: background-color 80ms ease-out, border-color 80ms ease-out;
      }

      ul[data-type="taskList"] li label span::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 0.75em;
        height: 0.75em;
        background-color:  white;
        opacity: 0;
        -webkit-mask: url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat;
      }

      ul[data-type="taskList"] li label input[type="checkbox"]:checked + span {
        background: var(--tt-gray-light-a-900);
        border-color: var(--tt-gray-light-a-900);
      }

      ul[data-type="taskList"] li label input[type="checkbox"]:checked + span::before {
        opacity: 1;
      }

      ul[data-type="taskList"] li div {
        flex: 1 1 0%;
        min-width: 0;
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      img:not([data-type="emoji"] img) {
        margin: 2rem 0;
        outline: 0.125rem solid transparent;
        border-radius: 0.25rem;
      }

      img:not([data-type="emoji"] img).ProseMirror-selectednode {
        outline-color: rgba(98, 41, 255, 1);
      }

      img {
        margin: 0;
      }
                            </style>
                `;
                const html = `
                    <html>
                        <head>
                            ${style}
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

            default:
                toast.error('Unsupported format in frontend');
                return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

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
                                                <span>Restoring...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaRedo className='w-4 h-4 rotate-40' />
                                                <span>Restore Version</span>
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
                                                                    className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'
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
                                                                            Name
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

                                                        <button className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'>
                                                            <Download className='w-3 h-3' />
                                                            Download
                                                        </button>
                                                        <div className='flex flex-col gap-1'>
                                                            <button
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        previewEditor,
                                                                        'txt',
                                                                        selectedVersion.name,
                                                                    )
                                                                }
                                                            >
                                                                Download TXT
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        previewEditor,
                                                                        'md',
                                                                        selectedVersion.name,
                                                                    )
                                                                }
                                                            >
                                                                Download MD
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        previewEditor,
                                                                        'html',
                                                                        selectedVersion.name,
                                                                    )
                                                                }
                                                            >
                                                                Download HTML
                                                            </button>
                                                            <a
                                                                href={`/api/versions/${selectedVersion._id}/download?format=docx`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                Download DOCX
                                                            </a>
                                                            <a
                                                                href={`/api/versions/${selectedVersion._id}/download?format=pdf`}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                Download PDF
                                                            </a>
                                                            {/* <button onClick={() => handlePrint(previewEditor)}>
                                                                🖨️ Print
                                                            </button> */}
                                                        </div>

                                                        <button className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'>
                                                            <Copy className='w-3 h-3' />
                                                            Duplicate
                                                        </button>
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
