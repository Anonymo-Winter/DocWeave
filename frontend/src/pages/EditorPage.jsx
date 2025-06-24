import Editor from '../components/Editor';
import Chat from '../components/chat';
import { useSocket } from '../context/socketContext';
import { toast } from 'sonner';
import { MessageSquareMore } from 'lucide-react';

import ConnectionStatusIndicator from '../components/ConnectionStatus';
import { useState } from 'react';
import { DropDown } from './DashBoard';
import { TbFileTypeDoc } from 'react-icons/tb';
import { motion } from 'framer-motion';

const ProfessionalNavbar = ({ isChatVisible, setIsChatVisible }) => {
    const { connectionStatus = {} } = useSocket();

    const toggleChats = () => {
        const el = document.querySelector('.active-chats');
        const isHidden = el?.style.display === 'none' || getComputedStyle(el).display === 'none';
        if (!el) return;

        el.style.display = isHidden ? 'block' : 'none';
        el.style.visibility = isHidden ? 'visible' : 'hidden';
    };

    return (
        <header className='h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm'>
            {/* Logo/Brand */}
            <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                    <TbFileTypeDoc className='text-white size-7' />
                </div>
                <span
                    className='font-bold text-xl text-gray-900 dark:text-white tracking-tight hidden md:block'
                    style={{ fontFamily: 'cursive' }}
                >
                    CollabDocs
                </span>
                <span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium'>
                    Editor
                </span>
            </div>

            {/* Right Section */}
            <div className='flex items-center gap-4'>
                {/* Connection Status */}
                <ConnectionStatusIndicator connectionStatus={connectionStatus} />

                {/* Chat Toggle */}
                <motion.button
                    onClick={() => {
                        toggleChats();
                        setIsChatVisible(!isChatVisible);
                    }}
                    className={`
                        relative p-2 rounded-lg border-2 transition-all duration-200
                        ${
                            isChatVisible
                                ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-600 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        `}
                    aria-label='Toggle chat panel'
                >
                    <MessageSquareMore size={14} />
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium'>
                        3
                    </span>
                </motion.button>

                <DropDown />
            </div>
        </header>
    );
};

const EditorPage = () => {
    const { socket, isConnected, connectionStatus } = useSocket();
    const [isChatVisible, setIsChatVisible] = useState(false);

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
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-[#242424] dark:text-white transition-colors duration-500'>
            <ProfessionalNavbar isChatVisible={isChatVisible} setIsChatVisible={setIsChatVisible} />
            <div className='flex flex-1 h-[calc(100vh-4rem)] w-full overflow-hidden'>
                <section className='flex-1 min-w-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#232323] flex flex-col'>
                    <Editor />
                </section>
                <aside className='active-chats w-full shadow-xl shadow-gray-200 dark:shadow-gray-800 md:w-[360px] max-w-[400px] min-w-[280px] bg-gray-50 dark:bg-[#18181b] flex flex-col h-full overflow-hidden hidden'>
                    <Chat handleMessageSubmit={handleMessageSubmit} setIsChatVisible={setIsChatVisible} />
                </aside>
            </div>
        </div>
    );
};

export default EditorPage;
