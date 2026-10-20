import { useMemo } from 'react';
import { AlertTriangle, XCircle, ServerCrash, RefreshCcw, ArrowLeft, FileQuestion, Lock, WifiOff, LogIn } from 'lucide-react';
import { GiOverInfinity } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

const TONES = {
    danger: {
        grad: 'from-red-500 to-rose-600',
        ring: 'ring-red-100 dark:ring-red-950/50',
        pill: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    },
    warning: {
        grad: 'from-amber-500 to-orange-600',
        ring: 'ring-amber-100 dark:ring-amber-950/50',
        pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    info: {
        grad: 'from-blue-500 to-indigo-600',
        ring: 'ring-blue-100 dark:ring-blue-950/50',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    },
};

export default function ErrorMessage({ error, onRetry, showBack = true }) {
    const navigate = useNavigate();

    const { status, title, description, Icon, tone, action } = useMemo(() => {
        // status may arrive as a string ('403') — coerce so comparisons hold.
        const statusCode = Number(error?.status) || 500;
        const code = error?.code;
        const message = error?.message || error?.data?.message;

        if (statusCode === 404 || code === 'DOC_NOT_FOUND') {
            return {
                status: 404,
                title: 'Document not found',
                description: message || "This document doesn't exist or may have been deleted.",
                Icon: FileQuestion,
                tone: 'info',
            };
        }
        if (statusCode === 403 || code === 'NO_ACCESS') {
            return {
                status: 403,
                title: 'Access denied',
                description: message || "You don't have permission to open this document. Ask the owner to share it with you.",
                Icon: Lock,
                tone: 'warning',
            };
        }
        if (statusCode === 401 || code === 'AUTH') {
            return {
                status: 401,
                title: 'Session expired',
                description: message || 'Please sign in again to continue.',
                Icon: LogIn,
                tone: 'warning',
                action: 'login',
            };
        }
        if (code === 'SOCKET_FAILED' || statusCode === 503) {
            return {
                status: statusCode === 503 ? 503 : 'offline',
                title: 'Connection lost',
                description: message || "We couldn't reach the collaboration server. Check your connection and try again.",
                Icon: WifiOff,
                tone: 'danger',
            };
        }
        if (statusCode === 400) {
            return { status: 400, title: 'Bad request', description: message || 'Something about that request was invalid.', Icon: AlertTriangle, tone: 'warning' };
        }
        if (statusCode >= 500) {
            return {
                status: statusCode,
                title: 'Server error',
                description: message || 'Something went wrong on our end. Please try again in a moment.',
                Icon: ServerCrash,
                tone: 'danger',
            };
        }
        return { status: statusCode, title: 'Something went wrong', description: message || 'An unexpected error occurred.', Icon: XCircle, tone: 'danger' };
    }, [error]);

    const t = TONES[tone];
    const primaryBtn =
        'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-pink-700 transition-all';
    const secondaryBtn =
        'inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors';

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-zinc-50 px-4 dark:bg-gray-950'>
            <div className='w-full max-w-md text-center'>
                {/* Brand */}
                <div className='mb-8 flex items-center justify-center gap-2'>
                    <span className='inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm'>
                        <GiOverInfinity className='size-4' />
                    </span>
                    <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent'>
                        DocWeave
                    </span>
                </div>

                <div
                    role='alert'
                    className='rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900'
                >
                    <div
                        className={`mx-auto mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${t.grad} text-white shadow-lg ring-8 ${t.ring}`}
                    >
                        <Icon className='size-7' />
                    </div>

                    <div className='mb-2 flex items-center justify-center gap-2'>
                        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>{title}</h2>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${t.pill}`}>
                            {status}
                        </span>
                    </div>

                    <p className='mx-auto max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                        {description}
                    </p>

                    <div className='mt-7 flex flex-col justify-center gap-3 sm:flex-row'>
                        {action === 'login' && (
                            <button onClick={() => navigate('/login')} className={primaryBtn}>
                                <LogIn className='size-4' /> Sign in
                            </button>
                        )}
                        {onRetry && (
                            <button onClick={onRetry} className={action === 'login' ? secondaryBtn : primaryBtn}>
                                <RefreshCcw className='size-4' /> Try again
                            </button>
                        )}
                        {showBack && (
                            <button onClick={() => navigate('/dashboard')} className={secondaryBtn}>
                                <ArrowLeft className='size-4' /> Back to dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
