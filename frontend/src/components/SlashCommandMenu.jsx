import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Sparkles,
    PenLine,
    AlignVerticalDistributeCenter,
    MessageCircle,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Code,
    Minus,
} from 'lucide-react';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { aiTextToHtml } from '../util/aiTextToHtml';
import { toast } from 'sonner';

/**
 * Notion-style slash command menu.
 *
 * Detects a trailing /<query> in the current line, opens a floating menu
 * positioned at the cursor, supports up/down/enter/esc keyboard navigation,
 * and on select removes the /<query> and runs the chosen action.
 */
export default function SlashCommandMenu({ editor, onOpenAIGenerate, onOpenAsk }) {
    const [state, setState] = useState({ open: false, query: '', slashPos: null, anchor: null });
    const [activeIdx, setActiveIdx] = useState(0);
    const menuRef = useRef(null);

    // Insert the finished result as proper paragraphs. Streaming raw text token
    // by token loses paragraph breaks once the document re-renders on edit.
    const { generate } = useAIGenerate({
        onEnd: ({ fullText, insertAt }) => {
            if (!editor || !fullText || !fullText.trim()) return;
            const pos = typeof insertAt === 'number' ? insertAt : editor.state.selection.from;
            editor.chain().focus().insertContentAt(pos, aiTextToHtml(fullText)).run();
        },
    });

    // Build the command list. Keys are stable so filtering doesn't re-render unnecessarily.
    const commands = useMemo(
        () => [
            {
                section: 'AI',
                items: [
                    {
                        key: 'ai-generate',
                        label: 'Generate with AI',
                        hint: 'Open prompt to generate any content',
                        icon: Sparkles,
                        run: () => onOpenAIGenerate?.(),
                    },
                    {
                        key: 'ai-continue',
                        label: 'Continue writing',
                        hint: 'Continue the document from here',
                        icon: PenLine,
                        run: () => {
                            const text = editor.getText().trim();
                            if (text.length < 20) {
                                toast.info('Nothing to continue from', {
                                    description: 'Write a sentence or two first, then try again.',
                                });
                                return;
                            }
                            const docContext = text.length > 4000 ? text.slice(-4000) : text;
                            const insertAt = editor.state.selection.from;
                            generate({
                                instruction:
                                    'Continue writing the document from the end of the existing text. Match the existing tone exactly. Output 1–2 short paragraphs, no preface.',
                                docContext,
                                insertAt,
                            }).catch(console.error);
                        },
                    },
                    {
                        key: 'ai-summary',
                        label: 'Summarize document',
                        hint: 'Insert a TL;DR with key points',
                        icon: AlignVerticalDistributeCenter,
                        run: () => {
                            const text = editor.getText().trim();
                            if (text.length < 80) {
                                toast.info('Document is too short to summarize', {
                                    description: 'Add some content first, then try again.',
                                });
                                return;
                            }
                            const insertAt = editor.state.selection.from;
                            generate({
                                instruction:
                                    'Summarize the document into a "TL;DR" heading followed by 3–5 short bullet points covering the key takeaways. Use "- " for bullets.',
                                docContext: text,
                                insertAt,
                            }).catch(console.error);
                        },
                    },
                    {
                        key: 'ai-ask',
                        label: 'Ask the document',
                        hint: 'Open the Q&A panel',
                        icon: MessageCircle,
                        run: () => onOpenAsk?.(),
                    },
                ],
            },
            {
                section: 'Insert',
                items: [
                    {
                        key: 'h1',
                        label: 'Heading 1',
                        icon: Heading1,
                        run: () => editor.chain().focus().setNode('heading', { level: 1 }).run(),
                    },
                    {
                        key: 'h2',
                        label: 'Heading 2',
                        icon: Heading2,
                        run: () => editor.chain().focus().setNode('heading', { level: 2 }).run(),
                    },
                    {
                        key: 'h3',
                        label: 'Heading 3',
                        icon: Heading3,
                        run: () => editor.chain().focus().setNode('heading', { level: 3 }).run(),
                    },
                    {
                        key: 'bullet',
                        label: 'Bullet list',
                        icon: List,
                        run: () => editor.chain().focus().toggleBulletList().run(),
                    },
                    {
                        key: 'ordered',
                        label: 'Numbered list',
                        icon: ListOrdered,
                        run: () => editor.chain().focus().toggleOrderedList().run(),
                    },
                    {
                        key: 'tasks',
                        label: 'Task list',
                        icon: ListChecks,
                        run: () => editor.chain().focus().toggleTaskList().run(),
                    },
                    {
                        key: 'quote',
                        label: 'Quote',
                        icon: Quote,
                        run: () => editor.chain().focus().toggleBlockquote().run(),
                    },
                    {
                        key: 'code',
                        label: 'Code block',
                        icon: Code,
                        run: () => editor.chain().focus().toggleCodeBlock().run(),
                    },
                    {
                        key: 'hr',
                        label: 'Divider',
                        icon: Minus,
                        run: () => editor.chain().focus().setHorizontalRule().run(),
                    },
                ],
            },
        ],
        [editor, generate, onOpenAIGenerate, onOpenAsk],
    );

    // Flatten + filter by query
    const filtered = useMemo(() => {
        const q = state.query.trim().toLowerCase();
        const flat = [];
        for (const group of commands) {
            const matches = group.items.filter((it) => !q || it.label.toLowerCase().includes(q));
            if (matches.length) flat.push({ section: group.section, items: matches });
        }
        return flat;
    }, [commands, state.query]);

    const flatItems = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

    // Detect / and track query as the user types
    useEffect(() => {
        if (!editor) return;

        const update = () => {
            const { from, to } = editor.state.selection;
            if (from !== to) {
                setState((s) => (s.open ? { ...s, open: false } : s));
                return;
            }
            const $from = editor.state.selection.$from;
            const start = $from.start();
            const textBefore = editor.state.doc.textBetween(start, from, '\n', '\n');
            const match = textBefore.match(/(?:^|\s)\/([\w]*)$/);
            if (!match) {
                setState((s) => (s.open ? { ...s, open: false } : s));
                return;
            }
            const query = match[1] || '';
            const slashPos = from - query.length - 1;
            try {
                const coords = editor.view.coordsAtPos(slashPos);
                setState({
                    open: true,
                    query,
                    slashPos,
                    anchor: { top: coords.bottom + window.scrollY + 4, left: coords.left + window.scrollX },
                });
                setActiveIdx(0);
            } catch {
                setState((s) => (s.open ? { ...s, open: false } : s));
            }
        };

        editor.on('selectionUpdate', update);
        editor.on('update', update);
        editor.on('blur', () =>
            setTimeout(() => {
                if (!editor.isFocused) setState((s) => ({ ...s, open: false }));
            }, 150),
        );
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('update', update);
        };
    }, [editor]);

    // Keyboard navigation while menu is open
    useEffect(() => {
        if (!state.open || !editor) return;

        const onKey = (e) => {
            if (!state.open) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % Math.max(flatItems.length, 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + flatItems.length) % Math.max(flatItems.length, 1));
            } else if (e.key === 'Enter') {
                if (flatItems.length === 0) return;
                e.preventDefault();
                runItem(flatItems[activeIdx]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setState((s) => ({ ...s, open: false }));
            }
        };
        // Capture so we beat ProseMirror's enter handler.
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [state.open, flatItems, activeIdx]);

    const runItem = (item) => {
        if (!item || !editor) return;
        // Delete the /<query> we typed
        const { slashPos } = state;
        const cursor = editor.state.selection.from;
        if (typeof slashPos === 'number' && cursor > slashPos) {
            editor.chain().focus().deleteRange({ from: slashPos, to: cursor }).run();
        }
        setState({ open: false, query: '', slashPos: null, anchor: null });
        try {
            item.run();
        } catch (err) {
            console.error('[slash-command]', err);
        }
    };

    if (!state.open || !state.anchor || flatItems.length === 0) return null;

    let indexCounter = 0;

    return (
        <div
            ref={menuRef}
            className='fixed z-50 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl py-1 overflow-hidden'
            style={{ top: state.anchor.top, left: state.anchor.left }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {filtered.map((group) => (
                <div key={group.section} className='py-1'>
                    <div className='px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold'>
                        {group.section}
                    </div>
                    {group.items.map((it) => {
                        const myIndex = indexCounter++;
                        const Icon = it.icon;
                        const active = myIndex === activeIdx;
                        return (
                            <button
                                key={it.key}
                                onMouseEnter={() => setActiveIdx(myIndex)}
                                onClick={() => runItem(it)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm ${
                                    active
                                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span
                                    className={`inline-flex items-center justify-center size-7 rounded-md ${
                                        active
                                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    <Icon className='size-4' />
                                </span>
                                <span className='flex-1 min-w-0'>
                                    <div className='font-medium'>{it.label}</div>
                                    {it.hint && (
                                        <div className='text-[11px] text-gray-500 dark:text-gray-400 truncate'>
                                            {it.hint}
                                        </div>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
