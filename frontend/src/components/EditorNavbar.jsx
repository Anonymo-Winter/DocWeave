import { useSaveVersionMutation, useChangeDocNameMutation } from '../api/docApi.js';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/socketContext';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    MessageSquareMore,
    Share2,
    History,
    Plus,
    Menu,
    ArrowLeft,
    Mail,
    Crown,
    Eye,
    Edit,
    Sparkles,
    HelpCircle,
} from 'lucide-react';
import AIGenerateModal from './AIGenerateModal.jsx';
import { registerAIOpeners } from '../util/editorBridge.js';
import { TbFileTypeDoc } from 'react-icons/tb';
import { GiOverInfinity } from 'react-icons/gi';
import { MdSave } from 'react-icons/md';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label.tsx';
import { AiOutlineHistory } from 'react-icons/ai';
import { Separator } from '../components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FaAngleDown } from 'react-icons/fa';
import ShareModal from '../components/ShareModal.jsx';
import VersionComponent from '../components/VersionComponent.jsx';
import ConnectionStatus from '../components/ConnectionStatus';
import { DropDown } from '../pages/DashBoard.jsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { getInitials } from '../util/getInitials.js';
import * as Y from 'yjs';
import { Buffer } from 'buffer';
import { getWordCountFromYdoc } from '../util/wordCount.js';
import { cn } from '../lib/utils.ts';

