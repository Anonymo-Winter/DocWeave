// const DropDown = ({ user, handleLogout }) => {
//     useEffect(() => {
//         if (!user) {
//             toast.info('Your details are missing. Please login again.');
//         }
//     }, [user]);

//     if (!user) return null;
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger
//                 asChild
//                 className='border-3 border-transparent hover:ring-1 hover:ring-gray-700 hover:dark:ring-gray-400 h-[90%] w-11 cursor-pointer'
//             >
//                 <Avatar className='h-11'>
//                     <AvatarImage src='https://github.com/evilrabbit.png' />
//                     <AvatarFallback className='bg-gray-700 dark:bg-gray-400 text-2xl font-semibold text-white'>
//                         {user?.name.split(' ').length > 1
//                             ? user?.name.split(' ')[0][0].toUpperCase() + user?.name.split(' ')[1][0]
//                             : user?.name.split(' ')[0][0].toUpperCase()}
//                     </AvatarFallback>
//                 </Avatar>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className='w-56' align='center'>
//                 <DropdownMenuLabel className='font-normal'>
//                     <p className='font-semibold'>{user?.name}</p>
//                     <span className='text-sm'>{user?.email}</span>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                     className='flex items-center justify-start gap-0'
//                     onSelect={(e) => e.preventDefault()}
//                     asChild
//                 >
//                     <ProfileEditModal user={user} />
//                 </DropdownMenuItem>

//                 <DropdownMenuItem className='flex items-center justify-start gap-0'>
//                     <button
//                         className='flex items-center gap-2 w-full px-2 py-1 text-left cursor-pointer'
//                         onClick={handleLogout} // optional extra safety
//                     >
//                         <LogOut className='mr-1 size-5 text-red-500' />
//                         <span>Logout</span>
//                     </button>
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// };

// const NavBar = ({ className }) => {
//     const user = useSelector((state) => state.user.user);
//     const [logout] = useLogoutMutation();
//     const navigate = useNavigate();

//     const handleLogout = async () => {
//         try {
//             const res = await logout().unwrap();
//             if (res?.success) {
//                 toast.success('Logout successful...');
//                 setTimeout(() => navigate('/login'), 2000);
//             } else {
//                 toast.error('Logout failed.');
//             }
//         } catch (error) {
//             toast.error('Something went wrong.');
//         }
//     };

//     return (
//         <div
//             className={`${className} bg-white border border-stone-200 dark:bg-neutral-800 dark:border-neutral-700 flex items-center justify-between px-20 shadow`}
//         >
//             <div className='flex items-center justify-center gap-2'>
//                 <img src={logo3} alt='logo' className='h-11 w-11' />
//                 <span className='text-2xl font-semibold ' style={{ fontFamily: 'cursive' }}>
//                     CollabDocs
//                 </span>
//             </div>
//             {user && (
//                 <div className='flex gap-2 items-center'>
//                     <DropDown user={user} handleLogout={handleLogout} />
//                 </div>
//             )}
//         </div>
//     );
// };

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

import ProfileEditModal from '../components/EditProfile';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggleTool';
import { TbFileTypeDoc } from 'react-icons/tb';

// Mock user data
const mockUser = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
};

// Mock documents data
const mockDocuments = [
    {
        id: 1,
        title: 'Project Proposal Q4',
        lastModified: '2 hours ago',
        collaborators: 3,
        starred: true,
        thumbnail: '📊',
        ownership: 'owned',
        permission: 'edit',
    },
    {
        id: 2,
        title: 'Marketing Strategy',
        lastModified: '1 day ago',
        collaborators: 5,
        starred: false,
        thumbnail: '📈',
        ownership: 'shared',
        permission: 'edit',
    },
    {
        id: 3,
        title: 'Team Meeting Notes',
        lastModified: '3 days ago',
        collaborators: 2,
        starred: true,
        thumbnail: '📝',
        ownership: 'owned',
        permission: 'edit',
    },
    {
        id: 4,
        title: 'Budget Analysis',
        lastModified: '1 week ago',
        collaborators: 4,
        starred: false,
        thumbnail: '💰',
        ownership: 'shared',
        permission: 'view',
    },
    {
        id: 5,
        title: 'User Research Report',
        lastModified: '2 weeks ago',
        collaborators: 6,
        starred: false,
        thumbnail: '🔍',
        ownership: 'shared',
        permission: 'edit',
    },
    {
        id: 6,
        title: 'Product Roadmap',
        lastModified: '1 month ago',
        collaborators: 8,
        starred: true,
        thumbnail: '🗺️',
        ownership: 'owned',
        permission: 'edit',
    },
    {
        id: 7,
        title: 'Company Handbook',
        lastModified: '2 months ago',
        collaborators: 12,
        starred: false,
        thumbnail: '📚',
        ownership: 'shared',
        permission: 'view',
    },
    {
        id: 8,
        title: 'Design Guidelines',
        lastModified: '3 months ago',
        collaborators: 7,
        starred: false,
        thumbnail: '🎨',
        ownership: 'shared',
        permission: 'view',
    },
];

