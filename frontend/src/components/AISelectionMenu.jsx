import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAIRewrite } from '../hooks/useAIRewrite';
import {
    Sparkles,
    Loader2,
    AlignLeft,
    ListChecks,
    Scissors,
    Languages,
    Maximize2,
    ChevronDown,
    Check,
} from 'lucide-react';

const ACTIONS = [
    {
        key: 'rewrite',
        label: 'Rewrite',
        icon: Sparkles,
        instruction: 'Rewrite this passage to be clearer and more polished while preserving meaning.',
    },
    {
        key: 'concise',
        label: 'Concise',
        icon: Scissors,
        instruction: 'Rewrite this passage to be as concise as possible without losing meaning.',
    },
    {
        key: 'grammar',
        label: 'Fix grammar',
        icon: AlignLeft,
        instruction:
            'Fix grammar, spelling, and punctuation errors in this passage. Preserve the original voice and meaning.',
    },
    {
        key: 'bullets',
        label: 'To bullets',
        icon: ListChecks,
        instruction:
            'Convert this passage into a clear bullet list. Output bullets using "- " at the start of each line.',
    },
    {
        key: 'expand',
        label: 'Expand',
        icon: Maximize2,
        instruction: 'Expand this passage with more detail and supporting context. Stay on topic.',
    },
    {
        key: 'translate',
        label: 'Translate (EN)',
        icon: Languages,
        instruction: 'Translate this passage into clear, natural English.',
    },
];

const TONES = [
    { key: null, label: 'Auto tone' },
    { key: 'professional', label: 'Professional' },
    { key: 'casual', label: 'Casual' },
    { key: 'formal', label: 'Formal' },
    { key: 'friendly', label: 'Friendly' },
    { key: 'confident', label: 'Confident' },
];

const VIEWPORT_MARGIN = 8; // keep at least this many px from each edge