function ChatToggle({ isActive, onClick, children, unreadCount = 0 }) {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label='Toggle chat panel'
            className={`relative h-9 w-9 inline-flex items-center justify-center
                        rounded-md border transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            isActive
                                ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:bg-blue-400/10 dark:border-blue-400 dark:text-blue-400'
                                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
        >
            {children}

            {unreadCount > 0 && (
                <>
                    <span className='sr-only'>{unreadCount} unread messages</span>
                    <span
                        className='absolute -top-1 -right-1
                            h-4 min-w-[16px] px-1
                            rounded-full bg-red-500
                            text-[10px] font-semibold text-white
                            flex items-center justify-center'
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                </>
            )}
        </button>
    );
}

function MobileMenu({ documentName, setDocumentName, collaborators, actions, canRename }) {
    return (
        <div className='px-4 py-4 space-y-5'>
            {/* Document card */}
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3'>
                <label className='text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-1'>
                    Document
                </label>

                <div className='flex items-center gap-2'>
                    <TbFileTypeDoc size={18} className='text-blue-500 shrink-0' />
                    <input
                        disabled={!canRename}
                        type='text'
                        value={documentName}
                        aria-label='Document name'
                        onChange={(e) => setDocumentName(e.target.value)}
                        onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (value && value !== documentName) {
                                actions.renameDocument(value);
                            }
                        }}
                        className={cn(
                            'flex-1 bg-transparent font-semibold text-gray-900 dark:text-white focus:outline-none px-1 py-2',
                            !canRename && 'opacity-60 cursor-not-allowed',
                        )}
                    />
                </div>
            </div>

            {/* Collaborators card */}
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3'>
                <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>Collaborators</span>
                    <span className='text-xs text-gray-500'>{collaborators.length}</span>
                </div>

                <div className='flex items-center -space-x-2'>
                    {collaborators.slice(0, 4).map((c) => (
                        <div
                            key={c.id}
                            style={{ backgroundColor: c.color }}
                            className='
                        w-9 h-9 rounded-full overflow-hidden
                        flex items-center justify-center
                        text-sm font-semibold text-white
                        ring-2 ring-white dark:ring-gray-800
                        shadow
                    '
                        >
                            <span className='sr-only'>{c.name}</span>
                            {c.image ? (
                                <img src={c.image} alt={c.name} className='w-full h-full object-cover' />
                            ) : (
                                getInitials(c.name)
                            )}
                        </div>
                    ))}

                    {collaborators.length > 4 && (
                        <div
                            className='
                        w-9 h-9 rounded-full
                        bg-gray-200 dark:bg-gray-700
                        flex items-center justify-center
                        text-xs font-semibold
                        text-gray-700 dark:text-gray-200
                        ring-2 ring-white dark:ring-gray-800
                        shadow
                    '
                        >
                            +{collaborators.length - 4}
                        </div>
                    )}
                </div>
            </div>

            {/* Primary actions */}
            <div className='grid grid-cols-2 gap-3'>
                <button
                    onClick={actions.openSaveDialog}
                    className='
                h-11 rounded-xl
                flex items-center justify-center gap-2
                bg-blue-600 text-white
                font-medium
                hover:bg-blue-700
                active:bg-blue-800
            '
                >
                    <MdSave size={18} />
                    Save
                </button>

                {/* Secondary actions */}
                <button
                    onClick={actions.openVersionHistory}
                    className='w-full h-11 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                >
                    <History size={18} className='shrink-0' />
                    History
                </button>
            </div>

            {/* Tools */}
            <div className='grid grid-cols-3 gap-3'>
                {canRename && (
                    <button
                        onClick={actions.generateAI}
                        className='h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium text-white bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-sm'
                    >
                        <Sparkles size={18} />
                        AI
                    </button>
                )}
                <button
                    onClick={actions.toggleAsk}
                    className='h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
                >
                    <HelpCircle size={18} />
                    Ask
                </button>
                <button
                    onClick={actions.toggleChat}
                    className='h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                >
                    <MessageSquareMore size={18} />
                    Chat
                </button>
            </div>
        </div>
    );
}

function CollaboratorsDropdown({ list }) {
    const onEmailClick = (toemail) => {
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1` + `&to=${encodeURIComponent(toemail)}`;
        window.open(gmailURL, '_blank');
    };
    return (
        <div
            className='absolute top-full right-0 mt-2 w-72
                rounded-xl border
                bg-white dark:bg-gray-800
                border-gray-200 dark:border-gray-700
                shadow-xl z-20 overflow-hidden'
        >
            {/* Header */}
            <h4
                className='font-semibold text-sm text-gray-900 dark:text-white px-4 py-3 border-b
                  border-gray-200 dark:border-gray-700'
            >
                Active collaborators
            </h4>

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
                            className='w-8 h-8 rounded-full overflow-hidden
                     flex items-center justify-center
                     text-xs font-semibold text-white
                     border-2 border-white dark:border-gray-800
                     ring-2 ring-[var(--ring-color)]
                     shadow shrink-0'
                        >
                            {c.image ? (
                                <img src={c.image} alt={c.name} className='w-full h-full object-cover' />
                            ) : (
                                getInitials(c.name)
                            )}
                        </div>

                        {/* Name & role */}
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                {c?.name}{' '}
                                {c?.role === 'OWNER' ? (
                                    <Crown size={19} className='text-yellow-500' />
                                ) : c?.role == 'EDITOR' ? (
                                    <Edit size={19} className='text-green-500' />
                                ) : (
                                    <Eye size={19} className='text-blue-500' />
                                )}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>{c?.email}</div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2 text-gray-400'>
                            <button
                                type='button'
                                className='p-1 rounded hover:text-emerald-600
                       hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                       transition-colors'
                                aria-label={`Email ${c.name}`}
                                onClick={() => onEmailClick(c.email)}
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

const EditorNavbar = ({
    isChatVisible,
    setIsChatVisible,
    isAskVisible,
    setIsAskVisible,
    document,
    permission,
    canEdit,
    refetch,
}) => {
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { ydoc, awareness, assignedColor, activeUsers, isMobile, fatalSocketError } = useSocket();
    const [saveVersion] = useSaveVersionMutation();
    const user = useSelector((state) => state.user.user);
    const { editorId } = useParams();
    const navigate = useNavigate();
    const [saveVersionDialogOpen, setSaveVersionDialogOpen] = useState(false);
    const [documentName, setDocumentName] = useState(document?.title);
    const [showShareModal, setShowShareModal] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [versionName, setVersionName] = useState('new version');
    const [versionDescription, setVersionDescription] = useState('new description');

    const [versionopen, setVersionopen] = useState(false);
    const [showAIGenerate, setShowAIGenerate] = useState(false);

    // Expose modal openers so the slash-command menu (rendered inside the editor)
    // can trigger them without prop drilling.
    useEffect(() => {
        registerAIOpeners({ openAIGenerate: () => setShowAIGenerate(true) });
        return () => registerAIOpeners({ openAIGenerate: null });
    }, []);

    const [renameDocument] = useChangeDocNameMutation();

    const handleSave = async () => {
        if (!ydoc || !awareness) {
            console.warn('❌ Cannot save version: editor or Ydoc missing');
            return;
        }
        if (!ydoc || !awareness || awareness.getStates().size === 0) {
            console.warn('❌ Cannot save version: Ydoc or awareness not ready');
            toast.error('Editor is not ready yet. Please wait.');
            return;
        }
        try {
            const update = Y.encodeStateAsUpdate(ydoc);
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
                .map(([, state]) => {
                    if (!state?.user?.id) return null; // skip invalid entries
                    return {
                        user: state.user.id,
                        role: state.user.role || 'editor',
                        color: state.user.color || null,
                    };
                })
                .filter(Boolean);

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

    const handleRenameDocument = async (name) => {
        if (name === document?.title) return;

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
    };

    const navbarActions = {
        renameDocument: handleRenameDocument,
        openVersionHistory: () => {
            setMobileMenuOpen(false);
            setVersionopen(true);
        },
        openSaveDialog: () => {
            setMobileMenuOpen(false);
            setSaveVersionDialogOpen(true);
        },
        generateAI: () => {
            setMobileMenuOpen(false);
            setShowAIGenerate(true);
        },
        toggleAsk: () => {
            setMobileMenuOpen(false);
            setIsAskVisible((v) => !v);
        },
        toggleChat: () => {
            setMobileMenuOpen(false);
            setIsChatVisible((v) => !v);
        },
    };

    const onEmailClick = (toemail) => {
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1` + `&to=${encodeURIComponent(toemail)}`;
        window.open(gmailURL, '_blank');
    };

    if (fatalSocketError) {
        return <ErrorMessage error={fatalSocketError} />;
    }

    return (
        <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm'>
            <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
                {/* Left: Logo & Base Controls */}
                <div className='flex items-center'>
                    <button
                        type='button'
                        aria-label='Open menu'
                        aria-expanded={mobileMenuOpen}
                        className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
                        onClick={() => setMobileMenuOpen((open) => !open)}
                    >
                        <Menu size={20} />
                    </button>
                    <button
                        type='button'
                        onClick={() => navigate('/dashboard')}
                        aria-label='Go to dashboard'
                        title='Back to dashboard'
                        className='w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all'
                    >
                        <GiOverInfinity className='text-white' size={18} />
                    </button>
                    <div className='hidden lg:flex items-center gap-2'>
                        {canEdit ? (
                            <input
                                type='text'
                                value={documentName}
                                onChange={(e) => {
                                    setDocumentName(e.target.value);
                                }}
                                onBlur={(e) => {
                                    handleRenameDocument(e.target.value);
                                }}
                                title='Click to rename'
                                className='ml-2 bg-transparent text-ellipsis text-gray-900 dark:text-white font-medium focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 px-2 py-1 rounded transition-colors'
                            />
                        ) : (
                            <span
                                title={documentName}
                                className='ml-2 bg-transparent text-ellipsis text-gray-900 dark:text-white font-medium px-2 py-1 rounded pointer-events-none'
                            >
                                {documentName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className='flex items-center gap-2 sm:gap-3'>
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
                                                    className='w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text-xs text-white border-2 border-white dark:border-gray-800 shadow overflow-hidden'
                                                >
                                                    {c.image ? (
                                                        <img
                                                            src={c.image}
                                                            alt={c.name}
                                                            className='w-full h-full object-cover'
                                                        />
                                                    ) : (
                                                        getInitials(c.name)
                                                    )}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className='bg-white block md:hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'
                                            >
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <div
                                                        className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                        style={{ backgroundColor: c.color }}
                                                    >
                                                        {c.image ? (
                                                            <img
                                                                src={c.image}
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
                                                        shadow overflow-hidden
                                                        focus:outline-none
                                                        focus:ring-2 focus:ring-blue-500/50'
                                                >
                                                    <span className='sr-only'>{c.name}</span>
                                                    {c.image ? (
                                                        <img
                                                            src={c.image}
                                                            alt={c.name}
                                                            className='w-full h-full object-cover'
                                                        />
                                                    ) : (
                                                        getInitials(c.name)
                                                    )}
                                                </button>
                                            </HoverCardTrigger>

                                            <HoverCardContent className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'>
                                                <div className='flex items-center gap-3 mb-4'>
                                                    <div
                                                        className='w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                                                        style={{ backgroundColor: c.color }}
                                                    >
                                                        {c.image ? (
                                                            <img
                                                                src={c.image}
                                                                alt={c.name}
                                                                className='w-full h-full rounded-full object-cover'
                                                            />
                                                        ) : (
                                                            getInitials(c?.name || '?')
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-center gap-1 font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                                            {c?.name}{' '}
                                                            {c?.role === 'OWNER' ? (
                                                                <Crown size={19} className='text-yellow-500' />
                                                            ) : c?.role == 'EDITOR' ? (
                                                                <Edit size={19} className='text-green-500' />
                                                            ) : (
                                                                <Eye size={19} className='text-blue-500' />
                                                            )}
                                                        </div>
                                                        <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                                                            {c?.email}
                                                        </div>
                                                        <div className='flex items-center gap-1 mt-1'>
                                                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                                            <span className='text-xs text-green-600 dark:text-green-400'>
                                                                Online
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <a
                                                    onClick={() => onEmailClick(c?.email)}
                                                    className='w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/70 transition-all duration-200 font-medium cursor-pointer'
                                                >
                                                    <Mail size={16} />
                                                    Send email
                                                </a>
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
                            {showCollaborators && (
                                <CollaboratorsDropdown list={activeUsers} />
                            )}
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
                                <VersionComponent setVersionopen={setVersionopen} canSave={canEdit} />
                                <DialogClose className='absolute top-4 left-4 p-2 z-[2] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
                                    <ArrowLeft className='w-5 h-5' />
                                </DialogClose>
                            </DialogContent>
                        </Dialog>

                        {canEdit && (
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

                                    <DialogContent
                                        className={`
                                            dark:bg-gray-800 bg-white
                                            ${
                                                isMobile
                                                    ? 'min-w-screen w-full min-h-screen h-full rounded-none p-0'
                                                    : 'rounded-lg max-w-md w-full px-5 py-4'
                                            }
                                        `}
                                    >
                                        <DialogHeader>
                                            <DialogTitle className='font-medium dark:text-white text-gray-900'>
                                                Save current version
                                            </DialogTitle>
                                            <DialogDescription>
                                                Save the current state of the document as a new version. You can give it
                                                a name and description.
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
                        )}

                        {/* Share */}
                        <ShareModal
                            data={document}
                            isLoading={!document}
                            open={showShareModal}
                            onOpenChange={setShowShareModal}
                            permission={permission}
                            refetch={refetch}
                        />
                    </div>
                    {/* AI Generate */}
                    {canEdit && (
                        <button
                            type='button'
                            onClick={() => setShowAIGenerate(true)}
                            aria-label='Generate with AI'
                            title='Generate with AI'
                            className='h-9 w-9 hidden md:inline-flex items-center justify-center
                                rounded-md text-white
                                bg-gradient-to-br from-purple-500 to-pink-500
                                hover:from-purple-600 hover:to-pink-600
                                shadow-sm hover:shadow-md
                                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                transition-all'
                        >
                            <Sparkles size={16} />
                        </button>
                    )}

                    {/* Ask the document */}
                    <button
                        type='button'
                        onClick={() => setIsAskVisible(!isAskVisible)}
                        aria-label='Ask the document'
                        title='Ask the document'
                        className={`h-9 w-9 hidden md:inline-flex items-center justify-center
                            rounded-md border transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                                isAskVisible
                                    ? 'bg-purple-600/10 border-purple-600 text-purple-600 dark:bg-purple-400/10 dark:border-purple-400 dark:text-purple-400'
                                    : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                    >
                        <HelpCircle size={16} />
                    </button>

                    {/* Chat Toggle */}
                    <div className='hidden md:block'>
                        <ChatToggle
                            isActive={isChatVisible}
                            onClick={() => {
                                setIsChatVisible(!isChatVisible);
                            }}
                        >
                            <MessageSquareMore size={16} />
                        </ChatToggle>
                    </div>
                    <button
                        type='button'
                        onClick={() => setShowShareModal(true)}
                        className='h-9 w-9 inline-flex items-center justify-center
                        rounded-md
                        bg-blue-600 text-white
                        hover:bg-blue-700
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                        aria-label='Share document'
                    >
                        <Share2 size={16} />
                    </button>
                    <ConnectionStatus />
                    <DropDown />
                </div>
            </div>

            {mobileMenuOpen && (
                <div className='md:hidden w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm'>
                    <MobileMenu
                        documentName={documentName}
                        setDocumentName={setDocumentName}
                        collaborators={activeUsers}
                        actions={navbarActions}
                        canRename={canEdit}
                    />
                </div>
            )}

            <AIGenerateModal open={showAIGenerate} onOpenChange={setShowAIGenerate} />
        </header>
    );
};

export default EditorNavbar;
