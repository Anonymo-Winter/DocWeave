import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    FileText,
    Filter,
    Clock,
    Users,
    Star,
    MoreVertical,
    LogOut,
    Settings,
    User,
    Moon,
    Sun,
    ChevronDown,
    Check,
    Trash2,
    Lock,
    Globe,
    Building2,
    Crown,
    Eye,
    Sparkles,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MdCreateNewFolder } from 'react-icons/md';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useLogoutMutation } from '../api/userApi';
import {
    useCreateDocumentMutation,
    useGetUserDocumentsQuery,
    useToggleStarMutation,
    useDeleteDocumentMutation,
} from '../api/docApi';

import ProfileEditModal from '../components/EditProfile';
import { useNavigate, useParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggleTool';
import { GiOverInfinity } from 'react-icons/gi';
import { getInitials } from '../util/getInitials.js';
import { cn } from '@/lib/utils';

const formatRelativeTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.round(days / 7)}w ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ownershipMeta = {
    owned: {
        label: 'Owned',
        icon: Crown,
        className:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    },
    collaborator: {
        label: 'Shared',
        icon: Users,
        className:
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    },
    view: {
        label: 'View only',
        icon: Eye,
        className: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
};

const OwnershipChip = ({ ownership, size = 'sm' }) => {
    const meta = ownershipMeta[ownership] || ownershipMeta.view;
    const Icon = meta.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border ${meta.className} ${
                size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            } font-medium`}
        >
            <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            {meta.label}
        </span>
    );
};

const getVisibilityMeta = (visibility = 'restricted') => {
    if (visibility.startsWith('anyone-with-link')) {
        return { icon: Globe, label: 'Anyone with the link', color: 'text-emerald-500' };
    }
    if (visibility.startsWith('anyone-in-org')) {
        return { icon: Building2, label: 'Anyone in your org', color: 'text-indigo-500' };
    }
    return { icon: Lock, label: 'Restricted', color: 'text-gray-400' };
};

const VisibilityIndicator = ({ visibility, className = '' }) => {
    const meta = getVisibilityMeta(visibility);
    const Icon = meta.icon;
    return (
        <span title={meta.label} className={`inline-flex items-center ${meta.color} ${className}`}>
            <Icon className='w-3 h-3' />
        </span>
    );
};

// Filter options
const filterOptions = [
    { value: 'all', label: 'All Documents', description: 'Show all documents' },
    { value: 'owned', label: 'Owned by Me', description: 'Documents I created' },
    { value: 'shared', label: 'Shared with Me', description: 'Documents others shared' },
    { value: 'starred', label: 'Starred', description: 'My favorite documents' },
    { value: 'view-only', label: 'View Only', description: 'Read-only documents' },
];

const templates = [
    { id: 1, name: 'Blank Document', icon: '📄', description: 'Start with a clean slate', templateName: 'blank-doc' },
];

export const DropDown = () => {
    const user = useSelector((state) => state.user.user);
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await logout().unwrap();
            if (res?.success) {
                toast.success('Logout successful');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                toast.error('Logout failed');
            }
        } catch {
            toast.error('Something went wrong.');
        }
    };

    useEffect(() => {
        if (!user) {
            toast.info('Your details are missing. Please login again.');
        }
    }, [user]);

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label='User menu'
                    className={cn(
                        `w-10 h-10 rounded-full
                        flex items-center justify-center focus:outline-none
                        transition-all duration-200 ease-in-out
                        hover:bg-green-600/30 hover:dark:bg-green-400/20`,
                        'data-[state=open]:bg-green-600/30 data-[state=open]:dark:bg-green-400/20 data-[state=closed]:bg-transparent',
                    )}
                >
                    <Avatar>
                        <AvatarImage src={user?.image || undefined} alt={user?.name} className='object-cover' />
                        <AvatarFallback className='bg-gradient-to-br from-green-400 to-blue-500 text-white font-medium'>
                            {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-56 dark:bg-gray-800' align='end'>
                <DropdownMenuLabel className='font-normal'>
                    <p className='font-semibold'>{user?.name}</p>
                    <span className='text-sm text-muted-foreground'>{user?.email}</span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <ProfileEditModal user={user} />
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <button
                        onClick={handleLogout}
                        className='flex items-center gap-2 w-full text-left focus:outline-none'
                        aria-label='Logout from your account'
                    >
                        <LogOut className='size-5 text-red-500' />
                        <span className='text-sm font-medium'>Logout</span>
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Navigation Bar
const NavBar = () => {
    const navigate = useNavigate();

    return (
        <nav className='h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8'>
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
                <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center'>
                        <GiOverInfinity className='text-white size-5' />
                    </div>
                    <span
                        className='font-bold text-xl text-gray-900 dark:text-white tracking-tight'
                        style={{ fontFamily: "'Comic Neue', cursive" }}
                    >
                        DocWeave
                    </span>
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <button
                    onClick={() => navigate('/')}
                    className='inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors'
                    title='About DocWeave'
                >
                    <Sparkles className='size-4' />
                    <span className='hidden sm:inline'>About</span>
                </button>
                <ThemeToggle />
                <DropDown />
            </div>
        </nav>
    );
};

// Template Card
const TemplateCard = ({ template, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all group'
    >
        <div className='text-4xl mb-4 group-hover:scale-110 transition-transform'>{template.icon}</div>
        <h3 className='font-medium text-gray-900 dark:text-white mb-1'>{template.name}</h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>{template.description}</p>
    </motion.div>
);

// Filter Dropdown Component
const FilterDropdown = ({ selectedFilter, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = filterOptions.find((option) => option.value === selectedFilter);

    return (
        <div className='relative'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
                <Filter className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {selectedOption?.label || 'All Documents'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className='absolute z-20 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 right-0'
                        >
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onFilterChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className='w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group'
                                >
                                    <div className='flex-1'>
                                        <div className='font-medium text-gray-900 dark:text-white text-sm'>
                                            {option.label}
                                        </div>
                                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                            {option.description}
                                        </div>
                                    </div>
                                    {selectedFilter === option.value && (
                                        <Check className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const DocumentCard = ({ document, refetch }) => {
    const [isStarred, setIsStarred] = useState(document?.starred || false);
    const navigate = useNavigate();
    const [toggleStar] = useToggleStarMutation();
    const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
    if (!document) return null;

    const isOwner = document.ownership === 'owned';

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!isOwner) return;
        const confirmed = window.confirm(`Delete "${document.title}"? This cannot be undone.`);
        if (!confirmed) return;
        try {
            const res = await deleteDocument(document.id).unwrap();
            if (res?.success) {
                toast.success('Document deleted');
                refetch?.();
            } else {
                toast.error('Failed to delete document');
            }
        } catch (err) {
            const message = err?.data?.message || 'Failed to delete document';
            toast.error(message);
        }
    };

    const collabCount = Number(document.collaborators) || 0;
    const relativeTime = formatRelativeTime(document.lastModified);
    const fullTime = document.lastModified ? new Date(document.lastModified).toLocaleString() : '';
    const visibilityMeta = getVisibilityMeta(document.visibility);
    const VisibilityIcon = visibilityMeta.icon;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-shadow group'
            onClick={() => navigate(`/${document.template == 'blank-doc' ? 'editor' : 'canva'}/${document.id}`)}
        >
            <div className='aspect-[4/3] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-hidden relative'>
                {document.contentPreview?.trim() ? (
                    <div
                        className='doc-thumbnail prose prose-sm dark:prose-invert max-w-none absolute inset-0 p-4 overflow-hidden pointer-events-none'
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.contentPreview) }}
                    />
                ) : (
                    <div className='h-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600'>
                        <FileText className='w-10 h-10 opacity-60' />
                        <span className='text-[11px] uppercase tracking-wider'>Empty document</span>
                    </div>
                )}

                {/* subtle inner bevel for paper feel */}
                <div className='pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.04]' />

                {/* visibility badge */}
                <div
                    className={`absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-700 ${visibilityMeta.color}`}
                    title={visibilityMeta.label}
                >
                    <VisibilityIcon className='w-3 h-3' />
                </div>

                {/* action overlay — always visible on touch/mobile (no hover), hover-reveal on desktop */}
                <div className='absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity'>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            setIsStarred(!isStarred);
                            await toggleStar(document.id);
                        }}
                        title={isStarred ? 'Unstar' : 'Star'}
                        className='p-1.5 rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors'
                    >
                        <Star
                            className={`w-3.5 h-3.5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                        />
                    </button>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title='Delete document'
                            className='p-1.5 rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-40 transition-colors'
                        >
                            <Trash2 className='w-3.5 h-3.5' />
                        </button>
                    )}
                </div>

                {/* standalone star when starred — hidden on mobile (overlay star is always shown there) */}
                {isStarred && (
                    <div className='absolute top-2 right-2 hidden md:block md:group-hover:hidden p-1.5'>
                        <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow' />
                    </div>
                )}
            </div>

            <div className='p-4'>
                <div className='flex items-start justify-between gap-2 mb-2'>
                    <h3
                        className='font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug'
                        title={document.title}
                    >
                        {document.title || 'Untitled Document'}
                    </h3>
                </div>
                <div className='flex items-center justify-between gap-2'>
                    <OwnershipChip ownership={document.ownership} />
                    <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
                        <span className='inline-flex items-center gap-1' title={fullTime}>
                            <Clock className='w-3 h-3' />
                            {relativeTime}
                        </span>
                        <span
                            className='inline-flex items-center gap-1'
                            title={`${collabCount} ${collabCount === 1 ? 'person' : 'people'}`}
                        >
                            <Users className='w-3 h-3' />
                            {collabCount}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const user = useSelector((state) => state.user.user);
    const [createDocument, { isLoading: isDocumentLoading }] = useCreateDocumentMutation();
    const {
        data,
        isLoading: isLoadingDocuments,
        refetch,
    } = useGetUserDocumentsQuery(user?._id, {
        skip: !user?._id,
        refetchOnFocus: true,
        pollingInterval: 5000,
    });
    const [userDocuments, setUserDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (data?.userDocuments) setUserDocuments(data.userDocuments);
    }, [data]);

    useEffect(() => {
        if (!userDocuments.length) {
            setFilteredDocuments([]);
            return;
        }

        let filtered = userDocuments.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

        // Apply filter
        switch (selectedFilter) {
            case 'owned':
                filtered = filtered.filter((doc) => doc.ownership === 'owned');
                break;
            case 'shared':
                filtered = filtered.filter((doc) => doc.ownership === 'collaborator');
                break;
            case 'starred':
                filtered = filtered.filter((doc) => doc.starred);
                break;
            case 'view-only':
                filtered = filtered.filter((doc) => doc.permission === 'VIEWER');
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        setFilteredDocuments(filtered);
    }, [searchQuery, selectedFilter, userDocuments]);

    const getFilteredCount = () => {
        if (isLoadingDocuments) return 'Loading....';
        const count = filteredDocuments.length;
        const total = userDocuments.length;

        if (selectedFilter === 'all') {
            return `${count} ${count === 1 ? 'document' : 'documents'}`;
        }

        return `${count} of ${total} documents`;
    };

    const handleCreateDocument = async (templateName) => {
        try {
            const res = await createDocument({ templateName }).unwrap();
            if (!res?.success) {
                toast.error('Failed to create document');
                return;
            } else {
                navigate(`/editor/${res.documentId}`);
            }
        } catch (err) {
            console.error('Error creating document:', err);
            toast.error('Failed to create document');
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
            <div className='fixed inset-0 z-0 overflow-hidden'>
                {/* Dark grid - visible in light mode */}
                <div
                    className='absolute inset-0 opacity-30 dark:opacity-0'
                    style={{
                        backgroundImage: `
      linear-gradient(to right, rgba(71, 85, 105, 0.2) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(71, 85, 105, 0.2) 1px, transparent 1px)
    `,
                        backgroundSize: '3rem 3rem',
                    }}
                />

                {/* Light grid - visible in dark mode */}
                <div
                    className='absolute inset-0 opacity-0 dark:opacity-20'
                    style={{
                        backgroundImage: `
      linear-gradient(to right, rgba(147, 197, 253, 0.2) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(147, 197, 253, 0.2) 1px, transparent 1px)
    `,
                        backgroundSize: '3rem 3rem',
                    }}
                />
            </div>
            <div className='relative z-10'>
                <NavBar />
            </div>

            <main className='max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10'>
                {/* Templates Section */}
                <section className='mb-12'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Start a new document</h2>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {templates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onClick={() => handleCreateDocument(template.templateName)}
                            />
                        ))}
                    </div>
                </section>

                {/* Recent Documents Section */}
                <section>
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6'>
                        {/* Title & Count */}
                        <div>
                            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Recent documents</h2>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{getFilteredCount()}</p>
                        </div>

                        {/* Controls */}
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 w-full lg:w-auto'>
                            {/* Search */}
                            <div className='relative w-full sm:w-64'>
                                {/* Icon */}
                                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                                    <Search className='text-gray-400 w-4 h-4' />
                                </div>

                                {/* Input */}
                                <input
                                    type='text'
                                    placeholder='Search documents...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                            </div>

                            {/* Filter */}
                            <FilterDropdown selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
                        </div>
                    </div>
                    {/* Documents Grid */}
                    <AnimatePresence mode='wait'>
                        {filteredDocuments.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-center py-12'>
                                <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                                    No documents found
                                </h3>
                                <p className='text-gray-500 dark:text-gray-400'>
                                    {searchQuery
                                        ? 'Try adjusting your search terms'
                                        : 'Create your first document to get started'}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                            >
                                {isLoadingDocuments
                                    ? 'Loading...'
                                    : filteredDocuments.map((document) => (
                                          <DocumentCard key={document.id} document={document} refetch={refetch} />
                                      ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
