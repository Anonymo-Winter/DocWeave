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
    MoreHorizontal,
    Download,
    Settings,
    Save,
    ArrowLeft,
} from 'lucide-react';
import { TbFileTypeDoc, TbLoader2 } from 'react-icons/tb';
import ConnectionStatus from '../components/ConnectionStatus';
import { IoMdInformationCircle, IoMdInformationCircleOutline } from 'react-icons/io';
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
import { Checkbox } from '../components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FaAngleDown, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { useMobile } from '../hooks/use-mobile.ts';
import { DropDown } from '../pages/DashBoard.jsx';
import { Separator } from '../components/ui/separator';
import { Buffer } from 'buffer';
import {
    useAddPeopleMutation,
    useSaveVersionMutation,
    useGetDocumentQuery,
    useUpdateDocumentMutation,
    useChangeDocNameMutation,
} from '../api/docApi.js';
import * as Y from 'yjs';
import { useSearchForEmailMutation } from '../api/userApi.js';
import { getInitials } from '../util/getInitials.js';
import Loader from '../components/Loader.jsx';
import debounce from 'lodash.debounce';
import { useCallback } from 'react';

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

const MultiSelectInput = ({ selectedUsers, onUserSelect, onUserRemove, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [fetchedEmails, setFetchedEmails] = useState([]);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [searchForEmail, { isLoading }] = useSearchForEmailMutation();
    const [hasInteracted, setHasInteracted] = useState(false);

    // Use a separate state for the search term to avoid rate-limiting issues
    const [searchTerm, setSearchTerm] = useState('');

    // Debounce the search term
    useEffect(() => {
        if (searchTerm.length > 0) {
            const delayDebounceFn = setTimeout(() => {
                handleSearchTerm(searchTerm);
            }, 300); // 300ms delay

            return () => clearTimeout(delayDebounceFn);
        } else {
            // Clear fetched emails when the search term is empty
            setFetchedEmails([]);
        }
    }, [searchTerm]);

    useEffect(() => {
        // Filter the fetched emails. This will run whenever fetchedEmails or selectedUsers changes.
        const filtered = fetchedEmails.filter((user) => !selectedUsers.find((selected) => selected._id === user._id));
        setFilteredUsers(filtered);
    }, [fetchedEmails, selectedUsers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        if (searchTerm.length > 0) {
            const delayDebounceFn = setTimeout(() => {
                handleSearchTerm(searchTerm);
                setIsOpen(true);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setFetchedEmails([]);
            setIsOpen(false);
        }
    }, [searchTerm]);

    const handleSearchTerm = async (value) => {
        if (!value.trim()) {
            setIsOpen(false);
            return;
        }
        try {
            const res = await searchForEmail({ emailTerm: value });
            const matches = res?.data?.matchingEmails ?? [];
            setFetchedEmails(matches);
            setIsOpen(true);
        } catch (err) {
            console.error(err);
            toast.error('Failed to search users. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setHasInteracted(true);
        setSearchTerm(newValue);
    };

    const handleUserSelect = (user) => {
        onUserSelect(user);
        // Reset the input value after selecting a user
        setInputValue('');
        setSearchTerm('');
        setIsOpen(true);
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
                            {getInitials(user.name)}
                        </div>
                        <span className=''>{user.name}</span>
                        <button
                            onClick={() => onUserRemove(user._id)}
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
                    onFocus={() => hasInteracted && setIsOpen(true)}
                    placeholder={selectedUsers.length === 0 ? placeholder : ''}
                    className='flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400'
                />
            </div>

            {isOpen && (
                <div className='absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto mt-1'>
                    {isLoading ? (
                        <div className='p-3 text-center text-gray-500 dark:text-gray-400'>Loading...</div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className='w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors first:rounded-t-lg last:rounded-b-lg'
                            >
                                <div
                                    className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold'
                                    style={{ backgroundColor: user.color }}
                                >
                                    {getInitials(user.name)}
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                                        {user.name}
                                    </div>
                                    <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                                        {user.email}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : inputValue ? (
                        <div className='p-3 text-center text-gray-500 dark:text-gray-400'>
                            No matching emails found.
                        </div>
                    ) : (
                        <div className='p-3 text-center text-gray-500 dark:text-gray-400'>
                            Type an email to search for users
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ShareModal = ({ data, isLoading, refetch }) => {
    const [shareLink] = useState(window.location.href);
    const [copied, setCopied] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('editor');
    const [generalAccess, setGeneralAccess] = useState('restricted');
    const [generalAccessRole, setGeneralAccessRole] = useState('viewer');
    const [isSending, setIsSending] = useState(false);
    const isMobile = useMobile();
    const [isOpen, setIsOpen] = useState(false);
    const { editorId: documentId } = useParams();
    const [collaborators, setCollaborators] = useState([]);

    const [updateDocument] = useUpdateDocumentMutation();

    useEffect(() => {
        console.log(data);
    }, [data]);

    useEffect(() => {
        // reset all
        setSelectedRole('editor');
        setGeneralAccess('restricted');
        setGeneralAccessRole('viewer');

        if (data) {
            const formatted = data?.collaborators.map((c) => ({
                id: c.userId?._id,
                name: c.userId?.name || '?',
                email: c.userId?.email || 'Invalid Email',
                originalRole: c.role,
                selectedRole: c.role,
                color: data?.userColors[c.userId?._id],
            }));
            const access = data?.visibility.split(':')[0];
            const accessRole = data?.visibility.split(':')[1] == 'r' ? 'viewer' : 'editor';
            setCollaborators(formatted);
            setGeneralAccess(access);
            setGeneralAccessRole(accessRole);
        }
    }, [data, isLoading, isOpen]);

    const [addPeople] = useAddPeopleMutation();

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
        setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
    };

    const handleEmailClick = (email) => {
        window.open(`mailto:${email}`, '_blank');
    };

    const sendInvites = async () => {
        setIsSending(true);
        try {
            if (selectedUsers.length > 0) {
                const res = await addPeople({
                    documentId: documentId,
                    emails: selectedUsers.map((u) => u.email),
                    role: selectedRole,
                }).unwrap();
                if (res?.data?.success) {
                    toast.success('Invitations sent successfully');
                    setSelectedUsers([]);
                    setIsOpen();
                } else {
                    toast.error('Failed to send invitations');
                }
            }
        } catch (error) {
            console.log('Error occured while sending invitations : ', error);
        } finally {
            setIsSending(false);
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
        if (generalAccess === 'restricted') {
            return 'Only people with access can open with the link';
        } else if (generalAccess == 'anyone-with-link' && generalAccessRole == 'editor') {
            return 'Anyone on the internet with the link can edit';
        } else if (generalAccess == 'anyone-with-link' && generalAccessRole == 'viewer') {
            return 'Anyone on the internet with the link can view';
        } else if (generalAccess == 'anyone-in-org' && generalAccessRole == 'editor') {
            return 'Anyone in your organization can edit';
        } else if (generalAccess == 'anyone-in-org' && generalAccessRole == 'viewer')
            return 'Anyone in your organization can view';
    };

    const handleUpdateAccess = async () => {
        const changedUserAccess = collaborators
            .filter((c) => c.originalRole !== c.selectedRole)
            .map((c) => ({ id: c.id, role: c.selectedRole }));
        const changedDocAccess =
            generalAccess != 'restricted'
                ? `${generalAccess}:${generalAccessRole == 'editor' ? 'w' : 'r'}`
                : 'restricted';
        try {
            if (changedUserAccess.length > 0 || changedDocAccess != data?.visibility) {
                const res = await updateDocument({
                    editorId: documentId,
                    visibility: changedDocAccess,
                    userswithupdatedrole: changedUserAccess,
                });
                if (res?.data?.success) {
                    toast.success('Access updated successfully');
                    refetch();
                }
            }
        } catch (error) {
            console.log('Error occured while updating access : ', error);
        }
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button
                        type='button'
                        className='h-9 px-3
               inline-flex items-center gap-2
               rounded-md
               bg-blue-600 text-white
               hover:bg-blue-700
               transition-colors
               text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    >
                        <Share2 size={16} />
                        <span className='hidden xs:inline'>Share</span>
                    </button>
                </DialogTrigger>

                <DialogContent className='max-w-[95vw]  sm:max-w-lg w-full mx-auto p-4 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg'>
                    {isLoading ? (
                        <DialogHeader className='mb-2 min-h-16 sm:min-h-20 flex justify-center items-center text-sm sm:text-base md:text-l'>
                            <TbLoader2 className='animate-spin size-10 text-blue-500' />
                            <p>Loading content</p>
                        </DialogHeader>
                    ) : (
                        <>
                            <DialogHeader className='mb-1'>
                                <DialogTitle className='font-semibold text-left text-gray-900 dark:text-white'>
                                    <span className='text-base text-left sm:text-xl md:text-xl'>
                                        Share {`'${data?.title || 'this document'}'`}
                                    </span>
                                </DialogTitle>
                            </DialogHeader>
                            <div
                                className='w-full bg-white dark:bg-gray-900 transition-colors'
                                onClick={handleModalContentClick}
                            >
                                {/* Invite People */}
                                <div className='mb-4'>
                                    <h4 className='text-sm flex text-gray-900 dark:text-white items-center gap-2 mb-2'>
                                        <UserPlus size={16} className='flex-shrink-0' />
                                        Invite people
                                    </h4>
                                    <div className='space-y-3'>
                                        <div className='flex flex-col xs:flex-row gap-2'>
                                            <div className='w-full xs:w-8/12'>
                                                <MultiSelectInput
                                                    selectedUsers={selectedUsers}
                                                    onUserSelect={handleUserSelect}
                                                    onUserRemove={handleUserRemove}
                                                    placeholder='Add people and groups'
                                                />
                                            </div>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger className='h-11 xs:h-auto w-full xs:w-4/12 py-2.5 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm'>
                                                    <SelectValue placeholder='Select role' />
                                                </SelectTrigger>

                                                <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg'>
                                                    <SelectItem
                                                        value='viewer'
                                                        className='p-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                    >
                                                        Viewer
                                                    </SelectItem>
                                                    <SelectItem
                                                        value='editor'
                                                        className='p-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                    >
                                                        Editor
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {selectedUsers.length > 0 ? (
                                    <div className='flex items-center justify-end gap-3 pt-2'>
                                        <button
                                            onClick={() => setSelectedUsers([])}
                                            className='px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-1 font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={sendInvites}
                                            aria-label='Send invitations'
                                            disabled={isSending}
                                            className={`
                                                px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 font-medium 
                                                transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed
                                            `}
                                        >
                                            {isSending ? (
                                                <>
                                                    <TbLoader2 className='animate-spin text-white' size={18} />
                                                    Sending Invitation...
                                                </>
                                            ) : (
                                                <>Send {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Current Collaborators */}
                                        <div className='mb-4'>
                                            <h4 className='text-sm text-gray-900 dark:text-white flex items-center gap-2 mb-2'>
                                                <Users size={16} className='flex-shrink-0' />
                                                People with access ({collaborators?.length})
                                            </h4>
                                            <div className='space-y-2 max-h-40 md:max-h-52 overflow-y-auto custom-scrollbar'>
                                                {collaborators.map((collab) => (
                                                    <div
                                                        key={collab.id}
                                                        className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group'
                                                    >
                                                        {isMobile ? (
                                                            <Popover className='block md:hidden'>
                                                                <PopoverTrigger>
                                                                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                                        <div className='relative'>
                                                                            <div
                                                                                className='w-10 h-10 rounded-full flex items-center font-semibold justify-center text-white text-base'
                                                                                style={{
                                                                                    backgroundColor: collab.color,
                                                                                }}
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
                                                                                style={{
                                                                                    '--ring-color': collab.color,
                                                                                    backgroundColor: collab.color,
                                                                                }}
                                                                                className='w-10 h-10 rounded-full
                                                                                    flex items-center justify-center
                                                                                    font-semibold text-white
                                                                                    border-2 border-white dark:border-gray-800
                                                                                    shadow
                                                                                    ring-2 ring-[var(--ring-color)]'
                                                                            >
                                                                                {collab.profileImage ? (
                                                                                    <img
                                                                                        src={collab.profileImage}
                                                                                        alt={collab.name}
                                                                                        className='w-full h-full rounded-full object-cover'
                                                                                    />
                                                                                ) : (
                                                                                    getInitials(collab?.name || '?')
                                                                                )}
                                                                            </div>
                                                                            {collab.isOnline && (
                                                                                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
                                                                            )}
                                                                        </div>

                                                                        <div className='flex-1 min-w-0'>
                                                                            <div className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                                                                                {collab?.name}
                                                                            </div>
                                                                            <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                                                                                {collab?.email}
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
                                                                                getInitials(collab?.name || '?')
                                                                            )}
                                                                        </div>
                                                                        <div className='flex-1 min-w-0'>
                                                                            <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                                                {collab?.name}
                                                                            </div>
                                                                            <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                                                {collab?.email}
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

                                                        <Select
                                                            value={collab.selectedRole}
                                                            onValueChange={(newRole) => {
                                                                if (newRole === 'remove') {
                                                                    // handle remove access
                                                                    console.log('Removing access for', collab.name);
                                                                    return;
                                                                }
                                                                if (newRole === 'owner') {
                                                                    // handle make owner
                                                                    console.log('Making owner:', collab.name);
                                                                    return;
                                                                }

                                                                // normal role change (editor/viewer)
                                                                setCollaborators((prev) =>
                                                                    prev.map((c) =>
                                                                        c.id === collab.id
                                                                            ? { ...c, selectedRole: newRole }
                                                                            : c,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger className='h-8 w-20 sm:w-24 sm:h-9 px-2 text-xs sm:text-sm dark:bg-gray-800 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-gray-400 transition-colors'>
                                                                <SelectValue placeholder='Role' />
                                                            </SelectTrigger>

                                                            <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-xs sm:text-sm'>
                                                                {/* Regular roles */}
                                                                <SelectItem
                                                                    value='viewer'
                                                                    className='px-3 py-2 rounded-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                                >
                                                                    Viewer
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value='editor'
                                                                    className='px-3 py-2 rounded-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                                >
                                                                    Editor
                                                                </SelectItem>

                                                                {/* Divider */}
                                                                <div className='h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2' />

                                                                {/* Custom actions */}
                                                                <SelectItem
                                                                    value='owner'
                                                                    className='px-3 py-2 rounded-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                                                                >
                                                                    🔑 Make Owner
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value='remove'
                                                                    className='px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors rounded-sm'
                                                                >
                                                                    ❌ Remove Access
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        {/* 👇 Show changed role indicator */}
                                                        {collab.originalRole !== collab.selectedRole && (
                                                            <span className='hidden md:block text-xs italic text-gray-500 ml-2'>
                                                                ({collab.originalRole} →{' '}
                                                                <span className='text-blue-600'>
                                                                    {collab.selectedRole}
                                                                </span>
                                                                )
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className='mb-5'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                {getAccessIcon()}
                                                <h4 className='text-sm sm:text-base font-semibold text-gray-900 dark:text-white'>
                                                    General access
                                                </h4>
                                            </div>

                                            <div className='space-y-2'>
                                                <div className='flex flex-col sm:flex-row gap-2'>
                                                    <Select value={generalAccess} onValueChange={setGeneralAccess}>
                                                        <SelectTrigger className='h-11 w-full py-2.5 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm'>
                                                            <SelectValue placeholder='Select access level' />
                                                        </SelectTrigger>

                                                        <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm'>
                                                            <SelectItem
                                                                value='restricted'
                                                                className='p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                            >
                                                                <div className='flex items-center gap-2'>
                                                                    <Lock size={14} />
                                                                    <span>Restricted</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem
                                                                value='anyone-with-link'
                                                                className='p-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                            >
                                                                <div className='flex items-center gap-2'>
                                                                    <Globe size={14} />
                                                                    <span>Anyone with the link</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem
                                                                value='anyone-in-org'
                                                                className='p-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                            >
                                                                <div className='flex items-center gap-2'>
                                                                    <Building2 size={14} />
                                                                    <span>Anyone in organization</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    {generalAccess !== 'restricted' && (
                                                        <Select
                                                            value={generalAccessRole}
                                                            onValueChange={setGeneralAccessRole}
                                                        >
                                                            <SelectTrigger className='h-11 w-full sm:w-auto py-2.5 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm'>
                                                                <SelectValue placeholder='Select role' />
                                                            </SelectTrigger>

                                                            <SelectContent className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm'>
                                                                <SelectItem
                                                                    value='viewer'
                                                                    className='p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                                >
                                                                    Viewer
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value='editor'
                                                                    className='p-2 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-700 data-[state=checked]:text-blue-700 dark:data-[state=checked]:text-white'
                                                                >
                                                                    Editor
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                <span className='text-xs text-gray-600 dark:text-gray-400 block'>
                                                    {getAccessDescription()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Share Link */}
                                        <div className='flex items-center justify-between gap-3'>
                                            <button
                                                onClick={copyToClipboard}
                                                aria-label='Copy to clipboard'
                                                className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors duration-200 text-sm ${
                                                    copied
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {copied ? <FaCheckCircle size={16} /> : <Copy size={16} />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>

                                            <button
                                                onClick={() => handleUpdateAccess()}
                                                aria-label='Save content'
                                                className='px-4 py-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors duration-200 text-sm bg-blue-600 hover:bg-blue-700 text-white'
                                            >
                                                <FaCheckCircle size={16} />
                                                Done
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

const UserRoleSelector = ({ currentRole, onRoleChange }) => {
    const roles = [
        { value: 'reader', label: 'Read-Only', icon: Eye, description: 'Can only view the document' },
        { value: 'editor', label: 'Editing', icon: Edit, description: 'Can view, comment, and edit' },
    ];

    console.log(currentRole);
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
    const { editorId } = useParams();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() && currentUserRole !== 'viewer') {
            const newMessage = {
                roomId: editorId,
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
                            <div className='flex -space-x-1'>
                                {/* {mockCollaborators.slice(0, 3).map((collab, index) => {
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
                                })} */}
                            </div>
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
    document,
}) => {
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { ydoc, awareness, assignedColor, activeUsers, isMobile, fatalSocketError } = useSocket();
    const [saveVersion] = useSaveVersionMutation();
    const user = useSelector((state) => state.user.user);
    const { editorId } = useParams();
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const [documentName, setDocumentName] = useState(document?.title);

    // const [copied, setCopied] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [versionName, setVersionName] = useState('new version');
    const [versionDescription, setVersionDescription] = useState('new description');
    // const [autoSave, setAutoSave] = useState(false);

    const [versionopen, setVersionopen] = useState(false);

    const [renameDocument] = useChangeDocNameMutation();

    const handleSave = async () => {
        if (!ydoc || !awareness) {
            console.warn('❌ Cannot save version: editor or Ydoc missing');
            return;
        }
        console.log(awareness.getStates());
        if (!ydoc || !awareness || awareness.getStates().size === 0) {
            console.warn('❌ Cannot save version: Ydoc or awareness not ready');
            toast.error('Editor is not ready yet. Please wait.');
            return;
        }
        try {
            const update = Y.encodeStateAsUpdate(ydoc);
            const fragment = ydoc.getXmlFragment('default');
            // console.log('📝 Saving fragment:', fragment.toJSON());
            // console.log('💾 Saving update with length:', update.byteLength);
            if (!update || update.byteLength < 20) {
                console.warn('⚠️ Update too small. Likely not ready. Skipping save.');
                return;
            }
            const updateBase64 = Buffer.from(update).toString('base64');
            try {
                const decoded = Buffer.from(updateBase64, 'base64');
                Y.decodeUpdate(decoded);
            } catch (decodeErr) {
                console.error('❌ Cannot save: Invalid Yjs update:', decodeErr.message);
                return;
            }
            const collaborators = Array.from(awareness.getStates())
                .map(([clientId, state]) => {
                    if (!state?.user?.id) return null; // skip invalid entries
                    return {
                        user: state.user.id,
                        role: state.user.role || 'editor',
                        color: state.user.color || null,
                    };
                })
                .filter(Boolean);
            console.log(collaborators);

            const res = await saveVersion({
                documentId: editorId,
                update: updateBase64,
                name: versionName || `${new Date().toLocaleString()}`,
                description: versionDescription || '',
                author: { data: user._id, color: assignedColor },
                wordCount: getWordCountFromYdoc(ydoc),
                collaborators,
            }).unwrap();
            if (!res || !res.success) {
                throw new Error('Failed to save version');
            }
            setSaveVersionDialogOpen(false);
            setVersionName('');
            setVersionDescription('');
            toast.success('Version saved successfully!');
        } catch (err) {
            console.error('❌ Failed to save version:', err);
            toast.error('Failed to save version. Please try again.');
        }
    };

    const handleChange = (e) => {
        if (e.target.checked) {
            alert('AutoSave Enabled');
        } else {
            alert('AutoSave Disabled');
        }
    };

    useEffect(() => {
        if (document) {
            setDocumentName(document?.title);
        }
    }, [document]);

    const useDebouncedDocumentRename = (renameDocument, toast, editorId) => {
        const debouncedRename = useCallback(
            debounce(async (name) => {
                if (name == documentName) return;
                if (!name) {
                    toast.error('Document name cannot be empty');
                    setDocumentName('Untitled Document');
                    return;
                }
                try {
                    await renameDocument({
                        documentId: editorId,
                        name,
                    }).unwrap();
                } catch (error) {
                    const message = error?.data?.message || error?.message || 'Something went wrong';

                    toast.error('Failed to change document name', {
                        description: message,
                    });
                }
            }, 700),
            [],
        );

        return debouncedRename;
    };

    const debouncedRename = useDebouncedDocumentRename(renameDocument, toast, editorId);

    if (fatalSocketError) {
        return <ErrorMessage error={fatalSocketError} />;
    }

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
                            value={documentName}
                            onChange={(e) => {
                                setDocumentName(e.target.value);
                            }}
                            onBlur={(e) => {
                                debouncedRename(e.target.value);
                            }}
                            title={documentName}
                            className='bg-transparent text-ellipsis text-gray-900 dark:text-white font-medium focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 px-2 py-1 rounded'
                        />
                    </div>
                </div>

                {/* Right: Controls */}
                <div className='flex items-center gap-3'>
                    {/* Desktop-only actions */}
                    <div className='hidden md:flex items-center gap-3'>
                        {/* Collaborators Group */}
                        <div className='relative'>
                            <div className='flex items-center -space-x-2 hover:space-x-0 transition-all duration-200'>
                                {activeUsers.slice(0, 3).map((c, i) => {
                                    return isMobile ? (
                                        <Popover className='block md:hidden'>
                                            <PopoverTrigger>
                                                <div
                                                    key={i}
                                                    style={{ backgroundColor: c.color }}
                                                    className='w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text-xs text-white border-2 border-white dark:border-gray-800 shadow'
                                                >
                                                    {getInitials(c.name)}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                // className='w-fit'
                                                className='bg-white block md:hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'
                                            >
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <div
                                                        className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                        style={{ backgroundColor: c.color }}
                                                    >
                                                        {c.profileImage ? (
                                                            <img
                                                                src={c.profileImage}
                                                                alt={c.name}
                                                                className='w-full h-full rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            getInitials(c?.name || '?')
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                            {c?.name}
                                                        </div>
                                                        <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                            {c?.email}
                                                        </div>
                                                        {c.isOnline && (
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
                                                <button
                                                    type='button'
                                                    style={{ backgroundColor: c.color }}
                                                    className='w-9 h-9 rounded-full
               flex items-center justify-center
               font-semibold text-white
               border-2 border-white dark:border-gray-800
               shadow
               focus:outline-none
               focus:ring-2 focus:ring-blue-500/50'
                                                >
                                                    <span className='sr-only'>{c.name}</span>
                                                    {getInitials(c.name)}
                                                </button>
                                            </HoverCardTrigger>

                                            <HoverCardContent className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'>
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <div
                                                        className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                        style={{ backgroundColor: c.color }}
                                                    >
                                                        {c.profileImage ? (
                                                            <img
                                                                src={c.profileImage}
                                                                alt={c.name}
                                                                className='w-full h-full rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            getInitials(c?.name || '?')
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                            {c?.name}
                                                        </div>
                                                        <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                            {c?.email}
                                                        </div>
                                                        {c.isOnline && (
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
                                    );
                                })}
                                <button
                                    aria-label='Show collaborators'
                                    onClick={() => setShowCollaborators((show) => !show)}
                                    className='flex items-center -space-x-2 hover:space-x-0 transition-all duration-200 cursor-pointer'
                                >
                                    {/* If there are more collaborators, show +N like Google Docs */}
                                    {activeUsers.length > 3 ? (
                                        <div className='w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 border-2 border-white dark:text-gray-200 dark:border-gray-800 shadow'>
                                            +{activeUsers.length - 3}
                                        </div>
                                    ) : (
                                        <div className='w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-100 border-2 border-white dark:border-gray-800 shadow'>
                                            <Plus size={12} />
                                        </div>
                                    )}
                                </button>
                            </div>
                            {showCollaborators && <CollaboratorsDropdown list={activeUsers} />}
                        </div>

                        <Dialog open={versionopen} onOpenChange={setVersionopen}>
                            <DialogTrigger asChild>
                                <button
                                    type='button'
                                    className='h-9 w-9 inline-flex items-center justify-center
           rounded-md
           text-slate-600
           hover:bg-slate-100
           border border-slate-300
           dark:border-slate-700
           dark:bg-slate-800 dark:text-slate-300
           dark:hover:bg-slate-700'
                                >
                                    <History size={18} />
                                    <span className='sr-only'>History</span>
                                </button>
                            </DialogTrigger>

                            <DialogContent
                                showCloseButton={false}
                                className='z-50 min-w-screen min-h-screen max-w-none max-h-none rounded-none p-0 overflow-x-hidden overflow-y-auto bg-white dark:bg-gray-900'
                            >
                                <VersionComponent setVersionopen={setVersionopen} />
                                <DialogClose className='absolute top-4 left-4 p-2 z-[2] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
                                    <ArrowLeft className='w-5 h-5' />
                                </DialogClose>
                            </DialogContent>
                        </Dialog>

                        <div className='inline-flex items-stretch rounded-xl overflow-hidden border border-blue-600 shadow-sm bg-blue-800'>
                            {/* Save Version Dialog */}
                            <Dialog open={saveVersionDialogOpen} onOpenChange={setSaveVersionDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className='
                                            flex items-center gap-2
                                            px-2 h-9
                                            text-white font-medium
                                            bg-blue-600 
                                            hover:bg-blue-700
                                            active:bg-blue-800
                                            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                                            transition-all
                                        '
                                    >
                                        <MdSave size={16} />
                                        <span className='hidden sm:inline'>Save</span>
                                    </button>
                                </DialogTrigger>

                                <DialogContent className='dark:bg-gray-800 bg-white rounded-lg max-w-md w-full mx-4 px-5 py-4'>
                                    <DialogHeader>
                                        <DialogTitle className='font-medium dark:text-white text-gray-900'>
                                            Save current version
                                        </DialogTitle>
                                        <DialogDescription>
                                            Save the current state of the document as a new version. You can give it a
                                            name and description.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Version Name Input */}
                                    <div className=''>
                                        <Label htmlFor='version-name' className='mb-4 block'>
                                            Version Name (optional)
                                        </Label>
                                        <div className='relative'>
                                            <AiOutlineHistory
                                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors z-10 ${
                                                    isFocused
                                                        ? 'text-blue-500 dark:text-blue-400'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}
                                            />
                                            <input
                                                id='version-name'
                                                type='text'
                                                placeholder='Enter version name...'
                                                value={versionName}
                                                onChange={(e) => setVersionName(e.target.value)}
                                                onFocus={() => setIsFocused(true)}
                                                onBlur={() => setIsFocused(false)}
                                                className={`w-full py-3 pl-10 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                                                    isFocused
                                                        ? 'border-blue-500 dark:border-blue-400'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Version Description Textarea */}
                                    <div className=''>
                                        <Label htmlFor='version-description' className='mb-4 block'>
                                            Version Description (optional)
                                        </Label>
                                        <textarea
                                            id='version-description'
                                            rows={3}
                                            placeholder='Add a short description...'
                                            value={versionDescription}
                                            onChange={(e) => setVersionDescription(e.target.value)}
                                            // className={`w-full min-h-12 max-h-20 custom-scrollbar py-3 px-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                            //     transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 border-gray-300 dark:border-gray-600}`}
                                            className='w-full min-h-12 max-h-20 custom-scrollbar p-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                                            transition-all duration-200 focus:border-blue-500'
                                        />
                                    </div>

                                    {/* Footer Actions */}
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <button
                                                type='button'
                                                className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                                            >
                                                Cancel
                                            </button>
                                        </DialogClose>
                                        <button
                                            onClick={() => handleSave()}
                                            type='submit'
                                            className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                                        >
                                            Save Version
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Separator orientation='vertical' className='bg-white' />
                            {/* <div className='w-px bg-blue-500/40' /> */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className='
                    flex items-center justify-center
                    w-7 h-9
                    text-white
                    bg-blue-600
                    hover:bg-blue-700
                    active:bg-blue-800
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                    transition-all
                '
                                        aria-label='More save options'
                                    >
                                        <FaAngleDown size={16} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className='w-64 p-4 rounded-xl shadow-lg bg-gray-800'>
                                    <div className='space-y-3'>
                                        <p className='text-base font-semibold text-gray-900 dark:text-white'>
                                            AutoSave Settings
                                        </p>
                                        <label
                                            htmlFor='autosave'
                                            className='inline-flex items-center gap-2 cursor-pointer'
                                        >
                                            <input
                                                type='checkbox'
                                                id='autosave'
                                                defaultChecked
                                                onChange={handleChange}
                                                className='peer sr-only'
                                            />
                                            <div className='w-5 h-5 rounded border border-gray-400 flex peer-checked:hidden peer-checked:bg-blue-600 peer-checked:border-blue-600 items-center justify-center transition-colors'></div>
                                            <div className='w-5 h-5 rounded border border-gray-400 hidden peer-checked:flex peer-checked:bg-blue-600 peer-checked:border-blue-600 items-center justify-center transition-colors'>
                                                <svg
                                                    className='w-3 h-3 text-white'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='3'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                >
                                                    <polyline points='20 6 9 17 4 12' />
                                                </svg>
                                            </div>
                                            <span className='text-sm text-gray-900 dark:text-gray-100'>
                                                Enable AutoSave
                                            </span>
                                        </label>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                                            Automatically save changes every 30 seconds
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Share */}
                        <ShareModal data={document} />
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
                    <DropDown />
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

function CollaboratorsDropdown({ list }) {
    return (
        // <div className='absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 w-64 z-20'>
        //     <div className='flex items-center justify-center mb-2 gap-2'>
        //         <h4 className='font-medium text-lg text-gray-900 dark:text-white'>Active Collaborators</h4>
        //         <IoMdInformationCircleOutline title='Users currently active in this document' size={16} />
        //     </div>
        //     <div className=' max-h-48 overflow-auto'>
        //         {list.map((c) => (
        //             <div key={c.id} className='flex items-center gap-2'>
        //                 <div
        //                     key={c.id}
        //                     style={{ backgroundColor: c.color, '--ring-color': c.color }}
        //                     className='w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text- font-semibold text-white border-2 border-white dark:border-gray-800 shadow
        //                                 ring-2 ring-[var(--ring-color)]'
        //                 >
        //                     {getInitials(c.name)}
        //                 </div>
        //                 <div className='flex-1'>
        //                     <p className='text-base font-medium text-gray-900 dark:text-white'>{c.name}</p>
        //                     <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>{c.role}</p>
        //                 </div>
        //                 <MessageSquareMore size={16} />
        //                 <Mail size={16} />
        //             </div>
        //         ))}
        //         {list.map((c) => (
        //             <div key={c.id} className='flex items-center gap-2'>
        //                 <div
        //                     key={c.id}
        //                     style={{ backgroundColor: c.color }}
        //                     className='w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text- font-semibold text-white border-2 border-white dark:border-gray-800 shadow'
        //                 >
        //                     {getInitials(c.name)}
        //                 </div>
        //                 <div className='flex-1'>
        //                     <p className='text-base font-medium text-gray-900 dark:text-white'>{c.name}</p>
        //                     <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>{c.role}</p>
        //                 </div>
        //                 <MessageSquareMore size={16} />
        //                 <Mail size={16} />
        //             </div>
        //         ))}
        //         {list.map((c) => (
        //             <div key={c.id} className='flex items-center gap-2'>
        //                 <div
        //                     key={c.id}
        //                     style={{ backgroundColor: c.color }}
        //                     className='w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text- font-semibold text-white border-2 border-white dark:border-gray-800 shadow'
        //                 >
        //                     {getInitials(c.name)}
        //                 </div>
        //                 <div className='flex-1'>
        //                     <p className='text-base font-medium text-gray-900 dark:text-white'>{c.name}</p>
        //                     <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>{c.role}</p>
        //                 </div>
        //                 <MessageSquareMore size={16} />
        //                 <Mail size={16} />
        //             </div>
        //         ))}
        //     </div>
        // </div>
        <div
            className='absolute top-full right-0 mt-2 w-72
                rounded-xl border
                bg-white dark:bg-gray-800
                border-gray-200 dark:border-gray-700
                shadow-xl z-20 overflow-hidden'
        >
            {/* Header */}
            <div
                className='flex items-center justify-between px-4 py-3 border-b
                  border-gray-200 dark:border-gray-700'
            >
                <h4 className='font-semibold text-sm text-gray-900 dark:text-white'>Active collaborators</h4>
                <IoMdInformationCircleOutline
                    size={16}
                    className='text-gray-400'
                    title='Users currently active in this document'
                />
            </div>

            {/* List */}
            <div className='max-h-60 overflow-y-auto custom-scrollbar'>
                {list.map((c) => (
                    <div
                        key={c.id}
                        className='flex items-center gap-3 px-4 py-2
                   hover:bg-gray-50 dark:hover:bg-gray-700/50
                   transition-colors'
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                backgroundColor: c.color,
                                '--ring-color': c.color,
                            }}
                            className='w-8 h-8 rounded-full
                     flex items-center justify-center
                     text-xs font-semibold text-white
                     border-2 border-white dark:border-gray-800
                     ring-2 ring-[var(--ring-color)]
                     shadow shrink-0'
                        >
                            {getInitials(c.name)}
                        </div>

                        {/* Name & role */}
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{c.name}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>{c.role}</p>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2 text-gray-400'>
                            <button
                                type='button'
                                className='p-1 rounded hover:text-blue-600
                       hover:bg-blue-50 dark:hover:bg-blue-900/30
                       transition-colors'
                                aria-label={`Message ${c.name}`}
                            >
                                <MessageSquareMore size={16} />
                            </button>

                            <button
                                type='button'
                                className='p-1 rounded hover:text-emerald-600
                       hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                       transition-colors'
                                aria-label={`Email ${c.name}`}
                            >
                                <Mail size={16} />
                            </button>
                        </div>
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
            // className='p-2 h-8 w-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
            class='h-9 px-3 inline-flex items-center justify-center gap-1.5
         rounded-md text-sm font-medium
         bg-slate-800 text-slate-200
         hover:bg-slate-700
         transition-colors'
        >
            {children}
        </button>
    );
}

function ChatToggle({ isActive, onClick, children }) {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label='Toggle chat panel'
            className={`relative h-9 w-9
    inline-flex items-center justify-center
    rounded-md border
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
    ${
        isActive
            ? `
          bg-blue-600/10 border-blue-600 text-blue-600
          dark:bg-blue-400/10 dark:border-blue-400 dark:text-blue-400
        `
            : `
          bg-slate-100 border-slate-300 text-slate-600
          hover:bg-slate-200
          dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
          dark:hover:bg-slate-700
        `
    }`}
        >
            {children}

            <span className='sr-only'>3 unread messages</span>
            <span
                className='absolute -top-1 -right-1
               h-4 min-w-[16px] px-1
               rounded-full bg-red-500
               text-[10px] font-semibold text-white
               flex items-center justify-center'
            >
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
import { useNavigate, useParams } from 'react-router-dom';
import { MdChat, MdSave } from 'react-icons/md';
import { getWordCountFromYdoc } from '../util/wordCount.js';
import { Label } from '../components/ui/label.tsx';
import { AiOutlineHistory } from 'react-icons/ai';
import VersionComponent from '../components/VersionComponent.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const EnhancedEditorLayout = () => {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const isChatVisibleRef = useRef(isChatVisible);
    const [currentUserRole, setCurrentUserRole] = useState('editor');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const { socket, isConnected, assignedColor, activeUsers, fatalSocketError } = useSocket();
    const [layoutError, setLayoutError] = useState(null);
    const { editorId } = useParams();

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

    const { data } = useGetDocumentQuery(editorId, {
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
        refetchOnFocus: true,
        pollingInterval: 7000,
    });

    if (fatalSocketError) {
        return <ErrorMessage error={fatalSocketError} onRetry={() => window.location.reload()} />;
    }
    if (layoutError) {
        return <ErrorMessage error={layoutError} />;
    }

    return (
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300'>
            <EnhancedNavbar
                isChatVisible={isChatVisible}
                setIsChatVisible={setIsChatVisible}
                currentUserRole={currentUserRole}
                onRoleChange={setCurrentUserRole}
                onShareClick={() => setShowShareModal(true)}
                onVersionHistoryClick={() => setShowVersionHistory(true)}
                document={data?.document}
            />

            <div className='flex flex-1 h-full w-full overflow-hidden'>
                {/* Editor Section */}
                <section className='flex-1 min-w-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col p-2 sm:p-4 '>
                    <Editor onError={setLayoutError} />
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
        </div>
    );
};

export default EnhancedEditorLayout;
