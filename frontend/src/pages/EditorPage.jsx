import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquareMore,
    Share2,
    History,
    Eye,
    Edit,
    Copy,
    Check,
    X,
    ChevronDown,
    Plus,
    Smile,
    Send,
    Paperclip,
    Lock,
    Menu,
    CheckCheck,
    MailSearch,
    Building2,
} from 'lucide-react';
import { TbFileTypeDoc } from 'react-icons/tb';
import ConnectionStatus from '../components/ConnectionStatus';
import { IoMdInformationCircle } from 'react-icons/io';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FaCheckCircle } from 'react-icons/fa';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { useMobile } from '../hooks/use-mobile.ts';
// Mock data for collaborators
const mockCollaborators = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
        avatar: 'JD',
        color: '#3B82F6',
        isOnline: true,
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'viewer',
        avatar: 'JS',
        color: '#10B981',
        isOnline: true,
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'commenter',
        avatar: 'BW',
        color: '#F59E0B',
        isOnline: false,
    },
];

// Mock version history
const mockVersions = [
    { id: 1, timestamp: '2025-01-15 14:30', author: 'John Doe', changes: 'Added introduction paragraph' },
    { id: 2, timestamp: '2025-01-15 13:45', author: 'Jane Smith', changes: 'Fixed typos in section 2' },
    { id: 3, timestamp: '2025-01-15 12:20', author: 'Bob Wilson', changes: 'Updated formatting' },
];

// Emoji picker data
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

import { Mail, Globe, Users, UserPlus } from 'lucide-react';

// Mock data for collaborators
const mockCollaborator = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'JD',
        color: '#4F46E5',
        role: 'editor',
        isOnline: true,
        profileImage: null,
    },
    {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        avatar: 'SW',
        color: '#DC2626',
        role: 'viewer',
        isOnline: false,
        profileImage: null,
    },
    {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.j@startup.io',
        avatar: 'MJ',
        color: '#059669',
        role: 'commenter',
        isOnline: true,
        profileImage: null,
    },
    {
        id: 8,
        name: 'Lisa Chen',
        email: 'lisa.chen@design.studio',
        avatar: 'LC',
        color: '#7C2D12',
        role: 'editor',
        isOnline: true,
        profileImage: null,
    },
];

// Mock users for suggestions
const mockUsers = [
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: 'AB', color: '#7C3AED' },
    { id: 5, name: 'David Chen', email: 'david.chen@tech.com', avatar: 'DC', color: '#EA580C' },
    { id: 6, name: 'Emma Davis', email: 'emma.davis@design.co', avatar: 'ED', color: '#DB2777' },
    { id: 7, name: 'Frank Miller', email: 'frank@creative.agency', avatar: 'FM', color: '#0891B2' },
];

