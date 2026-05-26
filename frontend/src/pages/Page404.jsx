import { Home, ArrowLeft, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden'>
            {/* Soft animated background blobs */}
            <div className='pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse' />
            <div
                className='pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-pink-500/20 blur-3xl animate-pulse'
                style={{ animationDelay: '1.2s' }}
            />

            <div className='text-center max-w-xl mx-auto relative z-10'>
                <div className='relative inline-block mb-8'>
                    <h1 className='text-[7rem] md:text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 tracking-tighter'>
                        404
                    </h1>
                    <div className='absolute inset-0 text-[7rem] md:text-[10rem] font-black leading-none text-white/5 blur-md select-none' aria-hidden>
                        404
                    </div>
                </div>

                <div className='space-y-3 mb-10'>
                    <h2 className='text-2xl md:text-3xl font-semibold text-white inline-flex items-center gap-2'>
                        <Compass className='text-cyan-300' size={28} />
                        Page not found
                    </h2>
                    <p className='text-base text-gray-300/90 max-w-md mx-auto'>
                        The page you're looking for has drifted into the digital void.
                        Let's get you back on course.
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
                    <button
                        onClick={() => navigate(-1)}
                        className='group inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all'
                    >
                        <ArrowLeft size={18} className='transition-transform group-hover:-translate-x-0.5' />
                        Go back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className='group inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02] transition-all'
                    >
                        <Home size={18} className='transition-transform group-hover:scale-110' />
                        Take me home
                    </button>
                </div>

                <p className='mt-12 text-xs text-gray-400/80 font-mono'>
                    error_code: 404 · {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
