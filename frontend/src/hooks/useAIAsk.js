import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/socketContext';

const makeRequestId = () =>
    `ai-ask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Streams answers to questions about the document.
 *
 * Multi-turn: keeps an internal `messages` log so follow-up questions get prior
 * Q/A turns as context. Pass docText afresh each ask() so updates are reflected.
 *
 * Returns:
 *   messages   → [{ role: 'user'|'assistant', content, pending? }]
 *   streaming  → boolean
 *   error      → null | string
 *   ask({ question, documentText }) → Promise<string>
 *   clear()    → wipe the message log
 */
export function useAIAsk() {
    const { socket: socketRef, isConnected } = useSocket();
    const [messages, setMessages] = useState([]);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState(null);

    const activeRef = useRef(null);

    useEffect(() => {
        if (!isConnected) return;
        const sock = socketRef.current;
        if (!sock) return;

        const onStart = ({ requestId }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setStreaming(true);
            setError(null);
            setMessages((m) => [...m, { role: 'assistant', content: '', pending: true }]);
        };

        const onStream = ({ requestId, delta }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setMessages((m) => {
                const next = [...m];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                    next[next.length - 1] = { ...last, content: last.content + delta };
                }
                return next;
            });
        };

        const onEnd = ({ requestId, fullText }) => {
            const active = activeRef.current;
            if (active?.requestId !== requestId) return;
            setStreaming(false);
            setMessages((m) => {
                const next = [...m];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                    next[next.length - 1] = { role: 'assistant', content: fullText, pending: false };
                }
                return next;
            });
            active.resolve(fullText);
            activeRef.current = null;
        };

        const onError = ({ requestId, message }) => {
            const active = activeRef.current;
            if (active?.requestId !== requestId) return;
            setStreaming(false);
            setError(message || 'AI failed');
            setMessages((m) => m.filter((msg) => !msg.pending));
            active.reject(new Error(message || 'AI failed'));
            activeRef.current = null;
        };

        sock.on('ai-ask-start', onStart);
        sock.on('ai-ask-stream', onStream);
        sock.on('ai-ask-end', onEnd);
        sock.on('ai-ask-error', onError);
        return () => {
            sock.off('ai-ask-start', onStart);
            sock.off('ai-ask-stream', onStream);
            sock.off('ai-ask-end', onEnd);
            sock.off('ai-ask-error', onError);
        };
    }, [isConnected, socketRef]);

    const ask = useCallback(
        ({ question, documentText }) => {
            const sock = socketRef.current;
            if (!sock || !sock.connected) return Promise.reject(new Error('Not connected'));
            if (activeRef.current) return Promise.reject(new Error('Another question is in progress'));
            if (!question.trim()) return Promise.reject(new Error('Question is empty'));

            return new Promise((resolve, reject) => {
                const clientRequestId = makeRequestId();
                activeRef.current = { requestId: clientRequestId, resolve, reject };

                // Build history from prior turns (skip pending placeholders).
                const history = messages
                    .filter((m) => !m.pending)
                    .map(({ role, content }) => ({ role, content }));

                setMessages((m) => [...m, { role: 'user', content: question }]);

                sock.emit(
                    'ai-ask',
                    { clientRequestId, question, documentText, history },
                    (ack) => {
                        if (ack?.error) {
                            setStreaming(false);
                            setError(ack.error);
                            if (activeRef.current?.requestId === clientRequestId) {
                                activeRef.current = null;
                            }
                            reject(new Error(ack.error));
                        }
                    },
                );
            });
        },
        [socketRef, messages],
    );

    const clear = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return { messages, streaming, error, ask, clear };
}
