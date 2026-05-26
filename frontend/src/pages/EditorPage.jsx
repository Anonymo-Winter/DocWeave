import { useState, useRef, useEffect } from 'react';
import { useGetDocumentQuery } from '../api/docApi.js';
import EditorNavbar from '../components/EditorNavbar.jsx';
import EditorChat from '../components/EditorChat.jsx';

import Editor from '../components/Editor';
import { useSocket } from '../context/socketContext';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Settings } from 'lucide-react';

const EnhancedEditorLayout = () => {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const isChatVisibleRef = useRef(isChatVisible);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const { socket, isConnected, activeUsers, fatalSocketError } = useSocket();
    const [layoutError, setLayoutError] = useState(null);
    const { editorId } = useParams();

    const { data, error, refetch } = useGetDocumentQuery(editorId, {
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
        refetchOnFocus: true,
        pollingInterval: 7000,
    });

    const permission = currentUserRole ?? data?.permission;

    useEffect(() => {
        isChatVisibleRef.current = isChatVisible;
    }, [isChatVisible]);

    const [messages, setMessages] = useState([
        {
            message: 'Welcome to the collaboration! 🎉',
            user: { name: 'System', color: '#6B7280' },
            type: 'system',
        },
    ]);

    useEffect(() => {
        const s = socket.current;
        if (!s) return;

        const onMessage = (data) => {
            if (isChatVisibleRef.current === false) {
                toast.info(`📢 New message from ${data.user?.name || 'Anonymous'}`, {
                    description: data.message,
                    duration: 5000,
                });
            }
            setMessages((prev) => [...prev, data]);
        };

        const onNotif = (data) => setMessages((prev) => [...prev, data]);

        s.on('message', onMessage);
        s.on('message-notification', onNotif);

        return () => {
            s.off('message', onMessage);
            s.off('message-notification', onNotif);
        };
    }, [socket, isConnected]);

    useEffect(() => {
        const s = socket.current;
        if (!s) return;

        const onAccessUpdated = ({ role }) => {
            setCurrentUserRole(role);
            refetch();
        };

        s.on('access-updated', onAccessUpdated);
        return () => s.off('access-updated', onAccessUpdated);
    }, [socket, refetch]);

    const canEdit = permission === 'OWNER' || permission === 'EDITOR';

    if (permission === null) {
        return <ErrorMessage error={{ message: "You don't have access to this document", status: '403' }} />;
    }
    if (fatalSocketError) {
        return <ErrorMessage error={fatalSocketError} onRetry={() => window.location.reload()} />;
    }
    if (error) {
        return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
    }

    if (layoutError) {
        return <ErrorMessage error={layoutError} />;
    }
    return (
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300'>
            <EditorNavbar
                isChatVisible={isChatVisible}
                setIsChatVisible={setIsChatVisible}
                document={data?.document}
                permission={permission}
                canEdit={canEdit}
                refetch={refetch}
            />

            <div className='flex flex-1 h-full w-full overflow-hidden'>
                {/* Editor Section */}
                <section className='flex-1 min-w-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col p-2 sm:p-4 '>
                    <Editor onError={setLayoutError} canEdit={canEdit} />
                </section>

                {/* Enhanced Chat Section */}
                {isChatVisible && (
                    <aside className='active-chats w-full shadow-xl shadow-gray-200 dark:shadow-gray-800 md:w-[400px] max-w-[450px] min-w-[320px] bg-gray-50 dark:bg-gray-800 flex flex-col h-full overflow-hidden'>
                        <EditorChat
                            activeUsers={activeUsers}
                            isChatVisible={isChatVisible}
                            setIsChatVisible={setIsChatVisible}
                            canEdit={canEdit}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </aside>
                )}
            </div>
        </div>
    );
};

export default EnhancedEditorLayout;
