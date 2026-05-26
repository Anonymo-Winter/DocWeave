import { useMemo } from 'react';
import { AlertTriangle, XCircle, ServerCrash, RefreshCcw, ArrowLeft, FileQuestion, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TONES = {
    danger: {
        ring: 'border-red-200 dark:border-red-900',
        bg: 'bg-red-50/70 dark:bg-red-950/40',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-800 dark:text-red-200',
        body: 'text-red-700 dark:text-red-300',
        meta: 'text-red-500',
        primary: 'bg-red-600 hover:bg-red-700 focus:ring-red-400',
        secondaryBorder: 'border-red-300 dark:border-red-800',
        secondaryText: 'text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50',
    },
    warning: {
        ring: 'border-amber-200 dark:border-amber-900',
        bg: 'bg-amber-50/70 dark:bg-amber-950/40',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-800 dark:text-amber-200',
        body: 'text-amber-700 dark:text-amber-300',
        meta: 'text-amber-500',
        primary: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-400',
        secondaryBorder: 'border-amber-300 dark:border-amber-800',
        secondaryText: 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    },
    info: {
        ring: 'border-blue-200 dark:border-blue-900',
        bg: 'bg-blue-50/70 dark:bg-blue-950/40',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-800 dark:text-blue-200',
        body: 'text-blue-700 dark:text-blue-300',
        meta: 'text-blue-500',
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400',
        secondaryBorder: 'border-blue-300 dark:border-blue-800',
        secondaryText: 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    },
};

export default function ErrorMessage({ error, onRetry, showBack = true }) {
    const navigate = useNavigate();

    const { status, title, description, Icon, tone } = useMemo(() => {
        const statusCode = error?.status || 500;
        const message = error?.message || error?.data?.message || 'Something went wrong.';

        if (statusCode === 404) {
            return {
                status: 404,
                title: 'Not found',
                description: message,
                Icon: FileQuestion,
                tone: 'info',
            };
        }

        if (statusCode === 403) {
            return {
                status: 403,
                title: 'Access denied',
                description: message,
                Icon: Lock,
                tone: 'warning',
            };
        }

        if (statusCode === 400) {
            return {
                status: 400,
                title: 'Bad request',
                description: message,
                Icon: AlertTriangle,
                tone: 'warning',
            };
        }

        if (statusCode >= 500) {
            return {
                status: statusCode,
                title: 'Server error',
                description: message,
                Icon: ServerCrash,
                tone: 'danger',
            };
        }

        return {
            status: statusCode,
            title: 'Unexpected error',
            description: message,
            Icon: XCircle,
            tone: 'danger',
        };
    }, [error]);

    const t = TONES[tone];

    return (
        <div className='min-h-[calc(100vh-6rem)] flex items-center justify-center px-4'>
            <div
                role='alert'
                className={`w-full max-w-md rounded-2xl border ${t.ring} ${t.bg} p-6 shadow-sm`}
            >
                <div className='flex items-start gap-4'>
                    <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20 ${t.icon} shrink-0`}>
                        <Icon className='w-6 h-6' />
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                            <h2 className={`text-lg font-semibold ${t.title}`}>{title}</h2>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${t.meta}`}>
                                {status}
                            </span>
                        </div>

                        <p className={`mt-2 text-sm ${t.body}`}>{description}</p>
                    </div>
                </div>

                <div className='mt-6 flex flex-wrap gap-3'>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={`inline-flex items-center gap-2 rounded-lg ${t.primary} px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 transition-colors`}
                        >
                            <RefreshCcw className='w-4 h-4' />
                            Retry
                        </button>
                    )}

                    {showBack && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`inline-flex items-center gap-2 rounded-lg border ${t.secondaryBorder} bg-white/50 dark:bg-transparent px-4 py-2 text-sm font-medium ${t.secondaryText} focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors`}
                        >
                            <ArrowLeft className='w-4 h-4' />
                            Go to dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
