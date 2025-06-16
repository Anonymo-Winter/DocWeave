import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
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

import { setupYjs } from '@/util/y-socket-provider.js';
import { Redo2, Undo2 } from 'lucide-react';
import { useSocket } from '../context/socketContext.jsx';
import { toast } from 'sonner';
import { tailwindColorNames } from '../util/colorMapper.js';
import { encodeAwarenessUpdate } from 'y-protocols/awareness.js';

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile, editor }) => {
    return (
        <>
            <Spacer />
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
    const isMobile = useMobile();
    const windowSize = useWindowSize();
    const [mobileView, setMobileView] = React.useState('main');
    const toolbarRef = React.useRef(null);
    const { socket, isConnected } = useSocket();
    const editor = useEditor({
        immediatelyRender: false,
        editorProps: {
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                'aria-label': 'Main content area, start typing to enter text.',
            },
        },
        extensions: [
            StarterKit.configure({
                history: false,
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
        ],
        content: '<p>Start writing...</p>',
    });

    const bodyRect = useCursorVisibility({
        editor,
        overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    });

    const editorRef = React.useRef(null);

    React.useEffect(() => {
        if (editor && editorRef.current !== editor) {
            editorRef.current = editor; // Mark that we’ve already initialized Yjs on this instance

            const roomId = 'doc123';

            const colorNames = Object.keys(tailwindColorNames);

            // Pick a random name
            const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

            // Create or retrieve user metadata
            const userMeta = JSON.parse(localStorage.getItem('user-detail') || 'null') || {
                name: 'Tarun' + Math.floor(Math.random() * 1000),
                color: randomColorName,
            };

            localStorage.setItem('user-detail', JSON.stringify(userMeta));

            const { awareness, ydoc } = setupYjs(editor, roomId, userMeta, socket.current);

            const cleanup = () => {
                awareness.setLocalState(null);
            };

            window.addEventListener('beforeunload', cleanup);

            return () => {
                const update = encodeAwarenessUpdate(awareness, [], [], [awareness.clientID]);
                socket.current?.emit('awareness-update', update);
                awareness.setLocalState(null);
                ydoc.destroy();

                if (socket.current) {
                    socket.current.off('sync');
                    socket.current.off('update');
                    socket.current.off('awareness-update');
                    socket.current.emit('leave-room', { roomId });
                }

                window.removeEventListener('beforeunload', cleanup);
            };
        }
    }, [editor]);

    React.useEffect(() => {
        if (!isMobile && mobileView !== 'main') {
            setMobileView('main');
        }
    }, [isMobile, mobileView]);

    React.useEffect(() => {
        if (editor) {
            editor.commands.focus('end'); // You can use 'start' or a number too
        }
    }, [editor]);

    if (!editor) {
        return 'loading...';
    }

    return (
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
            <div className='w-full flex-1 overflow-auto h-full' onClick={() => editor.commands.focus()}>
                <EditorContent editor={editor} role='presentation' className='z-10 sm:m-1 md:m-3 lg:m-5 xl:m-10' />
            </div>
        </EditorContext>
    );
}

export default SimpleEditor;
