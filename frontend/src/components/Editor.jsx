import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { Editor } from '@tiptap/react';

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
import CharacterCount from '@tiptap/extension-character-count';

// --- Tiptap Core Extensions ---
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';

// --- Custom Extensions ---
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { NodeButton } from '@/components/tiptap-ui/node-button';
import { HighlightPopover, HighlightContent, HighlighterButton } from '@/components/tiptap-ui/highlight-popover';
import { LinkPopover, LinkContent, LinkButton } from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
// import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';

// --- Hooks ---
import { useMobile } from '@/hooks/use-mobile';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Components ---
import { ThemeToggle } from '@/components/tiptap-templates/simple/theme-toggle.tsx';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';
import '@/components/tiptap-ui-primitive/button/button.scss';

// --- Tiptap Node ---
// import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

import { Redo2, Undo2, XCircle } from 'lucide-react';
import { useSocket } from '../context/socketContext.jsx';
import { useSelector } from 'react-redux';
import { useGetVersionQuery, useSaveVersionMutation } from '../api/docApi.js';

import * as Y from 'yjs';
import { useParams } from 'react-router-dom';
import { Buffer } from 'buffer';
import ErrorPage from './ErrorMessage.jsx';

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile, editor }) => {
    return (
        <>
            <ToolbarGroup>
                <Button
                    disabled={!editor.storage.undoManager?.canUndo()}
                    onClick={() => editor.storage.undoManager.undo()}
                >
                    <Undo2 className='size-4' />
                </Button>

                <Button
                    disabled={!editor.storage.undoManager?.canRedo()}
                    onClick={() => editor.storage.undoManager.redo()}
                >
                    <Redo2 className='size-4' />
                </Button>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
                <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
                <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
                <NodeButton type='codeBlock' />
                <NodeButton type='blockquote' />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
                <MarkButton type='bold' />
                <MarkButton type='italic' />
                <MarkButton type='strike' />
                <MarkButton type='code' />
                <MarkButton type='underline' />
                {!isMobile ? <HighlightPopover /> : <HighlighterButton onClick={onHighlighterClick} />}
                {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
                <MarkButton type='superscript' />
                <MarkButton type='subscript' />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
                <TextAlignButton align='left' />
                <TextAlignButton align='center' />
                <TextAlignButton align='right' />
                <TextAlignButton align='justify' />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
                <ImageUploadButton text='Add' />
            </ToolbarGroup>
            <Spacer />
            {isMobile && <ToolbarSeparator />}
            <ToolbarGroup>
                <ThemeToggle />
            </ToolbarGroup>
        </>
    );
};

const MobileToolbarContent = ({ type, onBack }) => (
    <>
        <ToolbarGroup>
            <Button data-style='ghost' onClick={onBack}>
                <ArrowLeftIcon className='tiptap-button-icon' />
                {type === 'highlighter' ? (
                    <HighlighterIcon className='tiptap-button-icon' />
                ) : (
                    <LinkIcon className='tiptap-button-icon' />
                )}
            </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        {type === 'highlighter' ? <HighlightContent /> : <LinkContent />}
    </>
);

export function SimpleEditor() {
    const user = useSelector((state) => state.user.user);
    const { ydoc, awareness, assignedColor } = useSocket();
    const [editor, setEditor] = React.useState(null);
    const isMobile = useMobile();
    const windowSize = useWindowSize();
    const [mobileView, setMobileView] = React.useState('main');
    const toolbarRef = React.useRef(null);
    const { editorId } = useParams();
    const [saveVersion] = useSaveVersionMutation();
    const [updateApplied, setUpdateApplied] = React.useState(false);
    const [isInitialized, setIsInitialized] = React.useState(false);

    const bodyRect = useCursorVisibility({
        editor,
        overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    });

    const { data, isLoading: isVersionLoading, error } = useGetVersionQuery({ editorId });

    React.useEffect(() => {
        if (data) {
            console.log('📊 Fetched version data:', data);
            console.log('📊 Version update length:', data.version?.update?.length);
            console.log('📊 Version word count:', data.version?.wordCount);
        }
    }, [data]);

    // Stable references to prevent recreation
    const extensions = React.useMemo(() => {
        if (!ydoc || !awareness || !assignedColor) return null;

        return [
            StarterKit.configure({ history: false }),
            CharacterCount.configure({
                mode: 'nodeSize',
            }),
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
            ImageUploadNode.configure({
                accept: 'image/*',
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error('Upload failed:', error),
            }),
            TrailingNode,
            Link.configure({ openOnClick: false }),
            Collaboration.configure({
                document: ydoc,
                field: 'default',
            }),
            CollaborationCursor.configure({
                provider: { awareness },
                user: {
                    name: user?.name || 'Anonymous',
                    color: assignedColor,
                    clientId: user?._id || 'anonymous-id',
                },
            }),
        ];
    }, [ydoc, awareness, assignedColor, user]);

    // React.useEffect(() => {
    //     if (!extensions || !isInitialized || editor) return;

    //     console.log('🚀 Creating editor...');
    //     const newEditor = new Editor({
    //         extensions,
    //         onCreate: ({ editor }) => {
    //             console.log('🎯 Editor created successfully');
    //             console.log('🎯 Editor HTML:', editor.getHTML());
    //             console.log('🎯 Editor JSON:', editor.getJSON());
    //         },
    //         onUpdate: ({ editor }) => {
    //             console.log('📝 Editor updated:', editor.getHTML());
    //         },
    //     });

    //     setEditor(newEditor);

    //     // return () => {
    //     //     console.log('🗑️ Destroying editor');
    //     //     newEditor?.destroy();
    //     // };
    // }, [extensions, isInitialized, editor]);

    React.useEffect(() => {
        if (!extensions || !isInitialized || editor) return;

        console.log('🚀 Creating editor with current Ydoc state...');
        const newEditor = new Editor({
            extensions,
        });

        setEditor(newEditor);

        return () => {
            // newEditor?.destroy();
        };
    }, [extensions, isInitialized]);

    React.useEffect(() => {
        if (!editor || !ydoc) return;

        const interval = setInterval(() => {
            const editorContent = editor.getHTML();
            const yjsContent = ydoc.getXmlFragment('default').toString();
            // console.log('Sync Check:', { editorContent, yjsContent });
        }, 5000);

        return () => clearInterval(interval);
    }, [editor, ydoc]);

    React.useEffect(() => {
        if (!isMobile && mobileView !== 'main') {
            setMobileView('main');
        }
    }, [isMobile, mobileView]);

    // React.useEffect(() => {
    //     if (!editor || !ydoc) return;

    //     const checkSync = () => {
    //         console.log('🔍 Sync check:');
    //         console.log('  - Editor HTML:', editor.getHTML());
    //         console.log('  - Editor JSON:', editor.getJSON());
    //         console.log('  - Ydoc content:', ydoc.getXmlFragment('default').toString());
    //         console.log('  - Word count:', editor.storage.characterCount?.words?.() || 0);
    //     };

    //     // Check initial sync
    //     setTimeout(checkSync, 100);
    //     setTimeout(checkSync, 500);
    //     setTimeout(checkSync, 1000);

    //     // Monitor Ydoc changes
    //     const observer = () => {
    //         console.log('📡 Ydoc changed, checking editor sync...');
    //         setTimeout(checkSync, 100);
    //     };

    //     ydoc.on('update', observer);
    //     return () => ydoc.off('update', observer);
    // }, [editor, ydoc]);

    // React.useEffect(() => {
    //     if (editor) {
    //         editor.commands.focus('end'); // You can use 'start' or a number too
    //     }
    // }, [editor]);

    // In SimpleEditor component
    React.useEffect(() => {
        if (!ydoc || !data?.version?.update || isInitialized) return;

        const initialize = async () => {
            try {
                console.log('🔄 Starting to apply version to Ydoc...');

                // Handle empty document case
                if (!data.version.update || data.version.update.length === 0) {
                    const fragment = ydoc.getXmlFragment('default');
                    if (fragment.length === 0) {
                        fragment.insert(0, [new Y.XmlElement('p')]);
                    }
                    setIsInitialized(true);
                    return;
                }

                // Convert base64 to binary
                const binaryData = Buffer.from(data.version.update, 'base64');

                // Apply update
                Y.applyUpdate(ydoc, binaryData);

                console.log('✅ Version applied to Ydoc successfully');
                setIsInitialized(true);
            } catch (err) {
                console.error('❌ Failed to apply version:', err);
                setIsInitialized(true); // Still continue even if version load fails
            }
        };

        initialize();
    }, [ydoc, data?.version?.update, isInitialized]);

    const handleSave = async () => {
        if (!editor || !ydoc || !awareness) {
            console.warn('❌ Cannot save version: editor or Ydoc missing');
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

            const collaborators = Array.from(awareness.getStates()).map(([clientId, state]) => ({
                name: state?.user?.name || 'Anonymous',
                clientId,
            }));

            const res = await saveVersion({
                documentId: editorId,
                update: updateBase64,
                name: `Version ${new Date().toLocaleString()}`,
                author: { _id: user._id, name: user.name },
                wordCount: editor.storage.characterCount.words(),
                collaborators,
            });

            console.log('✅ Version saved:', res);
        } catch (err) {
            console.error('❌ Failed to save version:', err);
        }
    };

    const forceSync = () => {
        if (!editor || !ydoc) return;

        console.log('🔄 Forcing editor re-sync...');

        // Get the current Ydoc state
        const fragment = ydoc.getXmlFragment('default');
        console.log('📄 Current Ydoc fragment:', fragment.toString());

        // Try to manually trigger editor update
        editor.commands.focus();
        editor.view.dispatch(editor.view.state.tr);

        console.log('🔄 Re-sync completed');
    };

    // React.useEffect(() => {
    //     const interval = setInterval(async () => {
    //         console.log('Autosaving document...');
    //         if (editor && ydoc) {
    //             const update = Y.encodeStateAsUpdate(ydoc);
    //             const updateBase64 = Buffer.from(update).toString('base64');

    //             const res = await saveVersion({
    //                 documentId: editorId,
    //                 update: updateBase64,
    //                 name: `Version ${new Date().toLocaleString()}`,
    //                 author: { _id: user._id, name: user.name },
    //                 wordCount: editor.storage.characterCount.words(),
    //                 collaborators: Array.from(awareness.getStates()).map(([clientId, state]) => ({
    //                     name: state?.user?.name || 'Anonymous',
    //                     clientId,
    //                 })),
    //             });
    //             console.log(res);
    //         }
    //     }, 6000); // every 60 seconds

    //     return () => clearInterval(interval);
    // }, [editor, ydoc]);

    if (error) {
        return <ErrorPage error={error} />;
    }

    if (!editor || isVersionLoading || !isInitialized) {
        return (
            <div className='h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/10 flex items-center justify-center'>
                <div className='flex flex-col items-center space-y-4'>
                    <div className='relative'>
                        <div className='w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin'></div>
                        <div className='absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 dark:border-r-blue-300 rounded-full animate-spin animation-delay-150'></div>
                    </div>
                    <div className='text-center'>
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1'>
                            Initializing Editor
                        </h3>
                        <p className='text-sm text-slate-500 dark:text-slate-400 animate-pulse'>
                            Setting up your workspace...
                        </p>
                    </div>
                    <div className='w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
                        <div className='h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full animate-pulse'></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='max-h-[calc(100vh-6rem)] h-full w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col'>
            <EditorContext value={{ editor }}>
                <Toolbar
                    ref={toolbarRef}
                    style={
                        isMobile
                            ? {
                                  bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                              }
                            : {}
                    }
                    className='h-16 border-b border-gray-200 dark:border-gray-700 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800'
                >
                    {mobileView === 'main' ? (
                        <MainToolbarContent
                            editor={editor}
                            onHighlighterClick={() => setMobileView('highlighter')}
                            onLinkClick={() => setMobileView('link')}
                            isMobile={isMobile}
                        />
                    ) : (
                        <MobileToolbarContent
                            type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                            onBack={() => setMobileView('main')}
                        />
                    )}
                </Toolbar>
                <div className='h-full overflow-y-auto custom-scrollbar'>
                    {/* // ${isReadOnly ? 'select-text' : ''} */}
                    <div className={`prose dark:prose-invert max-w-none p-4 `}>
                        <EditorContent editor={editor} role='presentation' />
                    </div>
                </div>
            </EditorContext>
            {/* <div className='fixed bottom-4 right-4 flex gap-2'>
                <button onClick={handleSave} className='bg-blue-500 text-white px-4 py-2 rounded'>
                    Save Version
                </button>
                <button onClick={forceSync} className='bg-green-500 text-white px-4 py-2 rounded'>
                    Force Sync
                </button>
            </div> */}
        </div>
    );
}

export default SimpleEditor;
