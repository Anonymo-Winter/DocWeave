import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import AnimatedBlob from '../components/Blob';
import { useEffect } from 'react';
import Typewriter from 'typewriter-effect';
import logo from '../assets/logo3.svg';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GithubIcon } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { FaGithub } from 'react-icons/fa';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-950'>
            <AnimatedBlob
                size={900}
                rotationDuration={10}
                enableRotation={true}
                gradientSpread='50%'
                morphDuration={40}
                colors={[
                    'hsla(357, 95%, 73%, 0.9)', // Bright pink-red
                    'hsla(283, 79%, 65%, 0.85)',
                    'hsla(216, 82%, 62%, 0.85)', // Blue
                    'hsla(76, 75%, 63%, 0.9)',
                ]}
                gradientCenter={['-10%', '-5%']}
                intensity={1.2}
                className='right-10 opacity-80 blur-3xl'
            />

            <div className='container relative z-10 mx-auto px-4 h-full'>
                <div className='flex flex-col items-center justify-center mt-16 text-center h-full'>
                    <motion.span
                        className='text-7xl max-w-5xl text-black font-bold md:text-7xl lg:text-8xl font-heading dark:text-white'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        The editor suite to build products with
                    </motion.span>
                    <span className='text-5xl mb-10 text-black dark:text-white md:text-6xl lg:text-8xl'>
                        <Typewriter
                            options={{
                                strings: ['real-time editing', 'awareness & presence', 'create collobrate control'],
                                autoStart: true,
                                loop: true,
                            }}
                        />
                    </span>
                    <motion.p
                        className='mb-8 max-w-4xl text-lg text-gray-900 dark:text-gray-400 md:text-3xl'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Write, edit, and collaborate with your team instantly. Like Google Docs, but open-source and
                        smarter.
                    </motion.p>
                    {/* Animated button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Button
                            size='lg'
                            className='text-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                            onClick={() => {
                                navigate('/login');
                            }}
                        >
                            Get Started
                        </Button>
                        <Button
                            size='lg'
                            className='ml-4 transition-colors duration-1000 px-8 py-4 text-lg bg-white text-black hover:text-white hover:bg-gray-900 hover:shadow-2xl '
                        >
                            Live Demo
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const NavBar = ({ className }) => {
    const navigate = useNavigate();
    return (
        <nav className={`bg-white ${className} flex gap-2 items-center justify-between border`}>
            <div className='flex gap-1'>
                <img src={logo} alt='Logo' className='h-6' />
                <span className='text-black text-xl font-body font-bold' style={{ fontFamily: 'Nunito' }}>
                    Colabdocx
                </span>
            </div>
            <div className='flex items-center justify-evenly gap-1 dark:text-black font-semibold'>
                <motion.button
                    className='cursor-pointer hover:bg-gray-100 p-2 rounded-md'
                    onClick={() => {
                        navigate('/login');
                    }}
                >
                    Login
                </motion.button>
                <motion.button
                    className='cursor-pointer hover:bg-gray-100 p-2 rounded-md'
                    onClick={() => {
                        navigate('/#');
                    }}
                >
                    Features
                </motion.button>
                <motion.button
                    className='cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors duration-500'
                    onClick={() => {
                        navigate('/#');
                    }}
                >
                    <FaGithub />
                </motion.button>
                <ThemeToggle />
                <motion.button
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    whileHover={{
                        scale: 1.02,
                        rotate: [0, 2, -2, 0], // playful wiggle
                        boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    className='bg-black text-white p-2 rounded-lg flex items-center font-body gap-1 group transition-all duration-300'
                >
                    <span className='relative z-10'>Sign in</span>
                    <ArrowRight className='size-4' />
                </motion.button>

                {/* github link */}
                {/* discord link */}
                {/* sign in */}
                {/* email */}
            </div>
        </nav>
    );
};

const Index = () => {
    return (
        <div className='flex flex-col w-full relative gap-0'>
            <NavBar className='px-4 py-2 w-1/2 self-center mt-5 border-b shadow-xs border-gray-300 rounded-lg absolute z-20' />
            <HeroSection />
        </div>
    );
};

export default Index;