export default function AISelectionMenu({ editor }) {
    const [anchor, setAnchor] = useState(null); // selection geometry: { top, bottom, mid, range }
    const [coords, setCoords] = useState(null); // final clamped { top, left }
    const [tone, setTone] = useState(null);
    const [toneOpen, setToneOpen] = useState(false);
    const menuRef = useRef(null); // measured to clamp inside the viewport
    const startRangeRef = useRef(null); // the original selection { from, to }

    const { rewrite, streaming, tokens, error } = useAIRewrite({
        // We do NOT modify the document during streaming. The live text shows in
        // the floating pill below. On completion we replace the ORIGINAL selection
        // with the final text in a single atomic op. Because the doc is untouched
        // while streaming, [from, to] is still valid at the end — no position
        // tracking, so no drift and no leftover characters.
        onEnd: ({ fullText }) => {
            const r = startRangeRef.current;
            if (editor && r && typeof fullText === 'string') {
                const tr = editor.state.tr.insertText(fullText, r.from, r.to);
                editor.view.dispatch(tr);
            }
            startRangeRef.current = null;
            setAnchor(null);
        },
        onError: () => {
            startRangeRef.current = null;
        },
    });

    // Capture the selection's on-screen geometry when it changes.
    // These are VIEWPORT coordinates (no scroll offset added) because the menu
    // uses position: fixed, which is relative to the viewport.
    useEffect(() => {
        if (!editor) return;

        const update = () => {
            if (streaming) return; // keep hidden while AI is writing
            const { from, to, empty } = editor.state.selection;
            if (empty || from === to) {
                setAnchor(null);
                return;
            }
            try {
                const view = editor.view;
                const start = view.coordsAtPos(from);
                const end = view.coordsAtPos(to);
                setAnchor({
                    top: Math.min(start.top, end.top), // top of selection
                    bottom: Math.max(start.bottom, end.bottom), // bottom of selection
                    mid: (start.left + end.left) / 2, // horizontal midpoint
                    range: { from, to },
                });
            } catch {
                setAnchor(null);
            }
        };

        const onBlur = () => {
            // Delay so the user can move the mouse to the menu without it vanishing.
            setTimeout(() => {
                if (!editor.isFocused) setAnchor(null);
            }, 200);
        };

        editor.on('selectionUpdate', update);
        editor.on('blur', onBlur);

        return () => {
            editor.off('selectionUpdate', update);
            editor.off('blur', onBlur);
        };
    }, [editor, streaming]);

    // After the menu renders, measure it and clamp it inside the viewport.
    // Runs synchronously before paint, so there's no visible flicker.
    useLayoutEffect(() => {
        if (!anchor) {
            setCoords(null);
            return;
        }
        const el = menuRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const m = VIEWPORT_MARGIN;

        // Horizontal: center on the selection midpoint, then clamp to the viewport.
        let left = anchor.mid - rect.width / 2;
        left = Math.max(m, Math.min(left, vw - rect.width - m));

        // Vertical: prefer ABOVE the selection; if it would clip the top, flip BELOW.
        let top = anchor.top - rect.height - 8;
        if (top < m) top = anchor.bottom + 8;
        // Final clamp so it never spills off the bottom either.
        top = Math.max(m, Math.min(top, vh - rect.height - m));

        setCoords({ top, left });
    }, [anchor]);

    const trigger = (instruction) => {
        if (!anchor) return;
        const { from, to } = anchor.range;
        const selectionText = editor.state.doc.textBetween(from, to, '\n');
        if (!selectionText.trim()) return;
        startRangeRef.current = { from, to };
        // Pass a small slice of surrounding context for tone matching.
        const fullText = editor.getText();
        const docContext = fullText.length > 3000 ? fullText.slice(0, 3000) : fullText;
        rewrite({ selection: selectionText, instruction, range: { from, to }, tone, docContext }).catch((err) => {
            console.error('[ai-rewrite]', err);
        });
        setAnchor(null); // hide menu; the streaming indicator takes over
    };

    const activeTone = TONES.find((t) => t.key === tone) || TONES[0];

    if (streaming) {
        return (
            <div className='fixed top-20 right-6 z-50 w-72 max-w-[calc(100vw-24px)] flex flex-col gap-1.5 px-3.5 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                    <Loader2 className='size-4 animate-spin' />
                    <span>AI is rewriting…</span>
                </div>
                {tokens && (
                    <div className='text-xs leading-relaxed text-white/90 max-h-32 overflow-y-auto whitespace-pre-wrap'>
                        {tokens}
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className='fixed top-20 right-6 z-50 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm shadow-md border border-red-200 dark:border-red-800'>
                AI error: {error}
            </div>
        );
    }

    if (!anchor) return null;

    // While menu is in the lower half of the screen, open the tone dropdown upward.
    const dropUp = coords ? coords.top > window.innerHeight * 0.55 : false;

    return (
        <div
            ref={menuRef}
            className='fixed z-50 flex items-center gap-1 p-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur max-w-[calc(100vw-16px)] flex-wrap'
            style={{
                // Before coords are computed (first paint) keep it hidden so the
                // user never sees an unclamped flash.
                top: coords ? coords.top : (anchor.top ?? 0),
                left: coords ? coords.left : (anchor.mid ?? 0),
                visibility: coords ? 'visible' : 'hidden',
            }}
            onMouseDown={(e) => e.preventDefault()} // don't steal selection
        >
            {ACTIONS.map(({ key, label, icon: Icon, instruction }) => (
                <button
                    key={key}
                    title={label}
                    onClick={() => trigger(instruction)}
                    className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300 transition-colors'
                >
                    <Icon className='size-3.5' />
                    {label}
                </button>
            ))}

            {/* Divider */}
            <span className='w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1' />

            {/* Tone selector */}
            <div className='relative'>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setToneOpen((v) => !v);
                    }}
                    title='Tone'
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        tone
                            ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    {activeTone.label}
                    <ChevronDown className='size-3' />
                </button>
                {toneOpen && (
                    <div
                        className={`absolute right-0 z-50 w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-1 ${
                            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {TONES.map((t) => (
                            <button
                                key={t.key ?? 'auto'}
                                onClick={() => {
                                    setTone(t.key);
                                    setToneOpen(false);
                                }}
                                className='w-full text-left text-xs px-3 py-2 rounded-md flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            >
                                {t.label}
                                {t.key === tone && <Check className='size-3 text-purple-600' />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
