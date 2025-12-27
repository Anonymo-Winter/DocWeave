import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    FileText,
    Grid3X3,
    List,
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
} from 'lucide-react';
import logo3 from '../assets/logo3.svg';
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
import { useCreateDocumentMutation, useGetUserDocumentsQuery } from '../api/docApi';

import ProfileEditModal from '../components/EditProfile';
import { useNavigate, useParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggleTool';
import { TbFileTypeDoc } from 'react-icons/tb';
import { getInitials } from '../util/getInitials.js';
import { cn } from '@/lib/utils';

// Filter options
const filterOptions = [
    { value: 'all', label: 'All Documents', description: 'Show all documents' },
    { value: 'owned', label: 'Owned by Me', description: 'Documents I created' },
    { value: 'shared', label: 'Shared with Me', description: 'Documents others shared' },
    { value: 'starred', label: 'Starred', description: 'My favorite documents' },
    { value: 'view-only', label: 'View Only', description: 'Read-only documents' },
];

const templates = [
    { id: 1, name: 'Blank Document', icon: '📄', description: 'Start with a clean slate', templateName: 'blank' },
    {
        id: 2,
        name: 'Meeting Notes',
        icon: '📋',
        description: 'Structured meeting template',
        templateName: 'meeting-notes',
    },
    {
        id: 3,
        name: 'Project Proposal',
        icon: '📊',
        description: 'Professional proposal format',
        templateName: 'proposal',
    },
    { id: 4, name: 'Report', icon: '📈', description: 'Detailed report template', templateName: 'report' },
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
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
                        <TbFileTypeDoc className='text-white size-7' />
                    </div>
                    <span
                        className='font-bold text-xl text-gray-900 dark:text-white tracking-tight'
                        style={{ fontFamily: 'cursive' }}
                    >
                        CollabDocs
                    </span>
                </div>
            </div>

            <div className='flex items-center gap-2'>
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

const DocumentCard = ({ document, viewMode }) => {
    const [isStarred, setIsStarred] = useState(document.starred);
    const navigate = useNavigate();
    console.log(document);
    if (viewMode === 'list') {
        return (
            <motion.div
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className='flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer group'
                onClick={() => navigate(`/editor/${document.id}`)}
            >
                <div className='text-2xl'>
                    <img
                        src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50'
                        alt={document.title}
                        className='w-12 h-12 rounded-lg'
                    />
                </div>
                <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-gray-900 dark:text-white truncate'>{document.title}</h3>
                    <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        <span className='flex items-center gap-1 text-nowrap'>
                            <Clock className='w-3 h-3' />
                            {document.lastModified ? new Date(document.lastModified).toLocaleString() : '—'}
                        </span>
                        <span className='flex items-center gap-1'>
                            <Users className='w-3 h-3' />
                            {document.collaborators}
                        </span>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsStarred(!isStarred);
                    }}
                    className='p-1 transition-opacity'
                >
                    <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                </button>
                <button className='p-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <MoreVertical className='w-4 h-4 text-gray-400' />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all group'
            onClick={() => navigate(`/editor/${document.id}`)}
        >
            <div className='aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-4xl'>
                {document.thumbnail}
            </div>
            {/* <div className='aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center'>
                <img
                    // src='https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50'
                    src={document.thumbnail}
                    alt={document.title}
                    className='w-full h-full rounded-lg'
                />
            </div> */}
            <div className='p-4'>
                <div className='flex items-start justify-between gap-2 mb-2'>
                    <h3 className='font-medium text-gray-900 dark:text-white line-clamp-2'>{document.title}</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsStarred(!isStarred);
                        }}
                        className='opacity-90 group-hover:opacity-100 transition-opacity'
                    >
                        <Star
                            className={`w-4 h-4 text-amber-400 ${
                                isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                            }`}
                        />
                    </button>
                </div>
                <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                    <span className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {document.lastModified}
                    </span>
                    <span className='flex items-center gap-1'>
                        <Users className='w-3 h-3' />
                        {document.collaborators}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const user = useSelector((state) => state.user.user);
    const [createDocument, { isLoading: isDocumentLoading }] = useCreateDocumentMutation();
    const { data, isLoading: isLoadingDocuments } = useGetUserDocumentsQuery(user?._id, {
        skip: !user?._id,
        refetchOnFocus: true,
        pollingInterval: 5000,
    });
    const [userDocuments, setUserDocuments] = useState([]);
    console.log(userDocuments);
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
                filtered = filtered.filter((doc) => doc.ownership === 'shared');
                break;
            case 'starred':
                filtered = filtered.filter((doc) => doc.starred);
                break;
            case 'view-only':
                filtered = filtered.filter((doc) => doc.permission === 'view');
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
            toast.success(templateName);
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

                            {/* View Toggle */}
                            <div className='flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start sm:self-auto'>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Grid3X3 className='w-4 h-4' />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <List className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Documents Grid/List */}
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
                                key={viewMode}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'space-y-3'
                                }
                            >
                                {isLoadingDocuments
                                    ? 'Loading...'
                                    : filteredDocuments.map((document) => (
                                          <DocumentCard key={document.id} document={document} viewMode={viewMode} />
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
