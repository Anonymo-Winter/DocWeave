import { useMemo } from 'react';
import { AlertTriangle, XCircle, ServerCrash, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ErrorMessage({ error, onRetry, showBack = true }) {
    const navigate = useNavigate();

    const { status, title, description, Icon } = useMemo(() => {
        const statusCode = error?.status || 500;
        const message = error?.message || error?.data?.message || 'Something went wrong.';

        if (statusCode === 404) {
            return {
                status: 404,
                title: 'Document not found',
                description: message,
                Icon: XCircle,
            };
        }

        if (statusCode === 403) {
            return {
                status: 403,
                title: 'Access denied',
                description: message,
                Icon: XCircle,
            };
        }

        if (statusCode === 400) {
            return {
                status: 400,
                title: 'Bad request',
                description: message,
                Icon: AlertTriangle,
            };
        }

        if (statusCode >= 500) {
            return {
                status: statusCode,
                title: 'Server error',
                description: message,
                Icon: ServerCrash,
            };
        }

        return {
            status: statusCode,
            title: 'Unexpected error',
            description: message,
            Icon: AlertTriangle,
        };
    }, [error]);

    return (
        <div className='min-h-[calc(100vh-6rem)] flex items-center justify-center px-4'>
            <div
                role='alert'
                className='w-full max-w-md rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 shadow-md'
            >
                <div className='flex items-start gap-4'>
                    <Icon className='w-8 h-8 text-red-600 dark:text-red-400 shrink-0' />

                    <div className='flex-1'>
                        <h2 className='text-lg font-semibold text-red-800 dark:text-red-300'>{title}</h2>

                        <p className='mt-1 text-sm text-red-700 dark:text-red-400'>{description}</p>

                        <p className='mt-2 text-xs text-red-500'>Error code: {status}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className='mt-6 flex flex-wrap gap-3'>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                        >
                            <RefreshCcw className='w-4 h-4' />
                            Retry
                        </button>
                    )}

                    {showBack && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className='inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400'
                        >
                            <ArrowLeft className='w-4 h-4' />
                            Go back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
