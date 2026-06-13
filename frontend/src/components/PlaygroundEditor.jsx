import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Code,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    Link2,
    Sparkles,
} from 'lucide-react';

const DEFAULT_CONTENT = `
<h2>👋 Welcome to the DocWeave playground</h2>
<p>This is a <strong>real Tiptap editor</strong> — exactly the same one your team will use. Click anywhere and start typing. Try the toolbar above.</p>
<p>Things you can do right now:</p>
<ul>
  <li>Make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, or <s>struck through</s></li>
  <li>Add a <mark>highlight</mark> for emphasis</li>
  <li>Drop in a <code>code snippet</code> or a quote block</li>
</ul>
<blockquote>"It feels like Google Docs, but built for engineers." — internal beta tester</blockquote>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><div>Real-time collaboration via Yjs ✓</div></li>
  <li data-type="taskItem" data-checked="true"><div>Granular owner controls ✓</div></li>
  <li data-type="taskItem" data-checked="false"><div>Try editing this list</div></li>
</ul>
<p>Don't worry — your changes here are local. <em>No account needed to play.</em></p>
`;

const ToolButton = ({ active, disabled, onClick, label, children }) => (
    <button
        type='button'
        title={label}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-md transition-colors flex items-center justify-center
            ${
                active
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const Divider = () => <span className='w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1' />;

const PlaygroundEditor = () => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
            Subscript,
            Superscript,
            Link.configure({ openOnClick: false, autolink: true }),
            CharacterCount,
        ],
        content: DEFAULT_CONTENT,
        editorProps: {
            attributes: {
                class:
                    'prose prose-base max-w-none dark:prose-invert focus:outline-none min-h-[300px] px-6 md:px-8 py-6 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_blockquote]:border-l-4 [&_blockquote]:border-purple-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-400 [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-500/30 dark:[&_mark]:text-yellow-100 [&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:gap-2 [&_ul[data-type=taskList]_li]:items-start [&_a]:text-purple-600 dark:[&_a]:text-purple-400 [&_a]:underline',
            },
        },
    });

    if (!editor) return null;

    const count = editor.storage.characterCount?.characters?.() ?? 0;
    const words = editor.storage.characterCount?.words?.() ?? 0;

    const setLink = () => {
        const url = window.prompt('Enter URL');
        if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className='relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden'>
            {/* glow halo */}
            <div className='absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-2xl opacity-70 pointer-events-none' />

            {/* Browser chrome */}
            <div className='relative flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'>
                <div className='flex items-center gap-2 min-w-0'>
                    <span className='size-3 rounded-full bg-red-400 shrink-0' />
                    <span className='size-3 rounded-full bg-yellow-400 shrink-0' />
                    <span className='size-3 rounded-full bg-green-400 shrink-0' />
                    <span className='ml-3 text-xs text-gray-500 dark:text-gray-400 font-mono truncate'>
                        docweave.app/editor/playground
                    </span>
                </div>
                <div className='flex items-center gap-3'>
                    <span className='hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'>
                        Local-only playground
                    </span>
                    <div className='flex -space-x-2'>
                        <div className='size-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm'>
                            You
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className='sticky top-0 z-10 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                <ToolButton
                    label='Undo'
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Redo'
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className='size-4' />
                </ToolButton>
                <Divider />
                <ToolButton
                    label='Heading 1'
                    active={editor.isActive('heading', { level: 1 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Heading 2'
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Heading 3'
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className='size-4' />
                </ToolButton>
                <Divider />
                <ToolButton
                    label='Bold'
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Italic'
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Underline'
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Strikethrough'
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Highlight'
                    active={editor.isActive('highlight')}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    <Highlighter className='size-4' />
                </ToolButton>
                <Divider />
                <ToolButton
                    label='Bullet list'
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Ordered list'
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Task list'
                    active={editor.isActive('taskList')}
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                >
                    <ListChecks className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Quote'
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Code block'
                    active={editor.isActive('codeBlock')}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    <Code className='size-4' />
                </ToolButton>
                <Divider />
                <ToolButton
                    label='Align left'
                    active={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Align center'
                    active={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter className='size-4' />
                </ToolButton>
                <ToolButton
                    label='Align right'
                    active={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight className='size-4' />
                </ToolButton>
                <Divider />
                <ToolButton label='Link' active={editor.isActive('link')} onClick={setLink}>
                    <Link2 className='size-4' />
                </ToolButton>
            </div>

            {/* Editor surface */}
            <div className='bg-white dark:bg-gray-900'>
                <EditorContent editor={editor} />
            </div>

            {/* Status bar */}
            <div className='flex items-center justify-between gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400'>
                <span className='flex items-center gap-2'>
                    <Sparkles className='size-3.5 text-purple-500' />
                    Real Tiptap editor · changes stay local on this device
                </span>
                <span className='font-mono'>
                    {words} words · {count} chars
                </span>
            </div>
        </div>
    );
};

export default PlaygroundEditor;