const MultiSelectInput = ({ selectedUsers, onUserSelect, onUserRemove, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const filtered = mockUsers.filter(
            (user) =>
                !selectedUsers.find((selected) => selected.id === user.id) &&
                (user.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                    user.email.toLowerCase().includes(inputValue.toLowerCase())),
        );
        setFilteredUsers(filtered);
    }, [inputValue, selectedUsers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setIsOpen(true);
    };

    const handleUserSelect = (user) => {
        onUserSelect(user);
        setInputValue('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className='relative' ref={containerRef}>
            <div className='flex flex-wrap gap-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 max-h-24 custom-scrollbar overflow-y-auto transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'>
                {selectedUsers.map((user) => (
                    <div
                        key={user.id}
                        className='flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2.5 py-1.5 rounded-md text-sm font-medium'
                    >
                        <div
                            className='w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-semibold'
                            style={{ backgroundColor: user.color }}
                        >
                            {user.avatar.charAt(0)}
                        </div>
                        <span className='max-w-24 truncate'>{user.name}</span>
                        <button
                            onClick={() => onUserRemove(user.id)}
                            className='ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors'
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <input
                    ref={inputRef}
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selectedUsers.length === 0 ? placeholder : ''}
                    className='flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400'
                />
            </div>

            {isOpen && filteredUsers.length > 0 && (
                <div className='absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto mt-1'>
                    {filteredUsers.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className='w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors first:rounded-t-lg last:rounded-b-lg'
                        >
                            <div
                                className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold'
                                style={{ backgroundColor: user.color }}
                            >
                                {user.avatar}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                                    {user.name}
                                </div>
                                <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>{user.email}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ShareModal = () => {
    const [shareLink] = useState('https://collabdocs.app/doc/abc123xyz');
    const [copied, setCopied] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('editor');
    const [generalAccess, setGeneralAccess] = useState('restricted');
    const [generalAccessRole, setGeneralAccessRole] = useState('viewer');
    const isMobile = useMobile();

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUsers((prev) => [...prev, user]);
    };

    const handleUserRemove = (userId) => {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
    };

    const handleEmailClick = (email) => {
        window.open(`mailto:${email}`, '_blank');
    };

    const sendInvites = () => {
        if (selectedUsers.length > 0) {
            console.log(
                'Sending invites to:',
                selectedUsers.map((u) => u.email),
            );
            setSelectedUsers([]);
        }
    };

    const getAccessIcon = () => {
        switch (generalAccess) {
            case 'restricted':
                return <Lock size={18} className='text-gray-600 dark:text-gray-400' />;
            case 'anyone-with-link':
                return <Globe size={18} className='text-green-600 dark:text-green-400' />;
            default:
                return <Users size={18} className='text-blue-600 dark:text-blue-400' />;
        }
    };

    const getAccessDescription = () => {
        switch (generalAccess) {
            case 'restricted':
                return 'Only people with access can open with the link';
            case 'anyone-with-link':
                return 'Anyone on the internet with the link can view';
            default:
                return 'Anyone in your organization can view';
        }
    };
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className='font-semibold text-left ps-1 text-gray-900 dark:text-white mb-2'>
                    <span className='text-[20px] text-left'>Share 'Collaborative document'</span>
                </DialogTitle>
            </DialogHeader>
            <div
                className='w-full max-w-none sm:max-w-lg mx-auto bg-white dark:bg-gray-900 transition-colors'
                onClick={handleModalContentClick}
            >
                {/* Invite People */}
                <div className='mb-3'>
                    <h4 className='text-sm  hidden sm:flex text-gray-900 dark:text-white items-center gap-2 mb-2'>
                        <UserPlus size={16} />
                        Invite people
                    </h4>
                    <div className='space-y-3'>
                        <div className='flex flex-nowrap gap-2'>
                            <div className='w-10/12'>
                                <MultiSelectInput
                                    selectedUsers={selectedUsers}
                                    onUserSelect={handleUserSelect}
                                    onUserRemove={handleUserRemove}
                                    placeholder='Add people and groups'
                                />
                            </div>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className='h-fit w-fit py-5.5 dark:bg-gray-800 border-gray-300 dark:border-gray-600'>
                                    <SelectValue placeholder='Select role' />
                                </SelectTrigger>

                                <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg'>
                                    <SelectItem
                                        value='viewer'
                                        className='p-3 m-0 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-0.5
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                    >
                                        Viewer
                                    </SelectItem>
                                    <SelectItem
                                        value='editor'
                                        className='p-3 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                    >
                                        Editor
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedUsers.length > 0 && (
                            <button
                                onClick={sendInvites}
                                className='w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium'
                            >
                                Send {selectedUsers.length} invitation{selectedUsers.length > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                </div>

                {/* Current Collaborators */}
                <div className='mb-3'>
                    <h4 className='text-sm text-gray-900 dark:text-white flex items-center gap-2 mb-2'>
                        <Users size={16} />
                        People with access ({mockCollaborator.length})
                    </h4>
                    <div className='space-y-2 max-h-32 md:max-h-52 overflow-y-auto pr-1 custom-scrollbar border px-2 py-1 rounded'>
                        {mockCollaborator.map((collab) => (
                            <div
                                key={collab.id}
                                className='flex items-center justify-between p-1 md:p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group'
                            >
                                {isMobile ? (
                                    <Popover className='block md:hidden'>
                                        <PopoverTrigger>
                                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                <div className='relative'>
                                                    <div
                                                        className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm'
                                                        style={{ backgroundColor: collab.color }}
                                                    >
                                                        {collab.profileImage ? (
                                                            <img
                                                                src={collab.profileImage}
                                                                alt={collab.name}
                                                                className='w-full h-full rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            collab.avatar
                                                        )}
                                                    </div>
                                                    {collab.isOnline && (
                                                        <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
                                                    )}
                                                </div>

                                                <div className='flex-1 min-w-0 text-left'>
                                                    <div className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                                                        {collab.name}
                                                    </div>
                                                    <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                                                        {collab.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            // className='w-fit'
                                            className='bg-white block md:hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'
                                        >
                                            <div className='flex items-center gap-3 mb-4'>
                                                <div
                                                    className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                    style={{ backgroundColor: collab.color }}
                                                >
                                                    {collab.profileImage ? (
                                                        <img
                                                            src={collab.profileImage}
                                                            alt={collab.name}
                                                            className='w-full h-full rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        collab.avatar
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                        {collab.name}
                                                    </div>
                                                    <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                        {collab.email}
                                                    </div>
                                                    {collab.isOnline && (
                                                        <div className='flex items-center gap-1 mt-1'>
                                                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                                            <span className='text-xs text-green-600 dark:text-green-400'>
                                                                Online
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                // onClick={() => onEmailClick(collab.email)}
                                                className='w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/70 transition-all duration-200 font-medium'
                                            >
                                                <Mail size={16} />
                                                Send email
                                            </button>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <HoverCard className='hidden md:block'>
                                        <HoverCardTrigger asChild>
                                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                <div className='relative'>
                                                    <div
                                                        className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm'
                                                        style={{ backgroundColor: collab.color }}
                                                    >
                                                        {collab.profileImage ? (
                                                            <img
                                                                src={collab.profileImage}
                                                                alt={collab.name}
                                                                className='w-full h-full rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            collab.avatar
                                                        )}
                                                    </div>
                                                    {collab.isOnline && (
                                                        <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
                                                    )}
                                                </div>

                                                <div className='flex-1 min-w-0'>
                                                    <div className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                                                        {collab.name}
                                                    </div>
                                                    <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                                                        {collab.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                            // className='w-fit'
                                            className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'
                                        >
                                            <div className='flex items-center gap-3 mb-4'>
                                                <div
                                                    className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                    style={{ backgroundColor: collab.color }}
                                                >
                                                    {collab.profileImage ? (
                                                        <img
                                                            src={collab.profileImage}
                                                            alt={collab.name}
                                                            className='w-full h-full rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        collab.avatar
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                        {collab.name}
                                                    </div>
                                                    <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                        {collab.email}
                                                    </div>
                                                    {collab.isOnline && (
                                                        <div className='flex items-center gap-1 mt-1'>
                                                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                                            <span className='text-xs text-green-600 dark:text-green-400'>
                                                                Online
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                // onClick={() => onEmailClick(collab.email)}
                                                className='w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/70 transition-all duration-200 font-medium'
                                            >
                                                <Mail size={16} />
                                                Send email
                                            </button>
                                        </HoverCardContent>
                                    </HoverCard>
                                )}

                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className='h-fit w-fit px-4 py-2 dark:bg-gray-800 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-gray-400 transition-colors'>
                                        <SelectValue placeholder='Select role' />
                                    </SelectTrigger>

                                    <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg'>
                                        {/* Role Options */}
                                        <SelectItem
                                            value='viewer'
                                            className='px-3 py-2 text-sm rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
      data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700
      data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white mb-0.5'
                                        >
                                            {/* <Eye size={16} className='mr-2 text-sm' /> */}
                                            Viewer
                                        </SelectItem>
                                        <SelectItem
                                            value='editor'
                                            className='px-3 py-2 text-sm text-gray-800 rounded-none dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
      data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700
      data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                        >
                                            {/* <Edit size={16} className='mr-2' /> */}
                                            Editor
                                        </SelectItem>

                                        {/* Divider */}
                                        <div className='h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2' />

                                        {/* Action Buttons */}
                                        <div className='flex flex-col'>
                                            <button
                                                onClick={() => console.log('Make Owner')}
                                                className='text-left w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                                            >
                                                🔑 Make Owner
                                            </button>
                                            <button
                                                onClick={() => console.log('Remove Access')}
                                                className='text-left w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:text-white transition-colors'
                                            >
                                                ❌ Remove Access
                                            </button>
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mb-6'>
                    <div className='flex items-center gap-2 mb-2'>
                        {getAccessIcon()}
                        <h4 className='text-base font-semibold text-gray-900 dark:text-white'>General access</h4>
                    </div>

                    <div className='space-y-0'>
                        <div className='flex flex-col sm:flex-row gap-2'>
                            <Select value={generalAccess} onValueChange={setGeneralAccess}>
                                <SelectTrigger className='h-fit w-full py-6 dark:bg-gray-800 border-gray-300 dark:border-gray-600'>
                                    <SelectValue placeholder='Select role' />
                                </SelectTrigger>

                                <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg'>
                                    <SelectItem
                                        value='restricted'
                                        className='p-3 m-0 text-gray-800 rounded-none mb-0 md:mb-0.5 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Lock size={14} />
                                            <span>Restricted</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='anyone-with-link'
                                        className='p-3 text-gray-800 rounded-none mb-0 md:mb-0.5 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Globe size={14} />
                                            <span>Anyone with the link</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem
                                        value='anyone-in-org'
                                        className='p-3 text-gray-800 rounded-none mb-0 md:mb-0.5 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Building2 size={14} />
                                            <span>Anyone in organization</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {generalAccess !== 'restricted' && (
                                <Select value={generalAccessRole} onValueChange={setGeneralAccessRole}>
                                    <SelectTrigger className='h-fit w-fit py-6 dark:bg-gray-800 border-gray-300 dark:border-gray-600'>
                                        <SelectValue placeholder='Select role' />
                                    </SelectTrigger>

                                    <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg'>
                                        <SelectItem
                                            value='viewer'
                                            className='p-3 m-0 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-0.5
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                        >
                                            Viewer
                                        </SelectItem>
                                        <SelectItem
                                            value='editor'
                                            className='p-3 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors
                                    data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                        >
                                            Editor
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <span className='text-xs text-gray-600 dark:text-gray-400 leading-relaxed'>
                            {getAccessDescription()}
                        </span>
                    </div>
                </div>
                {/* Share Link */}
                <div className='flex items-center justify-between gap-4'>
                    {/* Save Button - Primary */}

                    {/* Copy Button - Secondary */}
                    <button
                        onClick={copyToClipboard}
                        aria-label='Copy to clipboard'
                        className={`p-2 rounded-lg flex items-center justify-center gap-2 font-medium min-w-[110px] transition-colors duration-200
                        ${
                            copied
                                ? 'bg-green-50 dark:bg-green-800 text-green-700 dark:text-green-500 ring-2 ring-green-300 dark:ring-green-600'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ring-2 ring-gray-300 dark:ring-gray-600'
                        }
            `}
                    >
                        {copied ? <FaCheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={() => console.log('DONE')}
                        aria-label='Save content'
                        className='p-2 rounded-lg flex items-center justify-center gap-2 font-medium min-w-[110px] transition-colors duration-200 
        bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500'
                    >
                        <FaCheckCircle size={16} />
                        Save
                    </button>
                </div>
            </div>
        </>
    );
};

// import { createNamedSnapshot } from '../util/yjsSnapshots.js';
// import * as Y from 'yjs';
// import { applySnapshot } from '../util/yjsSnapshots';

// const VersionHistoryModal = ({ isOpen, onClose }) => {
//     const { ydoc, addSnapshot, snapshots } = useSocket();

//     const handleCreateSnapshot = () => {
//         const name = prompt('Enter snapshot name:');
//         if (!name) return;
//         const snap = createNamedSnapshot(ydoc, name);
//         addSnapshot(snap);
//         alert('Snapshot saved!');
//     };

//     const restore = (snap) => {
//         const doc = applySnapshot(ydoc, snap.snapshot);
//         const update = Y.encodeStateAsUpdate(doc);
//         Y.applyUpdate(ydoc, update); // Applies the snapshot to current doc
//         alert(`Restored snapshot "${snap.name}"`);
//     };

//     if (!isOpen) return null;

//     return (
//         <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
//             <div className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden'>
//                 <div className='flex justify-between items-center mb-4'>
//                     <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Version History</h3>
//                     <button onClick={handleCreateSnapshot} className='btn'>
//                         📸 Save Snapshot
//                     </button>
//                     <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
//                         <X size={20} />
//                     </button>
//                 </div>

//                 <div className='space-y-3 overflow-y-auto max-h-[calc(80vh-100px)]'>
//                     {/* {mockVersions.map((version) => (
//                         <div
//                             key={version.id}
//                             className='border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
//                         >
//                             <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1'>
//                                 <div className='text-sm font-medium text-gray-900 dark:text-white'>
//                                     {version.timestamp}
//                                 </div>
//                                 <button className='text-xs text-blue-600 hover:text-blue-800'>Restore</button>
//                             </div>
//                             <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>By {version.author}</div>
//                             <div className='text-xs text-gray-500'>{version.changes}</div>
//                         </div>
//                     ))} */}
//                     {snapshots.map((version, index) => (
//                         <div
//                             key={index}
//                             className='border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
//                         >
//                             <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1'>
//                                 <div className='text-sm font-medium text-gray-900 dark:text-white'>
//                                     {new Date(version.timestamp).toLocaleString()}
//                                 </div>
//                                 <button
//                                     className='text-xs text-blue-600 hover:text-blue-800'
//                                     onClick={(e) => {
//                                         e.preventDefault();
//                                         alert('Are you sure');
//                                         restore(version);
//                                     }}
//                                 >
//                                     Restore
//                                 </button>
//                             </div>
//                             {/* <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>By {version.author}</div> */}
//                             <div className='text-gray-500'>{version.name}</div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

import { createNamedSnapshot, applySnapshotToDoc } from '../util/yjsSnapshots';
import * as Y from 'yjs';
// usesocket is already called
const VersionHistoryModal = ({ isOpen, onClose }) => {
    const { ydoc, addSnapshot, snapshots } = useSocket();
    const user = useSelector((state) => state.user.user);

    const handleCreateSnapshot = () => {
        const name = prompt('Snapshot name:');
        if (!name) return;

        const snapshot = createNamedSnapshot(ydoc, name, {
            id: user._id,
            name: user.name,
        });

        addSnapshot(snapshot);
        alert('✅ Snapshot saved');
    };

    const restore = (snap) => {
        applySnapshotToDoc(ydoc, snap.snapshot);
        alert(`Restored snapshot "${snap.name}"`);
    };
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden'>
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Version History</h3>
                    <div className='flex items-center gap-2'>
                        <button onClick={handleCreateSnapshot} className='btn text-sm'>
                            📸 Save Snapshot
                        </button>
                        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className='space-y-3 overflow-y-auto max-h-[calc(80vh-100px)]'>
                    {snapshots.map((version, index) => (
                        <div
                            key={index}
                            className='border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                        >
                            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1'>
                                <div className='text-sm font-medium text-gray-900 dark:text-white'>
                                    {new Date(version.timestamp).toLocaleString()}
                                </div>
                                <button
                                    className='text-xs text-blue-600 hover:text-blue-800'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        restore(version);
                                    }}
                                >
                                    Restore
                                </button>
                            </div>
                            <div className='text-gray-500'>{version.name}</div>
                        </div>
                    ))}
                </div>
                <button
                    className='btn text-sm text-blue-500 cursor-pointer'
                    onClick={() => {
                        navigate('/version');
                    }}
                >
                    View more
                </button>
            </div>
        </div>
    );
};

const UserRoleSelector = ({ currentRole, onRoleChange }) => {
    const roles = [
        { value: 'viewer', label: 'Viewer', icon: Eye, description: 'Can only view the document' },
        { value: 'editor', label: 'Editor', icon: Edit, description: 'Can view, comment, and edit' },
    ];

    const CurrentRole = roles.find((role) => role.value === currentRole);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'>
                    <CurrentRole.icon size={16} />
                    <span className='text-sm font-medium hidden lg:inline'>{CurrentRole.label}</span>
                    <ChevronDown size={14} className='font-bold hidden sm:block' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                // className='w-56'
                className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48'
            >
                <DropdownMenuRadioGroup>
                    {roles.map((role, index) => (
                        <DropdownMenuItem key={index}>
                            <button
                                key={role.value}
                                onClick={() => {
                                    onRoleChange(role.value);
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    role.value === currentRole ? 'bg-gray-100 dark:bg-gray-600' : ''
                                }`}
                            >
                                <role.icon size={16} className='mt-0.5' />
                                <div className='text-left'>
                                    <div className='text-sm font-medium'>{role.label}</div>
                                    <div className='text-xs text-gray-500'>{role.description}</div>
                                </div>
                            </button>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
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

const EnhancedChat = ({ setIsChatVisible, currentUserRole, activeUsers, messages, setMessages }) => {
    const user = useSelector((state) => state.user.user);
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { socket, isConnected, assignedColor } = useSocket();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() && currentUserRole !== 'viewer') {
            const newMessage = {
                roomId: 'doc123',
                message: input,
                user: { email: user.email, name: user.name, color: assignedColor + '' },
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
        <div className='flex flex-col justify-between h-full bg-white dark:bg-gray-900'>
            {/* Enhanced Header */}
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center rounded-t-lg justify-between'>
                <div className='flex items-center gap-3'>
                    <MessageSquareMore className='text-white' size={20} />
                    <div>
                        <span className='font-semibold text-white text-lg'>Live Chat</span>
                        <div className='flex items-center gap-2 mt-1'>
                            {/* <div className='flex -space-x-1'>
                                {mockCollaborators.slice(0, 3).map((collab, index) => {
                                    return (
                                        <div
                                            key={collab.id}
                                            className='w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium'
                                            style={{ backgroundColor: collab.color }}
                                            title={collab.name}
                                        >
                                            {collab.avatar[0]}
                                        </div>
                                    );
                                })}
                            </div> */}
                            <span className='text-xs text-blue-100'>{activeUsers.length} online</span>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => {
                            setIsChatVisible(false);
                            const activeChat = document.querySelector('.active-chats');
                            if (activeChat) {
                                activeChat.style.display = 'none';
                                activeChat.style.visibility = 'hidden';
                            }
                        }}
                        className='text-white/80 hover:text-white'
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className='overflow-y-auto p-4 space-y-4 h-[calc(100vh-15rem)]'>
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
                                    className='w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0'
                                    style={{ backgroundColor: msg.user.color }}
                                >
                                    {getInitials(msg.user?.name)}
                                </div>
                            )}
                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                {!isCurrentUser && <div className='text-xs text-gray-500 mb-1'>{msg.user.name}</div>}
                                <div
                                    className={`inline-block px-4 py-2 rounded-2xl text-wrap break-words break-all ${
                                        isCurrentUser
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                                <div
                                    className={`flex items-center gap-1 mt-0.5 ${
                                        isCurrentUser ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {isCurrentUser && msg.sent && (
                                        <>
                                            <div className='text-gray-400'>
                                                <CheckCheck className='text-sky-500 size-4' />
                                            </div>
                                        </>
                                    )}
                                    {isCurrentUser && !msg.sent && (
                                        <>
                                            <div className='text-red-400'>
                                                <IoMdInformationCircle className='size-4' />
                                            </div>
                                        </>
                                    )}
                                    <div className='text-xs text-gray-400'>{formatTime(msg.timestamp)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input */}
            <div className='p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
                {currentUserRole === 'viewer' ? (
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
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'
                                    >
                                        <Paperclip size={16} />
                                    </button>
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

const EnhancedNavbar = ({
    isChatVisible,
    setIsChatVisible,
    currentUserRole,
    onRoleChange,
    onShareClick,
    onVersionHistoryClick,
}) => {
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm'>
            <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
                {/* Left: Logo & Base Controls */}
                <div className='flex items-center'>
                    <button
                        aria-label='Open menu'
                        className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
                        onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                        <TbFileTypeDoc className='text-white' size={20} />
                    </div>
                    <div className='hidden lg:flex items-center gap-2'>
                        <input
                            type='text'
                            defaultValue='Untitled Document'
                            className='ml-2 bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 px-2 py-1 rounded'
                        />
                        {/* <span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium'>
                            Editor
                        </span> */}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className='flex items-center gap-3'>
                    {/* Desktop-only actions */}
                    <div className='hidden md:flex items-center gap-3'>
                        {/* Collaborators Group */}
                        <div className='relative'>
                            <button
                                aria-label='Show collaborators'
                                onClick={() => setShowCollaborators((show) => !show)}
                                className='flex space-x-0 hover:space-x-1 transition-all duration-200'
                            >
                                {mockCollaborators.slice(0, 3).map((c, i) => (
                                    <Avatar key={c.id} collab={c} index={i} />
                                ))}
                                <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600'>
                                    <Plus size={12} />
                                </div>
                            </button>
                            {showCollaborators && <CollaboratorsDropdown list={mockCollaborators} />}
                        </div>

                        {/* Role selector */}
                        <UserRoleSelector currentRole={currentUserRole} onRoleChange={onRoleChange} />
                        {/* History */}
                        <ActionButton onClick={onVersionHistoryClick} tooltip='Version History'>
                            <History size={16} />
                        </ActionButton>
                        {/* Share */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                    asChild
                                >
                                    <Share2 size={16} />
                                    <span className='hidden sm:inline'>Share</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className='max-w-lg w-full mx-auto dark:bg-gray-900 border border-gray-500 dark:border-gray-700'>
                                {/* <DialogHeader>
                                    <DialogTitle className='sm:text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                                        Share 'Collaborative document'
                                    </DialogTitle>
                                </DialogHeader> */}
                                <ShareModal />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Chat Toggle */}
                    <ChatToggle
                        isActive={isChatVisible}
                        onClick={() => {
                            setIsChatVisible(!isChatVisible);
                        }}
                    >
                        <MessageSquareMore size={16} />
                    </ChatToggle>

                    {/* <ConnectionStatusIndicator connectionStatus={{ connected: true }} /> */}
                    <ConnectionStatus />
                </div>
            </div>

            {/* Mobile Expansion */}
            {mobileMenuOpen && (
                <div className='md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm'>
                    <MobileMenu
                        collaborators={mockCollaborators}
                        currentUserRole={currentUserRole}
                        onRoleChange={onRoleChange}
                        onVersionHistoryClick={onVersionHistoryClick}
                        onShareClick={onShareClick}
                    />
                </div>
            )}
        </header>
    );
};

// // Reusable components:

// function Avatar({ collab, index }) {
//     return (
//         <div
//             title={`${collab.name} (${collab.role})`}
//             className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
//                 collab.isOnline ? 'ring-2 ring-green-400' : ''
//             }`}
//             style={{ backgroundColor: collab.color, zIndex: mockCollaborators.length - index }}
//         >
//             {collab.avatar}
//         </div>
//     );
// }

function CollaboratorsDropdown({ list }) {
    return (
        <div className='absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 w-64 z-20'>
            <h4 className='font-medium text-gray-900 dark:text-white mb-2'>Active Collaborators</h4>
            <div className='space-y-2 max-h-48 overflow-auto'>
                {list.map((c) => (
                    <div key={c.id} className='flex items-center gap-2'>
                        <div
                            style={{ backgroundColor: c.color }}
                            className='w-6 h-6 rounded-full flex items-center justify-center text-xs text-white'
                        >
                            {c.avatar}
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>{c.name}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>{c.role}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${c.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActionButton({ onClick, tooltip, children }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
        >
            {children}
        </button>
    );
}

function ChatToggle({ isActive, onClick, children }) {
    return (
        <button
            onClick={onClick}
            aria-label='Toggle chat panel'
            className={`relative p-2 rounded-lg border-2 transition-all duration-200 ${
                isActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-600 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
            {children}
            <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium'>
                3
            </span>
        </button>
    );
}

function MobileMenu({ collaborators, currentUserRole, onRoleChange, onVersionHistoryClick, onShareClick }) {
    return (
        <>
            <div className='px-4 py-3 flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                    <TbFileTypeDoc size={16} className='text-gray-400' />
                    <input
                        type='text'
                        defaultValue='Untitled Document'
                        className='flex-1 bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 px-2 py-1 rounded'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    {collaborators.slice(0, 3).map((c, i) => (
                        <Avatar key={c.id} collab={c} index={i} />
                    ))}
                    <UserRoleSelector currentRole={currentUserRole} onRoleChange={onRoleChange} />
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        onClick={onVersionHistoryClick}
                        className='flex-1 flex items-center justify-center px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition'
                    >
                        <History size={16} />
                        <span className='ml-2'>History</span>
                    </button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                onClick={onShareClick}
                                className='flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
                            >
                                <Share2 size={16} />
                                <span className='ml-2'>Share</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className='max-w-lg w-full mx-auto dark:bg-gray-900 border border-gray-500 dark:border-gray-700'>
                            <ShareModal />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}

import Editor from '../components/Editor';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { InputField } from '../components/InputField';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useNavigate } from 'react-router-dom';

const EnhancedEditorLayout = () => {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const isChatVisibleRef = useRef(isChatVisible);
    const [currentUserRole, setCurrentUserRole] = useState('editor');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const { socket, isConnected, assignedColor, activeUsers } = useSocket();

    const [messages, setMessages] = useState([
        {
            message: 'Welcome to the collaboration! 🎉',
            user: { name: 'System', color: '#6B7280' },
            type: 'system',
        },
    ]);

    // Keep ref in sync with latest state
    useEffect(() => {
        isChatVisibleRef.current = isChatVisible;
    }, [isChatVisible]);

    useEffect(() => {
        if (socket.current) {
            socket.current.on('message', (data) => {
                if (isChatVisibleRef.current === false) {
                    toast.info(`📢 New message from ${data.user?.name || 'Anonymous'}`, {
                        description: data.message,
                        duration: 5000,
                    });
                }
                setMessages((prev) => [...prev, data]);
            });

            socket.current.on('message-notification', (data) => {
                setMessages((prev) => [...prev, data]);
            });
        }
        return () => {
            if (socket.current) {
                socket.current.off('message');
                socket.current.off('message-notification');
            }
        };
    }, [socket.current]);

    return (
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300'>
            <EnhancedNavbar
                isChatVisible={isChatVisible}
                setIsChatVisible={setIsChatVisible}
                currentUserRole={currentUserRole}
                onRoleChange={setCurrentUserRole}
                onShareClick={() => setShowShareModal(true)}
                onVersionHistoryClick={() => setShowVersionHistory(true)}
            />

            <div className='flex flex-1 h-full w-full overflow-hidden'>
                {/* Editor Section */}
                <section className='flex-1 min-w-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col p-2 sm:p-4 '>
                    <Editor />
                </section>

                {/* Enhanced Chat Section */}
                {isChatVisible && (
                    <aside className='active-chats w-full shadow-xl shadow-gray-200 dark:shadow-gray-800 md:w-[400px] max-w-[450px] min-w-[320px] bg-gray-50 dark:bg-gray-800 flex flex-col h-full overflow-hidden'>
                        <EnhancedChat
                            activeUsers={activeUsers}
                            isChatVisible={isChatVisible}
                            setIsChatVisible={setIsChatVisible}
                            currentUserRole={currentUserRole}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </aside>
                )}
            </div>

            {/* Modals */}
            {/* <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} /> */}
            <VersionHistoryModal isOpen={showVersionHistory} onClose={() => setShowVersionHistory(false)} />
        </div>
    );
};

export default EnhancedEditorLayout;
