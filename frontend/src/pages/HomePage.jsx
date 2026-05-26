import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import AnimatedBlob from '../components/Blob';
import Typewriter from 'typewriter-effect/dist/core';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

const HeroSection = () => {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-950 dark:to-gray-900'>
            <Navbar />

            {/* Hero Content */}
            <div className='container mx-auto px-6 py-20 flex flex-col md:flex-row items-center'>
                <div className='md:w-1/2 mb-10 md:mb-0'>
                    <h1 className='text-5xl font-bold text-gray-900 leading-tight mb-6'>
                        Real-time Collaboration <br />
                        <span className='text-blue-600'>Made Simple</span>
                    </h1>
                    <p className='text-xl text-gray-600 mb-8'>
                        Create, edit, and share documents with your team instantly. No more version confusion - just
                        seamless collaboration.
                    </p>
                    <div className='flex space-x-4'>
                        <button className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg'>
                            Start Collaborating
                        </button>
                        <button className='px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors'>
                            Watch Demo
                        </button>
                    </div>
                </div>
                <div className='md:w-1/2'>
                    {/* Placeholder for app screenshot */}
                    <div className='bg-white p-2 rounded-xl shadow-2xl border border-gray-100'>
                        <div className='bg-gray-100 h-80 rounded-lg flex items-center justify-center'>
                            <span className='text-gray-400'>App Preview</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    // useEffect(() => {
    //     const type = new Typewriter('#animated-text', {
    //         strings: ['Hello', 'World'],
    //         autoStart: true,
    //     });
    // }, []);
    // return (
    //     <div className='relative flex h-screen w-full items-center justify-center overflow-hidden bg-white'>
    //         {/* Background blob with reduced opacity for better text readability */}
    //         <AnimatedBlob
    //             size={900}
    //             // rotationDuration={100}
    //             enableRotation={false}
    //             gradientSpread='50%'
    //             morphDuration={40}
    //             colors={[
    //                 'hsla(357, 95%, 73%, 0.9)', // Bright pink-red
    //                 'hsla(283, 79%, 65%, 0.85)',
    //                 'hsla(216, 82%, 62%, 0.85)', // Blue
    //                 'hsla(76, 75%, 63%, 0.9)',
    //             ]}
    //             gradientCenter={['0%', '0%']}
    //             intensity={1.2}
    //             // blur={true}
    //             className='right-10 opacity-80 blur-2xl'
    //         />
    //         {/* Main content container */}
    //         <div className='container relative z-10 mx-auto px-4'>
    //             <div className='flex flex-col items-center justify-center text-center'>
    //                 {/* Animated gradient text */}
    //                 <motion.span
    //                     className='mb-6 text-5xl font-bold md:text-6xl lg:text-7xl'
    //                     initial={{ opacity: 0, y: 20 }}
    //                     animate={{ opacity: 1, y: 0 }}
    //                     transition={{ duration: 0.8 }}
    //                 >
    //                     {/* <span className='bg-gradient-to-r from-gray-800 via-purple-600 to-gray-800 bg-clip-text text-transparent'>
    //                         Welcome to Our App
    //                     </span> */}
    //                 </motion.span>
    //                 <span id='animated-text'></span>
    //                 {/* <AnimatedTypingSpan typingSpeed={100} deletingSpeed={50} pauseDuration={1000} /> */}
    //                 {/* // Customization options (adjust these constants in the component): // - words: Array of words to
    //                 cycle through // - typingSpeed: Time per character when typing (ms) // - deletingSpeed: Time per
    //                 character when deleting (ms) // - pauseDuration: Time to pause between words (ms) // Example with
    //                 custom words: const myWords = ['Fast.', 'Reliable.', 'Secure.'];
    //                 <AnimatedTypingSpan words={myWords} /> */}
    //                 {/* Subtitle with fade-in animation */}
    //                 <motion.p
    //                     className='mb-8 max-w-2xl text-lg text-gray-600 md:text-xl'
    //                     initial={{ opacity: 0, y: 20 }}
    //                     animate={{ opacity: 1, y: 0 }}
    //                     transition={{ duration: 0.8, delay: 0.2 }}
    //                 >
    //                     Experience the power of animated design with beautiful morphing blobs
    //                 </motion.p>
    //                 {/* Animated button */}
    //                 <motion.div
    //                     initial={{ opacity: 0, y: 20 }}
    //                     animate={{ opacity: 1, y: 0 }}
    //                     transition={{ duration: 0.8, delay: 0.4 }}
    //                 >
    //                     <Button
    //                         size='lg'
    //                         className='text-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
    //                     >
    //                         Get Started
    //                     </Button>
    //                 </motion.div>
    //             </div>
    //         </div>
    //     </div>
    // );
};

