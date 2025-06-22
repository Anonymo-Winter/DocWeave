import { useEffect, useState } from 'react';
import './styles.scss';
import { useSocket } from '../context/socketContext';
import { getTailwindColorClasses } from '../util/colorMapper';
import { SendHorizonal, X } from 'lucide-react';

const Chat = ({ handleMessageSubmit }) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!socket.current) return;
        const handleMessages = (data) => {
            setMessages((prev) => [...prev, data]);
        };
        socket.current.on('message', handleMessages);
        socket.current.on('message-notification', (data) => {
            console.log(data);
            handleMessages(data);
        });

        return () => {
            socket.current.off('message', handleMessages);
        };
    }, [socket]);

    const handleSend = () => {
        if (input.trim()) {
            handleMessageSubmit(input, JSON.parse(localStorage.getItem('user-detail') || 'null'));
            setInput('');
        }
    };

    return (
        <div className='flex flex-col h-[calc(100vh-3rem)] w-full z-50'>
            {/* Header */}
            <div className='bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700'>
                <div className='flex flex-col'>
                    <span className='font-semibold sm:text-lg text-white'>Active Chat</span>
                    <span className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400'>
                        These messages aren't saved
                    </span>
                </div>
                <X
                    className='cursor-pointer text-white'
                    onClick={() => {
                        document.querySelector('.active-chats').style.display = 'none';
                        document.querySelector('.active-chats').style.visibility = 'hidden';
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
                />
                <button onClick={handleSend} className='p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700'>
                    <SendHorizonal />
                </button>
            </div>
        </div>
    );
};

export default Chat;
