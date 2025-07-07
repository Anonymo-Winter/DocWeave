import React, { useEffect, useState } from 'react';
import {
    Clock,
    User,
    MoreVertical,
    X,
    RotateCcw,
    Download,
    Copy,
    Star,
    Edit2,
    Save,
    Trash2,
    Plus,
    Sun,
    Moon,
    ArrowLeft,
    Menu,
} from 'lucide-react';
import { createNamedSnapshot, applySnapshotToDoc } from '../util/yjsSnapshots';
import * as Y from 'yjs';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { AiOutlineHistory } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetVersionQuery, useSaveVersionMutation } from '../api/docApi';
import { getWordCountFromYdoc } from '../util/wordCount';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '../components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { InputField } from './InputField';
import { toast } from 'sonner';

const VersionComponent = () => {
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [expandedVersions, setExpandedVersions] = useState({});
    const [newVersionName, setNewVersionName] = useState('');
    const [versionToRemove, setVersionToRemove] = useState(null);
    const [versionToName, setVersionToName] = useState(null);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [versionName, setVersionName] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    console.log(useParams());
    const { ydoc, addSnapshot, snapshots } = useSocket();
    const user = useSelector((state) => state.user.user);
    // const { data: versionHistory = [], isLoading } = useGetVersionsQuery(documentId);
    const [saveVersion] = useSaveVersionMutation();

    const confirmSaveVersion = async () => {
        try {
            const snapshot = Y.snapshot(ydoc);
            const encodedSnapshot = Y.encodeSnapshot(snapshot);
            const snapshotArray = Array.from(encodedSnapshot);

            await saveVersion({
                documentId: ydoc.guid,
                snapshot: snapshotArray,
                name: newVersionName,
                wordCount: getWordCountFromYdoc(ydoc), // optional
                collaborators: [{ name: user.name, role: 'Editor' }],
                author: {
                    _id: user._id,
                    name: user.name,
                },
            }).unwrap();

            toast.success('✅ Saved version');
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || 'Failed to save version');
        } finally {
            setShowSaveModal(false);
            setNewVersionName('');
        }
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('.version-sidebar');
            setIsSidebarHidden(sidebar?.classList.contains('hidden'));
        });

        const target = document.querySelector('.version-sidebar');
        if (target) {
            observer.observe(target, { attributes: true, attributeFilter: ['class'] });
        }

        return () => observer.disconnect();
    }, []);

    const toggleSidebar = () => {
        const el = document.querySelector('.version-sidebar');
        if (el) {
            el.classList.toggle('hidden');
            setIsSidebarHidden(el.classList.contains('hidden'));
        }
    };

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

    // User colors for avatars (Google Docs style)
    const userColors = {
        'John Doe': 'bg-blue-500',
        'Jane Smith': 'bg-green-500',
        'Mike Johnson': 'bg-purple-500',
        'Sarah Wilson': 'bg-orange-500',
        'David Brown': 'bg-red-500',
        'Emily Davis': 'bg-pink-500',
        'Alex Chen': 'bg-indigo-500',
        'Lisa Park': 'bg-yellow-500',
    };

    // // Mock version history data
    const versionHistory = [
        {
            id: 1,
            timestamp: '2 hours ago',
            fullDate: 'Today 2:30 PM',
            author: 'John Doe',
            changes: 'Added introduction section and updated formatting throughout the document',
            isNamed: false,
            isStarred: false,
            collaborators: [
                { name: 'John Doe', role: 'Editor' },
                { name: 'Jane Smith', role: 'Commenter' },
            ],
            wordCount: 1245,
            isCurrentVersion: true,
        },
        {
            id: 2,
            timestamp: '5 hours ago',
            fullDate: 'Today 11:15 AM',
            author: 'Jane Smith',
            changes: 'Updated formatting, fixed typos, and added comprehensive references section',
            isNamed: true,
            name: 'Draft v2.1',
            isStarred: true,
            collaborators: [
                { name: 'Jane Smith', role: 'Editor' },
                { name: 'Mike Johnson', role: 'Viewer' },
            ],
            wordCount: 1180,
        },
        {
            id: 3,
            timestamp: 'Yesterday',
            fullDate: 'Yesterday 4:45 PM',
            author: 'John Doe',
            changes: 'Initial draft creation with main content structure and outline',
            isNamed: false,
            isStarred: false,
            collaborators: [{ name: 'John Doe', role: 'Owner' }],
            wordCount: 980,
        },
        {
            id: 4,
            timestamp: '2 days ago',
            fullDate: 'July 2, 4:20 PM',
            author: 'Mike Johnson',
            changes: 'Created document template and comprehensive outline structure',
            isNamed: true,
            name: 'Template v1.0',
            isStarred: false,
            collaborators: [
                { name: 'Mike Johnson', role: 'Editor' },
                { name: 'Sarah Wilson', role: 'Editor' },
                { name: 'David Brown', role: 'Commenter' },
                { name: 'Emily Davis', role: 'Viewer' },
            ],
            wordCount: 650,
        },
        {
            id: 5,
            timestamp: '3 days ago',
            fullDate: 'July 1, 10:30 AM',
            author: 'Sarah Wilson',
            changes: 'Added research notes and bibliography with extensive citations',
            isNamed: false,
            isStarred: false,
            collaborators: [
                { name: 'Sarah Wilson', role: 'Editor' },
                { name: 'Emily Davis', role: 'Commenter' },
                { name: 'Alex Chen', role: 'Viewer' },
                { name: 'Lisa Park', role: 'Viewer' },
            ],
            wordCount: 420,
        },
    ];

    const handleVersionClick = (version) => {
        setSelectedVersion(version.id === selectedVersion ? null : version.id);
    };

    const toggleExpanded = (versionId) => {
        setExpandedVersions((prev) => ({
            ...prev,
            [versionId]: !prev[versionId],
        }));
    };

    const handleRestore = (version) => {
        setShowRestoreModal(true);
        setSelectedVersion(version.id);
    };

    const handleRemove = (version) => {
        setVersionToRemove(version);
        setShowRemoveModal(true);
    };

    const handleNameVersion = (version) => {
        setVersionToName(version);
        setNewVersionName(version.name || '');
        setShowNameModal(true);
    };

    const confirmRestore = () => {
        console.log('Restoring version:', selectedVersion);
        setShowRestoreModal(false);
        setSelectedVersion(null);
    };

    const confirmRemove = () => {
        console.log('Removing version:', versionToRemove.id);
        setShowRemoveModal(false);
        setVersionToRemove(null);
    };

    const confirmNameVersion = () => {
        console.log('Naming version:', versionToName.id, 'as:', newVersionName);
        setShowNameModal(false);
        setVersionToName(null);
        setNewVersionName('');
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getRoleColor = (role) => {
        if (localStorage.getItem('theme') === 'dark') {
            switch (role) {
                case 'Owner':
                    return 'text-purple-300 bg-purple-900/30';
                case 'Editor':
                    return 'text-blue-300 bg-blue-900/30';
                case 'Commenter':
                    return 'text-green-300 bg-green-900/30';
                case 'Viewer':
                    return 'text-gray-300 bg-gray-800/30';
                default:
                    return 'text-gray-300 bg-gray-800/30';
            }
        } else {
            switch (role) {
                case 'Owner':
                    return 'text-purple-600 bg-purple-50';
                case 'Editor':
                    return 'text-blue-600 bg-blue-50';
                case 'Commenter':
                    return 'text-green-600 bg-green-50';
                case 'Viewer':
                    return 'text-gray-600 bg-gray-50';
                default:
                    return 'text-gray-600 bg-gray-50';
            }
        }
    };

    const UserAvatar = ({ name, size = 'sm', showTooltip = false }) => {
        const sizeClasses = {
            xs: 'w-5 h-5 text-xs',
            sm: 'w-6 h-6 text-xs',
            md: 'w-8 h-8 text-sm',
        };

        return (
            <div
                className={`${userColors[name] || 'bg-gray-500'} ${
                    sizeClasses[size]
                } rounded-full flex items-center justify-center text-white font-medium relative group`}
                title={showTooltip ? name : ''}
            >
                {getInitials(name)}
                {showTooltip && (
                    <div
                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1
                            dark:bg-gray-700 dark:text-white bg-gray-800 text-white text-xs rounded 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10`}
                    >
                        {name}
                    </div>
                )}
            </div>
        );
    };

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className={`dark:bg-gray-800 bg-white rounded-lg p-6 max-w-md w-full mx-4`}>
                    <h3 className={`text-lg font-medium mb-4 dark:text-white text-gray-900`}>{title}</h3>
                    {children}
                </div>
            </div>
        );
    };

    const navigate = useNavigate();

    return (
        <div className={`h-full w-full flex dark:bg-gray-900 bg-gray-50`}>
            {/* Editor Section */}
            <div className='dark:bg-gray-800 bg-white h-full w-full dark:border-gray-700 border-gray-200 border-r shadow-sm flex flex-col'>
                {/* Editor Header */}
                <div
                    className={`p-4 dark:border-gray-700 dark:bg-gray-900 border-gray-200 bg-gray-50 border-b flex justify-between items-center`}
                >
                    <h2 className={`text-lg font-medium dark:text-white text-gray-800`}>
                        <ArrowLeft onClick={() => navigate('/editor')} />
                    </h2>
                    <div className='flex items-center gap-4'>
                        <Dialog>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <DialogTrigger asChild>
                                    <button
                                        type='button'
                                        className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors'
                                    >
                                        <Save className='w-4 h-4' />
                                        Save version
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
                                            className={`w-full min-h-12 max-h-20 custom-scrollbar py-3 px-3 border-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400
                                                    border-gray-600 dark:border-gray-600'
                                            }`}
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
                                            onClick={() => confirmSaveVersion()}
                                            type='submit'
                                            className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                                        >
                                            Save Version
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </form>
                        </Dialog>
                        {isSidebarHidden && (
                            <button
                                className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
                                onClick={toggleSidebar}
                            >
                                <Menu className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Editor Content */}
                <div className='max-h-screen overflow-y-auto p-6'>
                    <div className={`dark:text-gray-400 text-gray-400 text-center mt-20`}>
                        <div className='text-4xl mb-4'>📝</div>
                        <p className='text-lg'>Editor will go here</p>
                        <p className='text-sm mt-2'>This space is reserved for your document editor</p>
                        <div className={`mt-8 text-left max-w-2xl mx-auto dark:text-gray-300 text-gray-600`}>
                            <p className='mb-4'>Sample content to demonstrate scrolling...</p>
                            {Array.from({ length: 20 }, (_, i) => (
                                <p key={i} className='mb-4'>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur.
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Wrapper */}
            <div className='version-sidebar bg-white dark:bg-gray-800 h-full absolute sm:relative w-full md:w-2/3 lg:w-[30%] border-l border-gray-200 dark:border-gray-700 flex flex-col'>
                {/* Header */}
                <div className='p-4 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex-shrink-0'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-gray-600 dark:text-gray-400' />
                            <span className='text-lg font-medium text-gray-800 dark:text-white'>Version history</span>
                        </div>
                        <button
                            className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
                            onClick={() => {
                                document.querySelector('.version-sidebar').classList.toggle('hidden');
                            }}
                        >
                            <X className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                        </button>
                    </div>
                    <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                        {versionHistory.length} versions available
                    </div>
                </div>

                {/* Version List */}
                <div className='max-h-screen overflow-y-auto'>
                    <div className='p-3 space-y-3'>
                        {versionHistory.map((version, index) => {
                            const baseClasses = `group rounded-xl transition-all duration-200 border-2`;
                            const selectedClasses = `shadow-md ${
                                selectedVersion === version.id
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-600'
                                    : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:hover:border-gray-500'
                            }`;
                            return (
                                <div key={version.id} className={`${baseClasses} ${selectedClasses}`}>
                                    <div className='p-4 cursor-pointer' onClick={() => handleVersionClick(version)}>
                                        {/* Version Header */}
                                        <div className='flex items-start justify-between mb-3'>
                                            <div className='flex items-center gap-2 flex-1'>
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        version.isCurrentVersion ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                />
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                            {version.isNamed
                                                                ? version.name
                                                                : `Version ${versionHistory.length - index}`}
                                                        </span>
                                                        {version.isCurrentVersion && (
                                                            <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
                                                                Current
                                                            </span>
                                                        )}
                                                        {version.isStarred && (
                                                            <Star className='w-3 h-3 text-yellow-500 fill-current' />
                                                        )}
                                                    </div>
                                                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                                                        {version.fullDate}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className='p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600'>
                                                <MoreVertical className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                                            </button>
                                        </div>

                                        {/* Author */}
                                        <div className='flex items-center gap-2 mb-3'>
                                            <UserAvatar name={version.author} size='sm' showTooltip />
                                            <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                                                {version.author}
                                            </span>
                                        </div>

                                        {/* Collaborators */}
                                        <div className='mb-3'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                                    Collaborators ({version.collaborators.length})
                                                </span>
                                            </div>
                                            <div className='flex flex-wrap gap-2'>
                                                {version.collaborators.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className='flex items-center gap-1.5 bg-gray-50 dark:bg-gray-600 rounded-full px-2 py-1'
                                                    >
                                                        <UserAvatar name={c.name} size='xs' />
                                                        <span className='text-xs text-gray-700 dark:text-gray-200'>
                                                            {c.name}
                                                        </span>
                                                        <span
                                                            className={`text-xs px-1.5 py-0.5 rounded-full
                                                            ${
                                                                c.role === 'Owner'
                                                                    ? 'text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                                                                    : ''
                                                            }
                                                            ${
                                                                c.role === 'Editor'
                                                                    ? 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30'
                                                                    : ''
                                                            }
                                                            ${
                                                                c.role === 'Commenter'
                                                                    ? 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30'
                                                                    : ''
                                                            }
                                                            ${
                                                                c.role === 'Viewer'
                                                                    ? 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800/30'
                                                                    : ''
                                                            }
                                                        `}
                                                        >
                                                            {c.role}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Changes Summary */}
                                        <div className='mb-3'>
                                            <div className='text-xs leading-relaxed bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg'>
                                                {expandedVersions[version.id]
                                                    ? version.changes
                                                    : `${version.changes.slice(0, 80)}${
                                                          version.changes.length > 80 ? '...' : ''
                                                      }`}
                                                {version.changes.length > 80 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpanded(version.id);
                                                        }}
                                                        className='ml-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                                    >
                                                        {expandedVersions[version.id] ? 'Show less' : 'Show more'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
                                            <div className='flex items-center gap-1'>
                                                <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
                                                <span>{version.wordCount} words</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons (when selected) */}
                                    {selectedVersion === version.id && (
                                        <div className='px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-600'>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {!version.isCurrentVersion && (
                                                    <button
                                                        onClick={() => handleRestore(version)}
                                                        className='flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium'
                                                    >
                                                        <RotateCcw className='w-3 h-3' />
                                                        Restore
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleNameVersion(version)}
                                                    className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'
                                                >
                                                    <Edit2 className='w-3 h-3' />
                                                    Name
                                                </button>
                                                <button className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'>
                                                    <Download className='w-3 h-3' />
                                                    Download
                                                </button>
                                                <button className='flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs rounded-lg font-medium'>
                                                    <Copy className='w-3 h-3' />
                                                    Duplicate
                                                </button>
                                                {!version.isCurrentVersion && (
                                                    <button
                                                        onClick={() => handleRemove(version)}
                                                        className='col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-600 text-xs rounded-lg font-medium'
                                                    >
                                                        <Trash2 className='w-3 h-3' />
                                                        Remove this version
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Modals */}
                <Modal
                    isOpen={showRestoreModal}
                    onClose={() => setShowRestoreModal(false)}
                    title='Restore this version?'
                >
                    <p className='mb-6 text-gray-600 dark:text-gray-300'>
                        This will replace the current version with the selected version. You can always undo this
                        action.
                    </p>
                    <div className='flex gap-3 justify-end'>
                        <button
                            onClick={() => setShowRestoreModal(false)}
                            className='px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmRestore}
                            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'
                        >
                            Restore
                        </button>
                    </div>
                </Modal>

                {/* Other modals (Remove, Name, Save) use same dark: patterns */}
            </div>

            <Modal isOpen={showRemoveModal} onClose={() => setShowRemoveModal(false)} title='Remove this version?'>
                <p className={`dark:text-gray-300 text-gray-600 mb-6`}>
                    This version will be permanently deleted. This action cannot be undone.
                </p>
                <div className='flex gap-3 justify-end'>
                    <button
                        onClick={() => setShowRemoveModal(false)}
                        className={`px-4 py-2 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-600 hover:bg-gray-100 rounded-md`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmRemove}
                        className='px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md'
                    >
                        Remove
                    </button>
                </div>
            </Modal>

            <Modal isOpen={showNameModal} onClose={() => setShowNameModal(false)} title='Name this version'>
                <div className='mb-4'>
                    <label className={`block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2`}>
                        Version name
                    </label>
                    <input
                        type='text'
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 rounded-md focus:outline-none focus:ring-2`}
                        placeholder='Enter version name...'
                    />
                </div>
                <div className='flex gap-3 justify-end'>
                    <button
                        onClick={() => setShowNameModal(false)}
                        className={`px-4 py-2 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-600 hover:bg-gray-100 rounded-md`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmNameVersion}
                        className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                    >
                        Save
                    </button>
                </div>
            </Modal>

            <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title='Save current version'>
                <div className='mb-4'>
                    <label className={`block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2`}>
                        Version name (optional)
                    </label>
                    <input
                        type='text'
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 rounded-md focus:outline-none focus:ring-2`}
                        placeholder='Enter version name...'
                    />
                </div>
                <div className='flex gap-3 justify-end'>
                    <button
                        onClick={() => setShowSaveModal(false)}
                        className={`px-4 py-2 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-600 hover:bg-gray-100 rounded-md`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmSaveVersion}
                        className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                    >
                        Save Version
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default VersionComponent;
