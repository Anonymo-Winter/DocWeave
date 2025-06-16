import React from 'react';
import Editor from '../components/Editor';
import Chat from '../components/chat';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/socketContext';
import { toast } from 'sonner';

const EditorPage = () => {
    const { socket, isConnected } = useSocket();

    const handleMessageSubmit = (data, user) => {
        if (isConnected) {
            socket.current.emit('message', {
                roomId: 'doc123',
                message: data,
                user: user,
            });
        } else toast.error('You are not connected to the server.');
    };

    return (
        <div className='flex flex-1 h-[calc(100vh-3rem)] w-full overflow-hidden'>
            {/* Editor Section */}
            <section className='flex-1 min-w-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#232323] flex flex-col'>
                <Editor />
            </section>
            {/* Chat Section */}
            {/* //  border-gray-200 */}
            <aside className='active-chats w-full shadow-xl shadow-gray-200 dark:shadow-gray-800 md:w-[400px] max-w-[400px] min-w-[280px] bg-gray-50 dark:bg-[#18181b] flex flex-col h-full overflow-hidden'>
                <Chat handleMessageSubmit={handleMessageSubmit} />
            </aside>
        </div>
    );
};

export default EditorPage;
