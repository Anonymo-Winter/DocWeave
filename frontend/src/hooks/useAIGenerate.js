import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/socketContext';

const makeRequestId = () =>
    `ai-gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Streams content generation from an instruction prompt.
 *
 * Optional callbacks let you handle deltas as they arrive (e.g. apply to the
 * editor on a per-token basis without flicker):
 *   useAIGenerate({
 *       onStart: ({ insertAt }) => { ... },
 *       onDelta: (delta) => { ... },
 *       onEnd:   ({ fullText, insertAt }) => { ... },
 *       onError: (err) => { ... },
 *   })
 *
 * Returns:
 *   generate({ instruction, docContext, insertAt }) → Promise<{ fullText, insertAt }>
 *   streaming, tokens, error, reset()
 */
export function useAIGenerate(callbacks = {}) {
    const { socket: socketRef, isConnected } = useSocket();
    const [streaming, setStreaming] = useState(false);
    const [tokens, setTokens] = useState('');
    const [error, setError] = useState(null);

    const activeRef = useRef(null);
    const cbRef = useRef(callbacks);
    cbRef.current = callbacks;

    useEffect(() => {
        if (!isConnected) return;
        const sock = socketRef.current;
        if (!sock) return;

        const onStart = ({ requestId, insertAt }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setStreaming(true);
            setTokens('');
            setError(null);
            cbRef.current.onStart?.({ insertAt });
        };

        const onStream = ({ requestId, delta }) => {
            if (activeRef.current?.requestId !== requestId) return;
            setTokens((t) => t + delta);
            cbRef.current.onDelta?.(delta);
        };

        const onEnd = ({ requestId, fullText, insertAt }) => {
            const active = activeRef.current;
            if (active?.requestId !== requestId) return;
            setStreaming(false);
            cbRef.current.onEnd?.({ fullText, insertAt });
            active.resolve({ fullText, insertAt });
            activeRef.current = null;
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

        sock.on('ai-generate-start', onStart);
        sock.on('ai-generate-stream', onStream);
        sock.on('ai-generate-end', onEnd);
        sock.on('ai-generate-error', onError);

        return () => {
            sock.off('ai-generate-start', onStart);
            sock.off('ai-generate-stream', onStream);
            sock.off('ai-generate-end', onEnd);
            sock.off('ai-generate-error', onError);
        };
    }, [isConnected, socketRef]);

    const generate = useCallback(
        ({ instruction, docContext = '', insertAt }) => {
            const sock = socketRef.current;
            if (!sock || !sock.connected) {
                return Promise.reject(new Error('Not connected'));
            }
            if (activeRef.current) {
                return Promise.reject(new Error('Another AI request is already in progress'));
            }
            if (!instruction || !instruction.trim()) {
                return Promise.reject(new Error('Instruction is empty'));
            }

            return new Promise((resolve, reject) => {
                const clientRequestId = makeRequestId();
                activeRef.current = { requestId: clientRequestId, resolve, reject };

                sock.emit(
                    'ai-generate',
                    { clientRequestId, instruction, docContext, insertAt },
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
        [socketRef],
    );

    const reset = useCallback(() => {
        setTokens('');
        setError(null);
    }, []);

    return { generate, streaming, tokens, error, reset };
}
