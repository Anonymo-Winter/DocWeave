import { useRef, useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { getEditor } from '../util/editorBridge';
import { aiTextToHtml } from '../util/aiTextToHtml';
import { toast } from 'sonner';

const SUGGESTIONS = [
    'Write a project status update for this week',
    'Draft a meeting agenda for a 30-minute kickoff',
    'Brainstorm a list of feature ideas for...',
    'Outline a blog post on...',
];

export default function AIGenerateModal({ open, onOpenChange }) {
    const [instruction, setInstruction] = useState('');
    const textareaRef = useRef(null);

    // The result is shown live in the modal preview while streaming, then
    // inserted into the document as proper paragraphs once complete — inserting
    // raw streamed text loses paragraph breaks on the next edit.
    const { generate, streaming, tokens, error, reset } = useAIGenerate({
        onEnd: ({ fullText, insertAt }) => {
            const editor = getEditor();
            if (editor && fullText && fullText.trim()) {
                const pos = typeof insertAt === 'number' ? insertAt : editor.state.selection.from;
                editor.chain().focus().insertContentAt(pos, aiTextToHtml(fullText)).run();
            }
            onOpenChange(false);
            setInstruction('');
            reset();
        },
        onError: (err) => {
            toast.error('AI generation failed');
            console.error('AI generation failed : ', err.message);
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
            console.error('Editor not ready');
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
            <DialogContent className='dark:bg-gray-800 bg-white rounded-lg sm:max-w-[560px] w-full mx-4 px-5 py-4'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 font-medium dark:text-white text-gray-900'>
                        <span className='inline-flex items-center justify-center size-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white'>
                            <Sparkles className='size-4' />
                        </span>
                        Generate with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe what to write. It streams here as it's generated, then drops into your document at the cursor.
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
                        className='w-full resize-none custom-scrollbar p-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 focus:border-purple-500 dark:focus:border-purple-400 border-gray-300 dark:border-gray-600 disabled:opacity-60'
                    />

                    {!streaming && !instruction && (
                        <div className='flex flex-wrap gap-2'>
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    type='button'
                                    onClick={() => setInstruction(s)}
                                    className='text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {streaming && (
                        <div className='rounded-lg border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 p-3'>
                            <div className='flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-2'>
                                <Loader2 className='size-4 animate-spin' />
                                Writing… {tokens.length} chars
                            </div>
                            <div className='text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono custom-scrollbar'>
                                {tokens || '…'}
                            </div>
                        </div>
                    )}

                    {error && !streaming && <div className='text-sm text-red-600 dark:text-red-400'>{error}</div>}
                </div>

                <DialogFooter>
                    <button
                        type='button'
                        onClick={() => onOpenChange(false)}
                        disabled={streaming}
                        className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        onClick={submit}
                        disabled={streaming || !instruction.trim()}
                        className='flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {streaming ? (
                            <>
                                <Loader2 className='size-4 animate-spin' />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Sparkles className='size-4' />
                                Generate
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
