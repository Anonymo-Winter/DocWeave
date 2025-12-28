import { useState, useEffect, useRef } from 'react';
import { useMobile } from '../hooks/use-mobile.ts';
import { useParams } from 'react-router-dom';
import { useAddPeopleMutation, useUpdateDocumentMutation } from '../api/docApi.js';
import { toast } from 'sonner';
import { getInitials } from '../util/getInitials.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { TbLoader2 } from 'react-icons/tb';
import { Building2, Globe, UserPlus, Users, Copy, Mail, Lock, X } from 'lucide-react';
import { useSearchForEmailMutation } from '../api/userApi.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FaCheckCircle } from 'react-icons/fa';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const MultiSelectInput = ({ selectedUsers, onUserSelect, onUserRemove, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [fetchedEmails, setFetchedEmails] = useState([]);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [searchForEmail, { isLoading }] = useSearchForEmailMutation();
    const [hasInteracted, setHasInteracted] = useState(false);
    const { editorId } = useParams();
    // Use a separate state for the search term to avoid rate-limiting issues
    const [searchTerm, setSearchTerm] = useState('');

    // Debounce the search term
    // useEffect(() => {
    //     if (searchTerm.length > 2) {
    //         const delayDebounceFn = setTimeout(() => {
    //             handleSearchTerm(searchTerm);
    //         }, 300); // 300ms delay

    //         return () => clearTimeout(delayDebounceFn);
    //     } else {
    //         // Clear fetched emails when the search term is empty
    //         setFetchedEmails([]);
    //     }
    // }, [searchTerm]);

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
        if (searchTerm.length > 2) {
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
            const res = await searchForEmail({ emailTerm: value, editorId: editorId }).unwrap();
            const matches = res?.matchingEmails ?? [];
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
                                    style={{ backgroundColor: user.color || 'gray' }}
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

const ShareModal = ({ data, isLoading, refetch, open, onOpenChange, canAddPeople, canChangeVisibility }) => {
    const [shareLink] = useState(window.location.href);
    const [copied, setCopied] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('editor');
    const [generalAccess, setGeneralAccess] = useState('restricted');
    const [generalAccessRole, setGeneralAccessRole] = useState('viewer');
    const [isSending, setIsSending] = useState(false);
    const isMobile = useMobile();
    const { editorId: documentId } = useParams();
    const [collaborators, setCollaborators] = useState([]);

    const [updateDocument] = useUpdateDocumentMutation();

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
    }, [data, isLoading, open]);

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
        const subject = encodeURIComponent('Regarding the document');
        const body = encodeURIComponent('Hey, can you check this document?');
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
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
                if (res?.success) {
                    toast.success('Invitations sent successfully');
                    setSelectedUsers([]);
                    onOpenChange(false);
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
        console.log(changedUserAccess);
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
                }).unwrap();
                if (res?.success) {
                    toast.success('Access updated successfully');
                    // refetch();
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
            <Dialog open={open} onOpenChange={onOpenChange}>
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
                                {canAddPeople && (
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
                                )}

                                {canAddPeople && selectedUsers.length > 0 ? (
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
                                                                        onClick={() => handleEmailClick(collab.email)}
                                                                        className='w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/70 transition-all duration-200 font-medium cursor-pointer'
                                                                    >
                                                                        <Mail size={16} />
                                                                        Send email
                                                                    </button>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        )}

                                                        {canAddPeople ? (
                                                            <Select
                                                                value={collab.selectedRole}
                                                                onValueChange={(newRole) => {
                                                                    // normal role change (editor/viewer/remove/owner)
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
                                                        ) : (
                                                            // <span className='text-sm sm:text-base font-semibold text-gray-900 dark:text-white'>
                                                            <span className='bg-white p-2  dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-xs sm:text-sm'>
                                                                {collab.selectedRole}
                                                            </span>
                                                        )}

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
                                                    <Select
                                                        disabled={!canChangeVisibility}
                                                        value={generalAccess}
                                                        onValueChange={setGeneralAccess}
                                                    >
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
                                                            disabled={!canChangeVisibility}
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

export default ShareModal;
