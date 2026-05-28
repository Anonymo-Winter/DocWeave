import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/socketContext';

const makeRequestId = () => `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Drives one selection-rewrite at a time per local client.
 *
 * Optional callbacks let you handle deltas as they arrive (e.g. to apply
 * incremental edits to the editor without flicker):
 *   useAIRewrite({
 *       onStart: ({ range }) => { ... },
 *       onDelta: (delta) => { ... },
 *       onEnd:   ({ fullText, range }) => { ... },
 *       onError: (err) => { ... },
 *   })
 *
 * Returns:
 *   rewrite({ selection, instruction, range }) → Promise<{ fullText, range }>
 *   streaming                                  → boolean
 *   tokens                                     → live-accumulating string while streaming
 *   error                                      → null | string
 *   reset()                                    → clear tokens + error between runs
 */
export function useAIRewrite(callbacks = {}) {
    const { socket: socketRef, isConnected } = useSocket();
    const [streaming, setStreaming] = useState(false);
    const [tokens, setTokens] = useState('');
    const [error, setError] = useState(null);

    // Tracks the in-flight request so socket listeners can match/reject by id.
    const activeRef = useRef(null);
    // Keep callbacks fresh without re-subscribing the socket listeners on every render.
    const cbRef = useRef(callbacks);
    cbRef.current = callbacks;

    useEffect(() => {
        if (!isConnected) return;
        const sock = socketRef.current;
        if (!sock) return;

        const onStart = ({ requestId, range }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setStreaming(true);
            setTokens('');
            setError(null);
            cbRef.current.onStart?.({ range });
        };

        const onStream = ({ requestId, delta }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setTokens((t) => t + delta);
            cbRef.current.onDelta?.(delta);
            // console.log(delta);
        };

        const onEnd = ({ requestId, fullText, range }) => {
            const active = activeRef.current;
            if (active?.requestId !== requestId) return;
            setStreaming(false);
            cbRef.current.onEnd?.({ fullText, range });
            active.resolve({ fullText, range });
            activeRef.current = null;
            // console.log(fullText);
        };

        const onError = ({ requestId, message }) => {
            const active = activeRef.current;
            if (active?.requestId !== requestId) return;
            setStreaming(false);
            setError(message || 'AI failed');
            cbRef.current.onError?.(new Error(message || 'AI failed'));
            active.reject(new Error(message || 'AI failed'));
            activeRef.current = null;
        };

        sock.on('ai-start', onStart);
        sock.on('ai-stream', onStream);
        sock.on('ai-end', onEnd);
        sock.on('ai-error', onError);

        return () => {
            sock.off('ai-start', onStart);
            sock.off('ai-stream', onStream);
            sock.off('ai-end', onEnd);
            sock.off('ai-error', onError);
        };
    }, [isConnected, socketRef]);

    const rewrite = useCallback(
        ({ selection, instruction, range, tone = null, docContext = '' }) => {
            const sock = socketRef.current;
            if (!sock || !sock.connected) {
                return Promise.reject(new Error('Not connected'));
            }
            if (activeRef.current) {
                return Promise.reject(new Error('Another AI request is already in progress'));
            }

            return new Promise((resolve, reject) => {
                const clientRequestId = makeRequestId();
                activeRef.current = { requestId: clientRequestId, resolve, reject };

                sock.emit('ai-rewrite', { clientRequestId, selection, instruction, range, tone, docContext }, (ack) => {
                    if (ack?.error) {
                        setStreaming(false);
                        setError(ack.error);
                        if (activeRef.current?.requestId === clientRequestId) {
                            activeRef.current = null;
                        }
                        reject(new Error(ack.error));
                    }
                });
            });
        },
        [socketRef],
    );

    const reset = useCallback(() => {
        setTokens('');
        setError(null);
    }, []);

    return { rewrite, streaming, tokens, error, reset };
}