const Features = () => {
    return (
        <div className='py-20 bg-white'>
            <div className='container mx-auto px-6'>
                <h2 className='text-3xl font-bold text-center text-gray-900 mb-16'>Powerful Features</h2>

                <div className='grid md:grid-cols-3 gap-10'>
                    {[
                        {
                            icon: '👥', // Replace with actual icon component
                            title: 'Real-time Editing',
                            description: 'See changes as they happen with live updates from all collaborators.',
                        },
                        {
                            icon: '💬',
                            title: 'Comments & Chat',
                            description: 'Discuss changes right in the document with threaded comments.',
                        },
                        {
                            icon: '🔒',
                            title: 'Secure Sharing',
                            description: 'Control exactly who can view, comment, or edit your documents.',
                        },
                    ].map((feature, index) => (
                        <div key={index} className='p-6 rounded-xl hover:shadow-lg transition-shadow'>
                            <div className='text-4xl mb-4'>{feature.icon}</div>
                            <h3 className='text-xl font-semibold mb-2 text-gray-800'>{feature.title}</h3>
                            <p className='text-gray-600'>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Usecases = () => {
    return (
        <div className='py-20 bg-gray-50'>
            <div className='container mx-auto px-6'>
                <h2 className='text-3xl font-bold text-center text-gray-900 mb-16'>Trusted by Teams Worldwide</h2>

                <div className='grid md:grid-cols-2 gap-8'>
                    <div className='bg-white p-8 rounded-xl shadow-sm'>
                        <p className='text-gray-700 italic mb-6'>
                            "DocCollab transformed how our remote team works. We've cut meeting times in half by
                            collaborating in real-time."
                        </p>
                        <div className='flex items-center'>
                            <div className='h-12 w-12 rounded-full bg-gray-300 mr-4'></div>
                            <div>
                                <h4 className='font-medium'>Sarah Johnson</h4>
                                <p className='text-gray-500 text-sm'>Product Manager, TechCorp</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-8 rounded-xl shadow-sm'>
                        <p className='text-gray-700 italic mb-6'>
                            "The version history saved us countless hours when we needed to revert to an earlier draft.
                            Essential for legal teams."
                        </p>
                        <div className='flex items-center'>
                            <div className='h-12 w-12 rounded-full bg-gray-300 mr-4'></div>
                            <div>
                                <h4 className='font-medium'>Michael Chen</h4>
                                <p className='text-gray-500 text-sm'>Partner, Law & Partners LLP</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CallTo = () => {
    return (
        <div className='py-20 bg-blue-600 text-white'>
            <div className='container mx-auto px-6 text-center'>
                <h2 className='text-3xl font-bold mb-6'>Ready to Transform Your Workflow?</h2>
                <p className='text-xl mb-8 max-w-2xl mx-auto text-blue-100'>
                    Join thousands of teams already collaborating more effectively with DocCollab.
                </p>
                <button className='px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg'>
                    Get Started - It's Free
                </button>
            </div>
        </div>
    );
};

const Index = () => {
    return (
        <div className='flex flex-col w-full'>
            <HeroSection />
            <Features />
            <Usecases />
            <CallTo />
        </div>
    );
};

export default Index;
