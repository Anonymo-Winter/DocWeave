import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/socketContext';
import { toast } from 'sonner';
import { MessageSquareMore, Smile, Send, Lock, CheckCheck, AlertCircle, X } from 'lucide-react';

const emojiCategories = {
    Smileys: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😅',
        '😂',
        '🤣',
        '😊',
        '😇',
        '🙂',
        '😉',
        '😌',
        '😍',
        '🥰',
        '😘',
        '😗',
        '😙',
        '😚',
    ],
    Gestures: [
        '👍',
        '👎',
        '👌',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '🤙',
        '👈',
        '👉',
        '👆',
        '🖕',
        '👇',
        '☝️',
        '👋',
        '🤚',
        '🖐️',
        '✋',
    ],
    Objects: [
        '💻',
        '📱',
        '⌚',
        '💡',
        '🔥',
        '⭐',
        '❤️',
        '💯',
        '✅',
        '❌',
        '⚡',
        '🎉',
        '🎊',
        '🚀',
        '💎',
        '🔔',
        '📝',
        '📊',
    ],
};

const EmojiPicker = ({ isOpen, onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('Smileys');

    if (!isOpen) return null;

    return (
        <div className='absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 w-72 z-20'>
            <div className='flex gap-1 mb-3 overflow-x-auto pb-2'>
                {Object.keys(emojiCategories).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                            activeCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className='grid grid-cols-8 gap-1 max-h-32 overflow-y-auto'>
                {emojiCategories[activeCategory].map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg'
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

const EditorChat = ({ setIsChatVisible, canEdit, activeUsers, messages, setMessages }) => {
    const user = useSelector((state) => state.user.user);
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { socket, isConnected, assignedColor } = useSocket();
    const { editorId } = useParams();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() && canEdit) {
            const newMessage = {
                roomId: editorId,
                message: input,
                user: { email: user.email, name: user.name, color: assignedColor + '', image: user.image || '' },
                timestamp: new Date().toISOString(),
                sender: user?._id || 'anonymous-id',
            };
            if (isConnected) {
                try {
                    const res = await socket.current?.timeout(4000).emitWithAck('message', newMessage);
                    if (res.status === 'ok') {
                        setMessages((prev) => [...prev, { ...newMessage, roomId: undefined, sent: true }]);
                    } else {
                        setMessages((prev) => [...prev, { ...newMessage, roomId: undefined, sent: false }]);
                        toast.warn('Message not delivered. Try again.');
                    }
                } catch (err) {
                    console.error('Failed to send:', err.message);
                    toast.error('Message not delivered. Try again.');
                }
            } else {
                setMessages((prev) => [...prev, { ...newMessage, roomId: undefined, sent: false }]);
                toast.info('You are not connected to the server.');
            }
            setInput('');
        }
    };

    const handleEmojiSelect = (emoji) => {
        setInput((prev) => prev + emoji);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const newMessage = {
                id: Date.now(),
                message: `📎 Shared file: ${file.name}`,
                user: { name: 'You', color: '#8B5CF6' },
                timestamp: new Date().toISOString(),
                senderId: 'currentUser',
                type: 'file',
            };
            setMessages((prev) => [...prev, newMessage]);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => {
        const names = name.split(' ');
        return names.length >= 2 ? names[0][0].toUpperCase() + names[1][0].toUpperCase() : names[0][0].toUpperCase();
    };
    return (
        <div className='flex flex-col h-full bg-white dark:bg-gray-900'>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 shrink-0'>
                <div className='flex items-center gap-2.5 min-w-0'>
                    <span className='inline-flex items-center justify-center size-8 rounded-lg bg-white/20 text-white shrink-0'>
                        <MessageSquareMore size={18} />
                    </span>
                    <div className='min-w-0'>
                        <div className='font-semibold text-white text-sm leading-tight'>Live Chat</div>
                        <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='size-1.5 rounded-full bg-green-400' />
                            <span className='text-[11px] text-blue-100'>{activeUsers.length} online</span>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {/* Presence avatars */}
                    {activeUsers.length > 0 && (
                        <div className='hidden sm:flex -space-x-2'>
                            {activeUsers.slice(0, 3).map((u, i) => (
                                <div
                                    key={u.id ?? i}
                                    title={u.name}
                                    className='size-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-semibold ring-2 ring-white/40'
                                    style={{ backgroundColor: u.color || '#6b7280' }}
                                >
                                    {u.image ? (
                                        <img src={u.image} alt={u.name} className='w-full h-full object-cover' />
                                    ) : (
                                        getInitials(u.name || '?')
                                    )}
                                </div>
                            ))}
                            {activeUsers.length > 3 && (
                                <div className='size-7 rounded-full bg-white/25 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white/40'>
                                    +{activeUsers.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setIsChatVisible(false)}
                        title='Close chat'
                        className='p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors'
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar'>
                {messages.length === 0 && (
                    <div className='h-full flex flex-col items-center justify-center text-center px-6'>
                        <div className='size-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 flex items-center justify-center mb-3'>
                            <MessageSquareMore className='size-6 text-blue-500' />
                        </div>
                        <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>No messages yet</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                            Say hello to your collaborators.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isCurrentUser = msg.sender === user._id;
                    const isSystem = msg.type === 'system';

                    if (isSystem) {
                        return (
                            <div key={index} className='text-center'>
                                <span className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full'>
                                    {msg.message}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {!isCurrentUser && (
                                <div
                                    className='w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium flex-shrink-0'
                                    style={{ backgroundColor: msg.user.color }}
                                >
                                    {msg.user?.image ? (
                                        <img
                                            src={msg.user.image}
                                            alt={msg.user?.name}
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        getInitials(msg.user?.name || '?')
                                    )}
                                </div>
                            )}
                            <div className={`max-w-[78%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                {!isCurrentUser && (
                                    <div className='text-[11px] text-gray-500 mb-1 px-1'>{msg.user.name}</div>
                                )}
                                <div
                                    className={`inline-block px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                        isCurrentUser
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                                <div
                                    className={`flex items-center gap-1 mt-0.5 px-1 ${
                                        isCurrentUser ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <span className='text-[10px] text-gray-400'>{formatTime(msg.timestamp)}</span>
                                    {isCurrentUser && msg.sent && <CheckCheck className='size-3.5 text-sky-400' />}
                                    {isCurrentUser && msg.sent === false && (
                                        <AlertCircle className='size-3.5 text-red-400' />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
                {!canEdit ? (
                    <div className='text-center text-gray-500 text-sm py-3'>
                        <Lock size={16} className='inline mr-2' />
                        You have view-only access. Cannot send messages.
                    </div>
                ) : (
                    <div className='relative'>
                        <div className='flex items-center gap-2'>
                            <div className='flex-1 relative'>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder='Type a message...'
                                    className='w-full px-4 py-3 pr-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <div className='absolute right-2 bottom-2 flex gap-1'>
                                    <div className='relative'>
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'
                                        >
                                            <Smile size={16} />
                                        </button>
                                        <EmojiPicker
                                            isOpen={showEmojiPicker}
                                            onSelect={handleEmojiSelect}
                                            onClose={() => setShowEmojiPicker(false)}
                                        />
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type='file'
                                        className='hidden'
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={`p-3 rounded-full transition-colors ${
                                    input.trim()
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorChat;
