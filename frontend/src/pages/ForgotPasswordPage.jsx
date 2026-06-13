import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { GiOverInfinity } from 'react-icons/gi';
import AnimatedBlob from '../components/Blob';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../api/userApi';

import ThemeToggle from '../components/ThemeToggleTool';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { InputField } from '../components/InputField';
import { FaEnvelope } from 'react-icons/fa';

// Main Login Component
const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const [forgotPassword] = useForgotPasswordMutation();

    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
        if (generalError) setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setGeneralError('');

        try {
            await forgotPassword({ email: formData.email }).unwrap();

            setSuccessMessage('Reset link sent — check your inbox!');
            setShowSuccessAlert(true);
            setCountdown(30); // Start 30-second countdown
        } catch (error) {
            setGeneralError(error?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        handleSubmit(new Event('submit'));
    };

    return (
        <div className='min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300'>
            {/* Background Layers */}
            <div className='fixed inset-0 overflow-hidden'>
                <div
                    className='absolute inset-0 opacity-50'
                    style={{
                        background:
                            'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
                    }}
                />
                <AnimatedBlob
                    size={600}
                    morphDuration={60}
                    enableRotation={false}
                    enableMorph={true}
                    palette='cosmic'
                    className='absolute -bottom-[15%] -right-[15%] md:-bottom-[10%] md:-right-[10%] lg:bottom-[5%] lg:right-[5%] xl:bottom-[40%] xl:right-[20%] -z-[5]'
                />
                <AnimatedBlob
                    size={600}
                    morphDuration={60}
                    enableRotation={false}
                    enableMorph={true}
                    palette='cosmic'
                    className='absolute -top-[15%] -left-[15%] md:-top-[10%] md:-left-[10%] lg:top-[5%] lg:left-[5%] xl:top-[40%] xl:left-[20%] -z-[5]'
                />
            </div>

            <ThemeToggle className='absolute top-4 right-4 z-20' />

            <div className='flex-1 flex items-center justify-center p-4 relative'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-md'
                >
                    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8'>
                        <div className='text-center mb-8'>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='inline-flex items-center gap-2 mb-4'
                            >
                                <span className='w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md'>
                                    <GiOverInfinity className='text-white size-5' />
                                </span>
                                <span className='font-semibold text-gray-900 dark:text-white tracking-tight'>
                                    DocWeave
                                </span>
                            </motion.div>
                            <motion.h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1'>
                                Forgot password?
                            </motion.h1>
                            <motion.p className='text-sm text-gray-600 dark:text-gray-300'>
                                No worries — we'll help you get back in.
                            </motion.p>
                        </div>

                        <ErrorAlert message={generalError} onClose={() => setGeneralError('')} />
                        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />

                        {showSuccessAlert ? (
                            <div className='text-center'>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'
                                >
                                    <Mail className='h-8 w-8 text-white' />
                                </motion.div>
                                <p className='text-gray-500 dark:text-gray-300 mb-6'>
                                    If an account exists for {formData.email}, you will receive a password reset link
                                    shortly.
                                </p>
                                <motion.button
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                                        countdown > 0 || isLoading
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className='flex items-center justify-center gap-2'>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Sending...
                                        </div>
                                    ) : countdown > 0 ? (
                                        `Resend in ${countdown}s`
                                    ) : (
                                        'Resend Link'
                                    )}
                                </motion.button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className='space-y-5'>
                                <InputField
                                    type='email'
                                    placeholder='Enter your email'
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    error={errors.email}
                                    icon={FaEnvelope}
                                    autoComplete='email'
                                />

                                <motion.button
                                    type='submit'
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                                        isLoading
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className='flex items-center justify-center gap-2'>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Sending…
                                        </div>
                                    ) : (
                                        'Send reset link'
                                    )}
                                </motion.button>
                            </form>
                        )}

                        <div className='mt-6 text-center'>
                            <button
                                onClick={() => navigate('/login')}
                                className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1'
                            >
                                <span aria-hidden>←</span> Back to sign in
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
