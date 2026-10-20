import { RotateCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { MdAutorenew } from 'react-icons/md';
import { useSocket } from '../context/socketContext';

const statusConfig = {
    connected: {
        icon: <CheckCircle2 className='w-4 h-4' />,
        label: 'Connected',
        description: 'Real-time collaboration is active',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        pulseColor: 'bg-emerald-400',
    },
    reconnecting: {
        icon: <RotateCw className='w-4 h-4 animate-spin' />,
        label: 'Reconnecting',
        description: 'Attempting to restore connection...',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        pulseColor: 'bg-amber-400',
    },
    disconnected: {
        icon: <AlertTriangle className='w-4 h-4' />,
        label: 'Disconnected',
        description: 'Connection to server was lost',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        pulseColor: 'bg-red-400',
    },
    failed: {
        icon: <AlertTriangle className='w-4 h-4' />,
        label: 'Failed',
        description: 'Connection to server was lost',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        pulseColor: 'bg-yellow-400',
    },
};

const ConnectionStatusIndicator = () => {
    const { socket, connectionStatus } = useSocket();
    const statusKey = connectionStatus?.state || 'disconnected';
    const status = statusConfig[statusKey];
    const statusMessage = connectionStatus?.message;

    if (!status) return null;

    const handleRefresh = () => {
        try {
            socket.current.disconnect();
            socket.current.connect();
        } catch (err) {
            console.error('Manual reconnect failed:', err.message);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <motion.button
                    type='button'
                    aria-label={`Connection status: ${status.label}`}
                    className={cn(
                        'relative h-8 px-3',
                        'inline-flex items-center gap-2',
                        'rounded-md border',
                        'text-xs sm:text-sm font-medium',
                        'transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                        'hover:bg-black/5 dark:hover:bg-white/5',
                        'data-[state=open]:ring-2',
                        status.bgColor,
                        status.borderColor,
                        status.color,
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* screen reader status */}
                    <span className='sr-only'>{status.label}</span>

                    {statusKey === 'connected' && (
                        <span className='absolute -top-1 -right-1 flex h-3 w-3'>
                            <span
                                className={cn(
                                    'absolute inline-flex h-full w-full rounded-full animate-ping opacity-75',
                                    status.pulseColor,
                                )}
                            />
                            <span className={cn('relative inline-flex h-3 w-3 rounded-full', status.pulseColor)} />
                        </span>
                    )}

                    {status.icon}
                    <span className='hidden sm:inline'>{status.label}</span>
                </motion.button>
            </PopoverTrigger>

            <PopoverContent className='w-[90vw] sm:w-80 mt-2 p-0 rounded-xl shadow-xl border overflow-hidden z-50 bg-white dark:bg-gray-900'>
                <div className={cn('px-4 py-3 border-b', 'bg-gray-50 dark:bg-gray-800/60')}>
                    <div className='flex items-center gap-3'>
                        <div className={cn('p-2 rounded-full', 'bg-white dark:bg-gray-800', status.color)}>
                            {status.icon}
                        </div>

                        <div>
                            <h3 className={cn('font-semibold text-base', status.color)}>{status.label}</h3>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>{status.description}</p>
                        </div>
                    </div>
                </div>

                <div className='p-4 space-y-3'>
                    <div
                        className='text-sm text-gray-600 dark:text-gray-400
                bg-gray-50 dark:bg-gray-800
                p-3 rounded-md break-words'
                    >
                        {statusMessage || status.description}
                    </div>

                    {(statusKey === 'disconnected' || statusKey === 'failed') && (
                        <button
                            type='button'
                            onClick={handleRefresh}
                            className='w-full h-9
             inline-flex items-center justify-center gap-2
             rounded-md text-sm font-medium
             bg-blue-600/90 hover:bg-blue-600
             text-white
             transition-colors
             focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                        >
                            <MdAutorenew />
                            Reconnect
                        </button>
                    )}
                </div>

                <div
                    className='px-4 py-2 text-xs
                flex justify-between items-center
                border-t
                bg-gray-50 dark:bg-gray-800
                text-gray-500 dark:text-gray-400'
                >
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>

                    <span className='flex items-center gap-1'>
                        <span
                            className={cn(
                                'w-2 h-2 rounded-full',
                                statusKey === 'connected'
                                    ? 'bg-emerald-400'
                                    : statusKey === 'reconnecting'
                                      ? 'bg-yellow-400'
                                      : 'bg-red-400',
                            )}
                        />
                        Server Status
                    </span>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ConnectionStatusIndicator;
