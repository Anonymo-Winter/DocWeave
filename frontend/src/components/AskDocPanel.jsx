import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { useAIAsk } from '../hooks/useAIAsk';
import { getEditor } from '../util/editorBridge';

const SUGGESTIONS = [
    'Summarize this document in 3 bullets',
    'What are the open questions in this doc?',
    'List every action item',
    'What is the main goal described here?',
];

export default function AskDocPanel({ onClose }) {
    const { messages, streaming, error, ask, clear } = useAIAsk();
    const [question, setQuestion] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submit = async () => {
        const editor = getEditor();
        const documentText = editor?.getText() ?? '';
        const q = question.trim();
        if (!q) return;
        setQuestion('');
        try {
            await ask({ question: q, documentText });
        } catch (err) {
            console.error('[ai-ask]', err);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    return (
        <div className='flex flex-col h-full bg-white dark:bg-gray-900'>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40'>
                <div className='flex items-center gap-2'>
                    <span className='inline-flex items-center justify-center size-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm'>
                        <Sparkles className='size-4' />
                    </span>
                    <div>
                        <div className='font-semibold text-gray-900 dark:text-white text-sm'>Ask the document</div>
                        <div className='text-[11px] text-gray-500 dark:text-gray-400'>
                            Questions answered from the doc content
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-1'>
                    {messages.length > 0 && (
                        <button
                            onClick={clear}
                            disabled={streaming}
                            title='Clear conversation'
                            className='p-1.5 rounded-md text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800 disabled:opacity-40'
                        >
                            <Trash2 className='size-4' />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        title='Close'
                        className='p-1.5 rounded-md text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800'
                    >
                        <X className='size-4' />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className='flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar'>
                {messages.length === 0 && (
                    <div className='text-center py-6'>
                        <MessageCircle className='size-8 text-purple-400 mx-auto mb-2' />
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                            Ask anything about this document.
                        </p>
                        <div className='flex flex-col gap-1.5'>
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setQuestion(s)}
                                    className='text-left text-xs px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                                ${
                                    m.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                                }`}
                        >
                            {m.content || (
                                <span className='inline-flex items-center gap-1.5 text-gray-500 italic'>
                                    <Loader2 className='size-3 animate-spin' /> thinking…
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {error && !streaming && (
                    <div className='text-xs text-red-600 dark:text-red-400 px-3 py-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900'>
                        {error}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className='border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900'>
                <div className='flex items-end gap-2'>
                    <textarea
                        ref={inputRef}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder='Ask a question…  (Enter to send, Shift+Enter for newline)'
                        rows={2}
                        disabled={streaming}
                        className='flex-1 resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60'
                    />
                    <button
                        onClick={submit}
                        disabled={streaming || !question.trim()}
                        className='shrink-0 inline-flex items-center justify-center size-10 rounded-md bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed'
                    >
                        {streaming ? <Loader2 className='size-4 animate-spin' /> : <Send className='size-4' />}
                    </button>
                </div>
            </div>
        </div>
    );
}
