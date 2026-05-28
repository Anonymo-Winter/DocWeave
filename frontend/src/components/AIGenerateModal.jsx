import { useRef, useState, useEffect } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { getEditor } from '../util/editorBridge';
import { toast } from 'sonner';

const SUGGESTIONS = [
    'Write a project status update for this week',
    'Draft a meeting agenda for a 30-minute kickoff',
    'Brainstorm a list of feature ideas for...',
    'Outline a blog post on...',
];

export default function AIGenerateModal({ open, onOpenChange }) {
    const [instruction, setInstruction] = useState('');
    const insertPosRef = useRef(null);
    const textareaRef = useRef(null);

    const { generate, streaming, tokens, error, reset } = useAIGenerate({
        onStart: ({ insertAt }) => {
            const editor = getEditor();
            if (!editor) return;
            const pos = typeof insertAt === 'number' ? insertAt : editor.state.selection.from;
            // Ensure we're on a fresh line if there's existing text right before us.
            editor.chain().focus().setTextSelection(pos).insertContentAt(pos, '\n').run();
            insertPosRef.current = pos + 1;
        },
        onDelta: (delta) => {
            const editor = getEditor();
            if (!editor || insertPosRef.current == null) return;
            editor.chain().insertContentAt(insertPosRef.current, delta).run();
            insertPosRef.current += delta.length;
        },
        onEnd: () => {
            insertPosRef.current = null;
            onOpenChange(false);
            setInstruction('');
            reset();
            toast.success('AI content inserted');
        },
        onError: (err) => {
            insertPosRef.current = null;
            toast.error('AI generation failed', { description: err.message });
        },
    });

    // Autofocus when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }, [open]);

    const submit = async () => {
        if (!instruction.trim()) return;
        const editor = getEditor();
        if (!editor) {
            toast.error('Editor not ready');
            return;
        }

        // Gather a slice of surrounding doc text for tone reference.
        const fullText = editor.getText();
        const docContext = fullText.length > 4000 ? fullText.slice(-4000) : fullText;
        const insertAt = editor.state.selection.from;

        try {
            await generate({ instruction: instruction.trim(), docContext, insertAt });
        } catch (err) {
            console.error('[ai-generate]', err);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (streaming) return; // don't allow closing mid-stream
                onOpenChange(v);
                if (!v) {
                    setInstruction('');
                    reset();
                }
            }}
        >
            <DialogContent className='sm:max-w-[560px]'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <span className='inline-flex items-center justify-center size-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white'>
                            <Sparkles className='size-4' />
                        </span>
                        Generate with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe what to write. The result will stream into the document at your cursor.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-3'>
                    <textarea
                        ref={textareaRef}
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder='e.g. Write a project plan for our Q3 launch, with goals, milestones, and owners.'
                        disabled={streaming}
                        rows={4}
                        className='w-full resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60'
                    />

                    {!streaming && !instruction && (
                        <div className='flex flex-wrap gap-2'>
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    type='button'
                                    onClick={() => setInstruction(s)}
                                    className='text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {streaming && (
                        <div className='rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 p-3'>
                            <div className='flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300 mb-2'>
                                <Loader2 className='size-4 animate-spin' />
                                Writing… {tokens.length} chars
                            </div>
                            <div className='text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono'>
                                {tokens || '…'}
                            </div>
                        </div>
                    )}

                    {error && !streaming && (
                        <div className='text-sm text-red-600 dark:text-red-400'>{error}</div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={streaming}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={streaming || !instruction.trim()}
                        className='bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    >
                        {streaming ? (
                            <>
                                <Loader2 className='size-4 animate-spin mr-1.5' />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Sparkles className='size-4 mr-1.5' />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
