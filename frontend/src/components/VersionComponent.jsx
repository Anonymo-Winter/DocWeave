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
    Mail,
    Circle,
    Loader2,
} from 'lucide-react';
import { createNamedSnapshot, applySnapshotToDoc } from '../util/yjsSnapshots';
import * as Y from 'yjs';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { AiOutlineHistory } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetVersionQuery, useSaveVersionMutation, useGetAllversionsQuery } from '../api/docApi';
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
import { Buffer } from 'buffer';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { getInitials } from '../util/getInitials.js';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card.js';
import { useEditor, EditorContext, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FaRedo } from 'react-icons/fa';

// VersionViewer.jsx
import { Collaboration } from '@tiptap/extension-collaboration';

export const VersionViewer = ({ versionUpdateBase64 }) => {
    const [ydoc] = useState(() => new Y.Doc());

    useEffect(() => {
        if (versionUpdateBase64) {
            try {
                const binaryUpdate = Buffer.from(versionUpdateBase64, 'base64');
                Y.applyUpdate(ydoc, binaryUpdate);
                console.log('✅ Version applied to Ydoc successfully');
            } catch (err) {
                console.error('Failed to apply update:', err);
            }
            return () => {
                ydoc.destroy();
            };
        }
    }, [versionUpdateBase64]);

    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            Collaboration.configure({
                document: ydoc,
            }),
        ],
    });

    if (!editor) return <div>Loading...</div>;

    return (
        <div className='prose dark:prose-invert p-4 border bg-white dark:bg-gray-900 rounded-xl'>
            <EditorContent editor={editor} />
        </div>
    );
};

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
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const { editorId } = useParams();
    const { ydoc, addSnapshot, snapshots, awareness, assignedColor } = useSocket();
    const user = useSelector((state) => state.user.user);
    const [saveVersion] = useSaveVersionMutation();

    const {
        data,
        isLoading: isVersionLoading,
        error,
    } = useGetAllversionsQuery(
        { editorId },
        {
            refetchOnMountOrArgChange: true,
            pollingInterval: 5000,
        },
    );
    // console.log(data?.versions);

    const confirmSaveVersion = async () => {
        if (!ydoc || !awareness) {
            console.warn('❌ Cannot save version: editor or Ydoc missing');
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
            Array.from(awareness.getStates()).map(([clientId, state]) => {
                console.log(state);
                console.log(clientId);
            });
            const collaborators = Array.from(awareness.getStates()).map(([clientId, state]) => ({
                user: state?.user?.id,
                role: state?.user?.role,
                color: state?.user?.color,
            }));
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

    // const restoreVersion = async (selectedVersion) => {
    //     try {
    //         if (!selectedVersion?.update) {
    //             console.warn('❌ No update in selected version');
    //             return;
    //         }

    //         // decode base64 string into Uint8Array
    //         const decodedUpdate = Buffer.from(selectedVersion.update, 'base64');

    //         // apply update into your current Y.Doc
    //         Y.applyUpdate(ydoc, decodedUpdate);

    //         toast.success(`✅ Restored version: ${selectedVersion.name}`);
    //     } catch (err) {
    //         console.error('❌ Failed to restore version:', err);
    //         toast.error('Failed to restore version. Please try again.');
    //     }
    // };

    // const restoreVersion = async (savedUpdateBase64) => {
    //     if (!ydoc) return;

    //     // 1. Decode the saved snapshot
    //     const savedUpdate = Buffer.from(savedUpdateBase64, 'base64');

    //     // 2. Create a new doc and apply saved snapshot
    //     const newDoc = new Y.Doc();
    //     Y.applyUpdate(newDoc, savedUpdate);

    //     // 3. Clear the current doc and overwrite with snapshot
    //     const currentXml = ydoc.getXmlFragment('default');
    //     currentXml.delete(0, currentXml.length); // clear
    //     const newXml = newDoc.getXmlFragment('default');
    //     currentXml.insert(0, Array.from(newXml.toArray())); // copy contents

    //     toast.success('✅ Version restored successfully!');
    // };

    // const restoreVersion = async () => {
    //     let decodedUpdate;

    //     console.log('ydoc snapshot:', ydoc.toJSON());

    //     if (selectedVersion.update?.data) {
    //         // Stored as Buffer in DB
    //         decodedUpdate = Uint8Array.from(selectedVersion.update.data);
    //     } else if (typeof selectedVersion.update === 'string') {
    //         // Fallback: if you ever stored base64
    //         decodedUpdate = Uint8Array.from(Buffer.from(selectedVersion.update, 'base64'));
    //     } else {
    //         throw new Error('Unknown update format');
    //     }

    //     Y.applyUpdate(ydoc, decodedUpdate);

    //     console.log('ydoc snapshot:', ydoc.toJSON());
    // };

    const restoreVersion = async () => {
        let decodedUpdate;

        if (selectedVersion.update?.data) {
            // Stored as Buffer in DB
            decodedUpdate = Uint8Array.from(selectedVersion.update.data);
        } else if (typeof selectedVersion.update === 'string') {
            // Fallback: base64
            decodedUpdate = Uint8Array.from(Buffer.from(selectedVersion.update, 'base64'));
        } else {
            throw new Error('Unknown update format');
        }

        // 1. Get the shared fragment Tiptap is using
        const fragment = ydoc.getXmlFragment('default');

        // 2. Clear existing content
        fragment.delete(0, fragment.length); // clear all child nodes

        // 3. Apply the stored snapshot update into the SAME ydoc
        const tempDoc = new Y.Doc();
        Y.applyUpdate(tempDoc, decodedUpdate);

        // 4. Get the fragment from the snapshot doc
        const snapshotFragment = tempDoc.getXmlFragment('default');

        // 5. Insert cloned content into the live ydoc
        snapshotFragment.toArray().forEach((node) => {
            fragment.push([node.clone()]);
        });

        console.log('✅ Version restored. Current doc:', ydoc.toJSON());
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

    const handleVersionClick = (version) => {
        // setSelectedVersion(version._id === selectedVersion?._id ? null : version);
        setSelectedVersion(version);
    };

    const toggleExpanded = (versionId) => {
        setExpandedVersions((prev) => ({
            ...prev,
            [versionId]: !prev[versionId],
        }));
    };

    const handleRestore = (version) => {
        setShowRestoreModal(true);
        setSelectedVersion(version);
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
        if (!selectedVersion) {
            toast.error('No version selected');
            return;
        }

        restoreVersion(selectedVersion);
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

    const UserAvatar = ({ name, size = 'sm', bgColor }) => {
        const sizeClasses = {
            xs: 'w-5 h-5 text-xs',
            sm: 'w-6 h-6 text-xs',
            md: 'w-8 h-8 text-sm',
        };

        return (
            <div
                className={`${bgColor || 'bg-gray-500'} ${
                    sizeClasses[size]
                } rounded-full flex items-center justify-center text-white font-medium relative group`}
                style={{ backgroundColor: bgColor || 'bg-gray-500' }}
            >
                {getInitials(name)}
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

    if (isVersionLoading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <p className='text-gray-500 dark:text-gray-400'>Loading version history...</p>
            </div>
        );
    }

    return (
        <div className={`h-screen w-screen flex dark:bg-gray-900 bg-gray-50`}>
            {/* Editor Section */}
            <div className='dark:bg-gray-800 bg-white h-full w-full dark:border-gray-700 border-gray-200 border-r shadow-sm flex flex-col'>
                {/* Editor Header */}
                <div
                    className={`p-4 dark:border-gray-700 dark:bg-gray-900 border-gray-200 bg-gray-50 border-b flex justify-between items-center`}
                >
                    {selectedVersion ? (
                        <span className={`ms-10 text-sm md:text-lg font-medium dark:text-white text-gray-800`}>
                            Version Preview: {selectedVersion.name}
                        </span>
                    ) : (
                        <span className={`ms-10 text-sm md:text-lg font-medium dark:text-white text-gray-800`}>
                            Select a version
                        </span>
                    )}
                    <div className='flex items-center gap-4'>
                        {selectedVersion ? (
                            <button
                                type='button'
                                onClick={() => restoreVersion(selectedVersion)}
                                class='flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                            >
                                {0 ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        <span>Restoring...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaRedo className='w-4 h-4 rotate-20' />
                                        <span>Restore Version</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <Dialog open={saveVersionDialogOpen} onOpenChange={setSaveVersionDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        type='button'
                                        // className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors'
                                        class='flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                                    >
                                        <Save className='w-4 h-4' />
                                        <span className='md:block hidden'>Save version</span>
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
                                                onBlur={() => setTimeout(() => setIsFocused(false), 0)}
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
                                            onClick={() => confirmSaveVersion()}
                                            type='submit'
                                            className='px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md'
                                        >
                                            Save Version
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
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
                    {/* <div className={`dark:text-gray-400 text-gray-400 text-center mt-20`}> */}
                    {selectedVersion && (
                        <>
                            <div className='mt-4' key={selectedVersion._id}>
                                <VersionViewer versionUpdateBase64={selectedVersion.update} />
                            </div>
                        </>
                    )}
                    {/* </div> */}
                </div>
            </div>

            {/* Wrapper */}
            <div className='version-sidebar bg-white dark:bg-gray-800 h-full absolute sm:relative w-full md:w-2/3 lg:w-[30%] border-l border-gray-200 dark:border-gray-700 flex flex-col'>
                {/* Header */}
                <div className='p-4 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex-shrink-0 z-[5]'>
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
                            <Menu className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                        </button>
                    </div>
                    <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                        {data?.versions.length} versions available
                    </div>
                </div>

                {/* Version List */}
                <div className='max-h-screen overflow-y-auto'>
                    <div className='p-3 space-y-3'>
                        {data?.versions && data.versions.length === 0 ? (
                            <div className='text-center text-gray-500 dark:text-gray-400 py-10'>
                                No versions available yet. Start editing to create your first version.
                            </div>
                        ) : (
                            <>
                                {/* Hello */}
                                {data?.versions.map((version, index) => {
                                    const baseClasses = `group rounded-xl transition-all duration-200 border-2`;
                                    const selectedClasses = `shadow-md ${
                                        selectedVersion?._id === version._id
                                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-600'
                                            : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500'
                                    }`;
                                    return (
                                        <div key={index} className={`${baseClasses} ${selectedClasses}`}>
                                            <div
                                                className='p-4 cursor-pointer'
                                                onClick={() => handleVersionClick(version)}
                                            >
                                                {/* Header */}
                                                <div className='flex items-start justify-between mb-3'>
                                                    <div className='flex items-center gap-2 flex-1'>
                                                        <div
                                                            className={`w-3 h-3 rounded-full ${
                                                                index === 0 ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        />
                                                        <div className='flex-1'>
                                                            <div className='flex items-center gap-2 mb-1'>
                                                                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                                    {version?.name}
                                                                </span>
                                                                {index === 0 && (
                                                                    <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
                                                                        Current
                                                                    </span>
                                                                )}
                                                                {version.isStarred && (
                                                                    <Star className='w-3 h-3 text-yellow-500 fill-current' />
                                                                )}
                                                            </div>
                                                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                                                                {new Date(version.createdAt).toLocaleString([], {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Author */}
                                                <div className='flex items-center gap-2 mb-3'>
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <button className='flex items-center gap-2'>
                                                                <UserAvatar
                                                                    name={version?.author?.data?.name}
                                                                    bgColor={version?.author?.color}
                                                                    size='xs'
                                                                    showTooltip
                                                                />
                                                                <span className='text-sm font-medium text-gray-700 dark:text-gray-200 truncate'>
                                                                    {version?.author?.data?.name}
                                                                </span>
                                                            </button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className='text-xs w-fit'>
                                                            {version?.author?.data?.email}
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>

                                                {/* Collaborators */}
                                                <div className='mb-3'>
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                                            Collaborators ({version.collaborators.length})
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-col gap-1'>
                                                        {version.collaborators.map((c, i) => (
                                                            <div
                                                                key={i}
                                                                className='flex items-center gap-1.5 rounded-full'
                                                            >
                                                                <HoverCard>
                                                                    <HoverCardTrigger asChild>
                                                                        <button className='flex items-center gap-1.5'>
                                                                            <UserAvatar
                                                                                name={c?.user?.name}
                                                                                bgColor={c?.color}
                                                                                size='xs'
                                                                                showTooltip
                                                                            />
                                                                            <span className='text-xs text-gray-700 dark:text-gray-200 truncate'>
                                                                                {c.user?.name}
                                                                            </span>
                                                                        </button>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent className='text-xs w-fit'>
                                                                        {version?.author?.data?.email}
                                                                    </HoverCardContent>
                                                                </HoverCard>
                                                                <span
                                                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                                        {
                                                                            owner: 'text-purple-600 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
                                                                            editor: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
                                                                            Viewer: 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800/30',
                                                                        }[c.role]
                                                                    }`}
                                                                >
                                                                    {c.role.charAt(0).toUpperCase() + c.role.slice(1)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Changes Summary */}
                                                {version.description && (
                                                    <div className='mb-3'>
                                                        <div className='text-xs leading-relaxed bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg'>
                                                            {expandedVersions[version._id]
                                                                ? version.description
                                                                : `${version.description.slice(0, 80)}${
                                                                      version.description.length > 80 ? '...' : ''
                                                                  }`}
                                                            {version?.description?.length > 80 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleExpanded(version._id);
                                                                    }}
                                                                    className='ml-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                                                                >
                                                                    {expandedVersions[version._id]
                                                                        ? 'Show less'
                                                                        : 'Show more'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
                                                        <span>{version.wordCount} words</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {selectedVersion?._id === version._id && (
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
                            </>
                        )}
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
