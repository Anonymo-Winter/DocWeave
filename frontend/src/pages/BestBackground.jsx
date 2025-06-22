import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Github, Mail, Lock, CheckCircle, Palette } from 'lucide-react';
import { useMemo } from 'react';
import {
    Edit,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Image,
    Link,
    Code,
    Table,
    AlignLeft,
    AlignCenter,
    AlignRight,
    FileText,
    Clipboard,
    Columns,
} from 'lucide-react';

const DocIconsBackground = () => {
    // Generate non-overlapping positions
    const positions = useMemo(() => {
        const pos = [];
        const iconSize = 24; // Approximate icon size in pixels

        while (pos.length < 30) {
            const newPos = {
                x: Math.random() * 90 + 5, // 5-95% to avoid edges
                y: Math.random() * 90 + 5,
                size: Math.random() * 0.8 + 0.7, // 0.7-1.5rem
                rotate: Math.random() * 15 - 7.5, // -7.5 to +7.5 degrees
            };

            // Check for collisions
            const collision = pos.some(
                (p) => Math.sqrt(Math.pow(p.x - newPos.x, 2) + Math.pow(p.y - newPos.y, 2)) < 10,
            );

            if (!collision) pos.push(newPos);
        }
        return pos;
    }, []);

    const icons = [
        Edit,
        Type,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        List,
        ListOrdered,
        Image,
        Link,
        Code,
        Table,
        AlignLeft,
        AlignCenter,
        AlignRight,
        FileText,
        Clipboard,
        Columns,
    ];

    return (
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
            {positions.map((pos, i) => {
                const Icon = icons[i % icons.length];
                return (
                    <motion.div
                        key={i}
                        className='absolute'
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            fontSize: `${pos.size}rem`,
                            rotate: `${pos.rotate}deg`,
                        }}
                        animate={{
                            y: [0, pos.size * 5, 0],
                            opacity: [0.7, 0.9, 0.7],
                        }}
                        transition={{
                            duration: Math.random() * 15 + 15,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                        }}
                    >
                        <div className='relative'>
                            <Icon
                                className={`
                text-violet-400/30 dark:text-violet-300/30
                drop-shadow-lg
                transition-all duration-1000
              `}
                            />
                            <Icon
                                className={`
                absolute inset-0
                text-violet-500/70 dark:text-violet-400/60
                opacity-0 hover:opacity-100
                transition-opacity duration-300
                filter blur-[1px]
              `}
                            />
                        </div>
                    </motion.div>
                );
            })}

            {/* Glow overlay */}
            <div className='absolute inset-0 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/10 dark:to-violet-800/5' />
        </div>
    );
};

const ProfessionalBackground = () => {
    // Non-overlapping positions with collision detection
    const positions = useMemo(() => {
        const pos = [];
        while (pos.length < 24) {
            // Optimal number for performance
            const newPos = {
                x: Math.random() * 85 + 7.5, // Keep away from edges
                y: Math.random() * 85 + 7.5,
                size: Math.random() * 0.7 + 0.8, // 0.8-1.5rem
                rotate: Math.random() * 12 - 6,
                speed: Math.random() * 20 + 20, // Animation duration
            };

            // Collision check (8% minimum spacing)
            const collision = pos.some((p) => Math.abs(p.x - newPos.x) < 8 && Math.abs(p.y - newPos.y) < 8);

            if (!collision) pos.push(newPos);
        }
        return pos;
    }, []);

    const icons = [Edit, Type, Bold, Italic, Link, Code, Table, FileText, Clipboard, Image, AlignLeft, AlignCenter];

    return (
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
            {/* Subtle grid foundation */}
            <div
                className='absolute inset-0 opacity-5 dark:opacity-[0.03]'
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(124, 58, 237, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 58, 237, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '3rem 3rem',
                }}
            />

            {/* Floating document icons */}
            {positions.map((pos, i) => {
                const Icon = icons[i % icons.length];
                return (
                    <motion.div
                        key={i}
                        className='absolute'
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            fontSize: `${pos.size}rem`,
                            rotate: `${pos.rotate}deg`,
                        }}
                        animate={{
                            y: [0, pos.size * 4, 0],
                            opacity: [0.6, 0.9, 0.6],
                        }}
                        transition={{
                            duration: pos.speed,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                        }}
                    >
                        <div className='relative'>
                            <Icon
                                className={`
                text-violet-300/40 dark:text-violet-400/30
                transition-all duration-1000
              `}
                            />
                            <Icon
                                className={`
                absolute inset-0
                text-violet-500/80 dark:text-violet-300/70
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                filter blur-[1px]
              `}
                            />
                        </div>
                    </motion.div>
                );
            })}

            {/* Animated gradient overlay */}
            <motion.div
                className='absolute inset-0'
                animate={{
                    background: [
                        'radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.03) 0%, transparent 60%)',
                        'radial-gradient(circle at 70% 60%, rgba(124, 58, 237, 0.03) 0%, transparent 60%)',
                        'radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.03) 0%, transparent 60%)',
                    ],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            />
        </div>
    );
};
// Background Selector Component
const BackgroundSelector = ({ currentBg, setCurrentBg }) => {
    const backgrounds = ['blobs', 'particles', 'gradient-mesh', 'glass-morphism', 'grid'];

    const nextBg = () => {
        const currentIndex = backgrounds.indexOf(currentBg);
        const nextIndex = (currentIndex + 1) % backgrounds.length;
        setCurrentBg(backgrounds[nextIndex]);
    };

    return (
        <motion.button
            onClick={nextBg}
            className='fixed bottom-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all z-50'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title='Change background style'
        >
            <Palette className='w-5 h-5' />
            <span className='sr-only'>Change background</span>
        </motion.button>
    );
};

