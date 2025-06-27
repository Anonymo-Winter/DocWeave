import { useEffect, useState } from 'react';
import './styles.scss';
import { useSocket } from '../context/socketContext';
import { getTailwindColorClasses } from '../util/colorMapper';
import { SendHorizonal, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const Chat = ({ handleMessageSubmit, setIsChatVisible, currentUserRole }) => {
    const { socket } = useSocket();
    const user = useSelector((state) => state.user.user);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        document.querySelector('textarea').focus();
    }, []);

    useEffect(() => {
        if (!socket.current) return;

        const handleMessages = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        const handleNotification = (data) => {
            handleMessages(data);
        };

        socket.current.on('message', handleMessages);
        socket.current.on('message-notification', handleNotification);

        return () => {
            socket.current.off('message', handleMessages);
            socket.current.off('message-notification', handleNotification);
        };
    }, [socket.current]);

    const handleSend = () => {
        if (input.trim()) {
            handleMessageSubmit(input, user);
            setInput('');
        }
    };

    return (
        <div className='flex flex-col justify-between h-full bg-white dark:bg-gray-900'>
            {/* Header */}
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between'>
                <X
                    className='cursor-pointer text-white'
                    onClick={() => {
                        setIsChatVisible(false);
                        const activeChat = document.querySelector('.active-chats');
                        if (activeChat) {
                            activeChat.style.display = 'none';
                            activeChat.style.visibility = 'hidden';
                        }
                    }}
                />
            </div>
            {/* Messages */}
            <div className='h-0 flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#18181b] chat-messages'>
                {messages.map((msg, i) => {
                    if (msg?.type === 'info') {
                        return (
                            <p key={i} className='text-xs text-gray-500 text-center'>
                                {msg.message}
                            </p>
                        );
                    }

                    const color = getTailwindColorClasses(msg.user.color || 'grey');
                    return (
                        <div
                            key={i}
                            className={`flex items-start justify-start space-x-2 w-fit rounded-lg 
                                ${
                                    msg.senderId === socket?.current?.id
                                        ? 'ml-auto' // Sent by current user → right-aligned
                                        : 'mr-auto' // Sent by others → left-aligned
                                }`}
                        >
                            {msg.senderId !== socket?.current?.id && (
                                <img
                                    src='https://static.vecteezy.com/system/resources/previews/011/671/888/original/s-letter-logo-design-for-fashion-and-beauty-and-spa-company-s-letter-icon-s-logo-vector.jpg'
                                    alt='Avatar'
                                    className='rounded-full w-8 h-8 object-cover'
                                    style={{
                                        border: `2px solid ${color[500]}`,
                                        boxShadow: `0 0 0 2px ${color[500]}`,
                                    }}
                                />
                            )}
                            <div>
                                {msg.senderId !== socket?.current?.id && (
                                    <div className='font-semibold'>{msg.user.name}</div>
                                )}
                                <div
                                    className='rounded-lg p-2 mt-1 break-all'
                                    style={{
                                        backgroundColor: color[100],
                                        color: color[800],
                                    }}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Input */}
            <div className='flex items-center justify-center p-2 gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#232323] relative'>
                <textarea
                    placeholder='Type here to chat'
                    className='w-full rounded border p-2 resize-none bg-gray-100 dark:bg-[#18181b] text-black dark:text-white'
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    autoFocus
                />
                <button onClick={handleSend} className='p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700'>
                    <SendHorizonal />
                </button>
            </div>
        </div>
    );
};

export default Chat;
