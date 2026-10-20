import { useEffect, useState } from 'react';
import { getInitials } from '../util/getInitials';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Crown, Edit, Eye, Mail } from 'lucide-react';
import { useSocket } from '../context/socketContext';

const UserHover = ({ isMobile, collab, ownerId }) => {
    const { activeUsers } = useSocket();
    const [activeMap, setActiveMap] = useState({});
    useEffect(() => {
        if (activeUsers) {
            const map = {};
            activeUsers.forEach((user) => {
                map[user.id] = true;
            });
            setActiveMap(map);
        }
    }, [activeUsers]);

    const handleEmailClick = (email) => {
        const subject = encodeURIComponent('Regarding the document');
        const body = encodeURIComponent('Hey, can you check this document?');
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    };

    if (isMobile == true) {
        return (
            <Popover className='block md:hidden'>
                <PopoverTrigger>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className='relative'>
                            <div
                                className='w-10 h-10 rounded-full overflow-hidden flex items-center font-semibold justify-center text-white text-base'
                                style={{
                                    backgroundColor: collab.color,
                                }}
                            >
                                {collab.image ? (
                                    <img
                                        src={collab.image}
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

                        <div className='flex-1 min-w-0 text-left'>
                            <div className='flex items-center gap-1 font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                {collab?.name}{' '}
                                {collab?.role === 'OWNER' ? (
                                    <Crown size={19} className='text-yellow-500' />
                                ) : collab?.role == 'EDITOR' ? (
                                    <Edit size={19} className='text-green-500' />
                                ) : (
                                    <Eye size={19} className='text-blue-500' />
                                )}
                            </div>
                            <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>{collab.email}</div>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    // className='w-fit'
                    className='bg-white block md:hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'
                >
                    <div className='flex items-center gap-3 mb-4'>
                        <div
                            className='w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                            style={{
                                backgroundColor: collab.color,
                            }}
                        >
                            {collab.image ? (
                                <img
                                    src={collab.image}
                                    alt={collab.name}
                                    className='w-full h-full rounded-full object-cover'
                                />
                            ) : (
                                getInitials(collab?.name || '?')
                            )}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                                {collab.name}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>{collab.email}</div>
                            {collab.isOnline && (
                                <div className='flex items-center gap-1 mt-1'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                    <span className='text-xs text-green-600 dark:text-green-400'>Online</span>
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
        );
    }

    return (
        <HoverCard className='hidden md:block'>
            <HoverCardTrigger asChild>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className='relative'>
                        <div
                            style={{
                                '--ring-color': collab.color,
                                backgroundColor: collab.color,
                            }}
                            className='w-10 h-10 rounded-full overflow-hidden
                                flex items-center justify-center
                                font-semibold text-white
                                border-2 border-white dark:border-gray-800
                                shadow
                                ring-2 ring-[var(--ring-color)]'
                        >
                            {collab.image ? (
                                <img
                                    src={collab.image}
                                    alt={collab.name}
                                    className='w-full h-full rounded-full object-cover'
                                />
                            ) : (
                                getInitials(collab?.name || '?')
                            )}
                        </div>
                        {activeMap[collab.id] && (
                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
                        )}
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1 font-semibold text-gray-900 dark:text-white truncate text-sm'>
                            {collab?.name}
                            {collab.id === ownerId ? <Crown size={19} className='text-yellow-500' /> : null}
                        </div>
                        <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>{collab?.email}</div>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72'>
                <div className='flex items-center gap-3 mb-4'>
                    <div
                        className='w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white text-lg font-semibold shadow-sm'
                        style={{
                            backgroundColor: collab.color,
                        }}
                    >
                        {collab.image ? (
                            <img
                                src={collab.image}
                                alt={collab.name}
                                className='w-full h-full rounded-full object-cover'
                            />
                        ) : (
                            getInitials(collab?.name || '?')
                        )}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1 font-semibold text-gray-900 dark:text-white truncate text-sm'>
                            {collab?.name}
                            {collab.id === ownerId ? (
                                <Crown size={19} className='text-yellow-500' />
                            ) : collab.originalRole == 'editor' ? (
                                <Edit size={19} className='text-green-500' />
                            ) : (
                                <Eye size={19} className='text-blue-500' />
                            )}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>{collab?.email}</div>
                        {activeMap[collab.id] && (
                            <div className='flex items-center gap-1 mt-1'>
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span className='text-xs text-green-600 dark:text-green-400'>Online</span>
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
    );
};

export default UserHover;