// Background Components
const BlobBackground = () => (
    <>
        <motion.div
            className='absolute rounded-full bg-blue-500/20 z-10'
            style={{
                width: '800px',
                height: '800px',
                left: '20%',
                top: '50%',
                filter: 'blur(80px)',
            }}
            animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
            }}
        />
        <motion.div
            className='absolute rounded-full bg-purple-500/20 z-10'
            style={{
                width: '600px',
                height: '600px',
                left: '70%',
                top: '20%',
                filter: 'blur(80px)',
            }}
            animate={{
                x: [0, -30, 0],
                y: [0, 40, 0],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
            }}
        />
    </>
);

const ParticleBackground = () => (
    <div className='fixed inset-0 z-10 overflow-hidden opacity-30'>
        {[...Array(500)].map((_, i) => (
            <motion.div
                key={i}
                className='absolute rounded-full bg-blue-500/50 dark:bg-rose-400'
                style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                animate={{
                    x: `${Math.random() * 100 - 50}%`,
                    y: `${Math.random() * 100 - 50}%`,
                    rotate: Math.random() * 360,
                }}
                transition={{
                    duration: Math.random() * 20 + 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
            />
        ))}
    </div>
);

const GradientMeshBackground = () => (
    <div className='fixed inset-0 z-10 overflow-hidden opacity-50'>
        <div
            className='absolute inset-0'
            style={{
                background:
                    'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
            }}
        />
    </div>
);

const GlassMorphismBackground = () => (
    <div className='fixed inset-0 z-10 overflow-hidden opacity-40'>
        {/* <div
            className='absolute inset-0'
            style={{
                background: `
                    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)`,
            }}
        /> */}
        <div
            className='absolute inset-0'
            style={{
                background: `
                    radial-gradient(circle at bottom right, red 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)`,
            }}
        />
        {/* <div
            className='absolute inset-0'
            style={{
                background: `
                    radial-gradient(circle at top right, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)`,
            }}
        /> */}
        <div
            className='absolute inset-0'
            style={{
                background: `
                    radial-gradient(circle at top left, red 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)`,
            }}
        />
    </div>
);

const GridBackground = () => (
    <div className='fixed inset-0  overflow-hidden'>
        {/* Dark grid - visible in light mode */}
        <div
            className='absolute inset-0 opacity-20 dark:opacity-0'
            style={{
                backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 1px, transparent 1px)
        `,
                backgroundSize: '3rem 3rem',
            }}
        />

        {/* Light grid - visible in dark mode */}
        <div
            className='absolute inset-0 opacity-0 dark:opacity-[0.08]'
            style={{
                backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
        `,
                backgroundSize: '3rem 3rem',
            }}
        />

        {/* Subtle radial gradient overlay */}
        <div
            className='absolute inset-0 opacity-40 dark:opacity-20'
            style={{
                background: `
          radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(99, 102, 241, 0.05) 50%,
            transparent 100%
          )
        `,
            }}
        />
    </div>
);

// Main Login Component
const LoginComponent = () => {
    const [currentBg, setCurrentBg] = useState('blobs');
    const [isDark, setIsDark] = useState(false);

    const renderBackground = () => {
        switch (currentBg) {
            case 'particles':
                return <ParticleBackground />;
            case 'gradient-mesh':
                return <GradientMeshBackground />;
            case 'glass-morphism':
                return <GlassMorphismBackground />;
            case 'grid':
                return <GridBackground />;
            default:
                return <ProfessionalBackground />;
            // return <DocIconsBackground />;
        }
    };

    return (
        <div
            className={`min-h-screen w-full flex relative overflow-hidden transition-colors duration-300 ${
                isDark ? 'dark bg-gray-900' : 'bg-gray-50'
            }`}
        >
            {/* Background Selector */}
            <BackgroundSelector currentBg={currentBg} setCurrentBg={setCurrentBg} />

            {/* Theme Toggle */}
            <button
                onClick={() => setIsDark(!isDark)}
                className='fixed top-4 left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all z-50'
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            {/* Dynamic Background */}
            {renderBackground()}
            {/* <BlobBackground /> */}

            {/* Login Form */}
            <div className='flex-1 flex items-center justify-center p-4 z-10 relative'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-md'
                >
                    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8'>
                        <div className='text-center mb-8'>
                            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Welcome Back</h1>
                            <p className='text-gray-600 dark:text-gray-300'>Sign in to your account</p>
                        </div>

                        <div className='space-y-4'>
                            <div className='space-y-6'>
                                <div className='relative'>
                                    <div className='relative flex items-center'>
                                        <Mail className='absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500' />
                                        <input
                                            type='email'
                                            placeholder='Enter your email'
                                            className='w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white/80 dark:focus:bg-gray-800/80 transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                <div className='relative'>
                                    <div className='relative flex items-center'>
                                        <Lock className='absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500' />
                                        <input
                                            type='password'
                                            placeholder='Enter your password'
                                            className='w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white/80 dark:focus:bg-gray-800/80 transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                <button className='w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200'>
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginComponent;