// Filter options
const filterOptions = [
    { value: 'all', label: 'All Documents', description: 'Show all documents' },
    { value: 'owned', label: 'Owned by Me', description: 'Documents I created' },
    { value: 'shared', label: 'Shared with Me', description: 'Documents others shared' },
    { value: 'starred', label: 'Starred', description: 'My favorite documents' },
    { value: 'view-only', label: 'View Only', description: 'Read-only documents' },
];

const templates = [
    { id: 1, name: 'Blank Document', icon: '📄', description: 'Start with a clean slate' },
    { id: 2, name: 'Meeting Notes', icon: '📋', description: 'Structured meeting template' },
    { id: 3, name: 'Project Proposal', icon: '📊', description: 'Professional proposal format' },
    { id: 4, name: 'Report', icon: '📈', description: 'Detailed report template' },
];

// // Dropdown Menu Component
const DropDown = ({ user, handleLogout }) => {
    useEffect(() => {
        if (!user) {
            toast.info('Your details are missing. Please login again.');
        }
    }, [user]);

    if (!user) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild
                className='border-3 border-transparent hover:ring-1 hover:ring-gray-700 hover:dark:ring-gray-400 h-[90%] w-11 cursor-pointer'
            >
                <Avatar className='h-11'>
                    <AvatarImage src='https://github.com/evilrabbit.png' />
                    <AvatarFallback className='bg-gray-700 dark:bg-gray-400 text-2xl font-semibold text-white'>
                        {user?.name.split(' ').length > 1
                            ? user?.name.split(' ')[0][0].toUpperCase() + user?.name.split(' ')[1][0]
                            : user?.name.split(' ')[0][0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='center'>
                <DropdownMenuLabel className='font-normal'>
                    <p className='font-semibold'>{user?.name}</p>
                    <span className='text-sm'>{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className='flex items-center justify-start gap-0'
                    onSelect={(e) => e.preventDefault()}
                    asChild
                >
                    <ProfileEditModal user={user} />
                </DropdownMenuItem>

                <DropdownMenuItem className='flex items-center justify-start gap-0'>
                    <button
                        className='flex items-center gap-2 w-full px-2 py-1 text-left cursor-pointer'
                        onClick={handleLogout} // optional extra safety
                    >
                        <LogOut className='mr-1 size-5 text-red-500' />
                        <span>Logout</span>
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Navigation Bar
const NavBar = () => {
    const user = useSelector((state) => state.user.user);
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await logout().unwrap();
            if (res?.success) {
                toast.success('Logout successful...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error('Logout failed.');
            }
        } catch (error) {
            toast.error('Something went wrong.');
        }
    };

    return (
        <nav className='h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-8'>
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                    {/* <span className='text-white font-bold text-sm'>CD</span> */}
                    <TbFileTypeDoc className='text-white w-6 h-6' />

                    {/* <img src={logo3} alt='logo' className='h-11 w-11' /> */}
                </div>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white' style={{ fontFamily: 'cursive' }}>
                    CollabDocs
                </h1>
            </div>

            <div className='flex items-center gap-2'>
                <ThemeToggle />
                <DropDown user={user} handleLogout={handleLogout} />
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

    if (viewMode === 'list') {
        return (
            <motion.div
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className='flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer group'
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
                            {document.lastModified}
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
    const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);

    useEffect(() => {
        let filtered = mockDocuments.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
    }, [searchQuery, selectedFilter]);

    const getFilteredCount = () => {
        const count = filteredDocuments.length;
        const total = mockDocuments.length;

        if (selectedFilter === 'all') {
            return `${count} ${count === 1 ? 'document' : 'documents'}`;
        }

        const filterLabel = filterOptions.find((option) => option.value === selectedFilter)?.label || '';
        return `${count} of ${total} documents`;
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
                                onClick={() => console.log('Create from template:', template.name)}
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
                                {filteredDocuments.map((document) => (
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
