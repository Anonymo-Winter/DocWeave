import React, { useState, useEffect } from 'react';
import { Home, Search, ArrowLeft, Zap, Star, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [stars, setStars] = useState([]);

    useEffect(() => {
        // Generate random stars for background effect
        const generateStars = () => {
            const newStars = [];
            for (let i = 0; i < 20; i++) {
                newStars.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.8 + 0.2,
                    delay: Math.random() * 2,
                });
            }
            setStars(newStars);
        };
        generateStars();
    }, []);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    return (
        <div
            className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden'
            onMouseMove={handleMouseMove}
        >
            {/* Animated background stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className='absolute animate-pulse'
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        animationDelay: `${star.delay}s`,
                    }}
                >
                    <Star className='text-white fill-current' size={star.size} />
                </div>
            ))}

            {/* Gradient orb that follows mouse */}
            <div
                className='absolute pointer-events-none transition-all duration-1000 ease-out'
                style={{
                    left: `${mousePosition.x}%`,
                    top: `${mousePosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className='w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl' />
            </div>

            <div className='text-center max-w-2xl mx-auto relative z-10'>
                {/* Glowing 404 */}
                <div className='relative mb-8'>
                    <h1 className='text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse'>
                        404
                    </h1>
                    <div className='absolute inset-0 text-8xl md:text-9xl font-black text-white/10 blur-sm'>404</div>
                </div>

                {/* Main content */}
                <div className='space-y-6 mb-10'>
                    <div className='flex items-center justify-center mb-4'>
                        <Sparkles className='text-yellow-400 mr-2 animate-spin' size={24} />
                        <h2 className='text-2xl md:text-3xl font-bold text-white'>Oops! Page not found</h2>
                        <Sparkles className='text-yellow-400 ml-2 animate-spin' size={24} />
                    </div>

                    <p className='text-lg text-gray-300 leading-relaxed max-w-md mx-auto'>
                        The page you're looking for has drifted into the digital void. But don't worry, we'll help you
                        find your way back to reality.
                    </p>
                </div>

                {/* Action buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                    <button
                        className='group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transform'
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => window.history.back()}
                    >
                        <div className='flex items-center space-x-2'>
                            <ArrowLeft size={20} className='transition-transform group-hover:-translate-x-1' />
                            <span>Go Back</span>
                        </div>
                        <div className='absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                    </button>

                    <button
                        className='group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transform'
                        onClick={() => (window.location.href = '/')}
                    >
                        <div className='flex items-center space-x-2'>
                            <Home size={20} className='transition-transform group-hover:scale-110' />
                            <span>Home</span>
                        </div>
                        <div className='absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                    </button>

                    <button className='group relative px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 transform backdrop-blur-sm'>
                        <div className='flex items-center space-x-2'>
                            <Search size={20} className='transition-transform group-hover:rotate-12' />
                            <span>Search</span>
                        </div>
                    </button>
                </div>

                {/* Floating elements */}
                <div className='mt-16 relative'>
                    <div className='absolute -top-10 left-10 animate-bounce' style={{ animationDelay: '0.5s' }}>
                        <Zap className='text-yellow-400' size={32} />
                    </div>
                    <div className='absolute -top-6 right-16 animate-bounce' style={{ animationDelay: '1s' }}>
                        <Star className='text-pink-400 fill-current' size={24} />
                    </div>
                    <div className='absolute top-4 left-1/4 animate-bounce' style={{ animationDelay: '1.5s' }}>
                        <Sparkles className='text-cyan-400' size={28} />
                    </div>
                </div>

                {/* Bottom text */}
                <div className='mt-12'>
                    <p className='text-sm text-gray-400'>
                        Error Code: 404 • Page Not Found • {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            {/* Additional floating particles */}
            <div className='absolute top-20 left-10 w-2 h-2 bg-white/40 rounded-full animate-ping' />
            <div
                className='absolute bottom-32 right-20 w-3 h-3 bg-cyan-400/60 rounded-full animate-ping'
                style={{ animationDelay: '2s' }}
            />
            <div
                className='absolute top-1/2 right-10 w-1 h-1 bg-pink-400/80 rounded-full animate-ping'
                style={{ animationDelay: '1s' }}
            />
        </div>
    );
}
