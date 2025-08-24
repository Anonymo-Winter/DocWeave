import { useEffect } from 'react';
import { AlertTriangle, XCircle, ServerCrash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ErrorMessage({ error }) {
    const status = error?.status || 400;
    let title = 'Something went wrong';
    let description = 'Please try again later.';
    let Icon = AlertTriangle;
    const navigate = useNavigate();

    useEffect(() => {
        if (!error) return;

        if (status === 404) {
            toast.error('Resource Not Found', {
                description: 'The resource you’re looking for doesn’t exist.',
                icon: <XCircle className='w-5 h-5' />,
            });

            // redirect after short delay (optional)
            const timer = setTimeout(() => navigate('/dashboard'), 2000);
            return () => clearTimeout(timer);
        }
    }, [error, status, navigate]);

    if (status === 400) {
        title = 'Bad Request';
        description = 'Your request was invalid. Please check and try again.';
        Icon = AlertTriangle;
    } else if (status === 500) {
        title = 'Server Error';
        description = 'The server encountered a problem. Try again later.';
        Icon = ServerCrash;
    } else if (error?.data?.message) {
        description = error.data.message;
    }

    return (
        <div className='min-h-[calc(100vh-6rem)] flex items-center'>
            <div className='my-auto flex items-center gap-3 p-4 border border-red-300 bg-red-50 text-red-700 rounded-2xl shadow-sm max-w-md mx-auto'>
                <Icon className='w-6 h-6 shrink-0' />
                <div className='flex flex-col'>
                    <h2 className='font-semibold text-red-800'>{title}</h2>
                    <p className='text-sm text-red-600'>{description}</p>
                    {status && <span className='text-xs text-red-500 mt-1'>Error code: {status}</span>}
                </div>
            </div>
        </div>
    );
}
