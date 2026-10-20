import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { GiOverInfinity } from 'react-icons/gi';
import AnimatedBlob from '../components/Blob';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation, useGoogleAuthMutation } from '../api/userApi';

import ThemeToggle from '../components/ThemeToggleTool';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { InputField } from '../components/InputField';

// Main Login Component
const LoginComponent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [handleSignup] = useRegisterMutation();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        } else if (formData.name.length > 20) {
            newErrors.name = 'Name must be at most 20 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            newErrors.name = 'Name must contain only letters and spaces';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));

        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }

        // Clear general error
        if (generalError) setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setGeneralError('');

        try {
            // Simulate API call
            const res = await handleSignup({ name: formData.name, email: formData.email, password: formData.password });
            if (res?.data?.success === true) {
                setSuccessMessage(res?.data?.message || 'Signup successful! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                throw new Error(res?.error?.data?.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setGeneralError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();

    const signupWithGoogle = useGoogleLogin({
        scope: 'email profile',
        onSuccess: async (tokenResponse) => {
            setGeneralError('');
            try {
                const res = await googleAuth({ accessToken: tokenResponse.access_token }).unwrap();
                if (res?.success) navigate('/dashboard');
            } catch (err) {
                setGeneralError(err?.data?.message || 'Google sign-up failed. Please try again.');
            }
        },
        onError: () => setGeneralError('Google sign-up was cancelled or failed.'),
    });

    return (
        <div className='min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300'>
            {/* Background Layers */}
            <div className='fixed inset-0 overflow-hidden '>
                {/* Gradient Overlay */}
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
                    className='absolute -bottom-[15%] -right-[15%] md:-bottom-[10%] md:-right-[10%] lg:bottom-[5%] lg:right-[5%]
                    xl:bottom-[40%] xl:right-[20%] -z-[5] '
                />
                {/* Bottom-right Blob */}
                <AnimatedBlob
                    size={600}
                    morphDuration={60}
                    enableRotation={false}
                    enableMorph={true}
                    palette='cosmic'
                    className='absolute -top-[15%] -left-[15%] md:-top-[10%] md:-left-[10%] lg:top-[5%] lg:left-[5%]
                                xl:top-[40%] xl:left-[20%] -z-[5]'
                />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle className='absolute top-4 right-4 z-20' />

            {/* Main Content */}
            <div className='flex-1 flex items-center justify-center p-4 relative'>
                {/* Top-left Blob */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-md'
                >
                    {/* Card Container */}
                    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8'>
                        {/* Header */}
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
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1'
                            >
                                Create your account
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='text-sm text-gray-600 dark:text-gray-300'
                            >
                                Start collaborating in seconds
                            </motion.p>
                        </div>

                        {/* Alerts */}
                        <ErrorAlert message={generalError} onClose={() => setGeneralError('')} />
                        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />

                        {/* Form */}
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <InputField
                                type='text'
                                placeholder='Enter your name'
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                error={errors.name}
                                autoComplete='name'
                                icon={FaUser}
                            />
                            <InputField
                                type='email'
                                placeholder='Enter your email'
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={errors.email}
                                icon={FaEnvelope}
                                autoComplete='email'
                            />

                            <InputField
                                type='password'
                                placeholder='Enter your password'
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={errors.password}
                                icon={FaLock}
                                showPasswordToggle={true}
                                autoComplete='new-password'
                            />

                            {/* Submit Button */}
                            <motion.button
                                type='submit'
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${
                                    isLoading
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                                }`}
                                whileHover={isLoading ? {} : { scale: 1.01 }}
                                whileTap={isLoading ? {} : { scale: 0.99 }}
                            >
                                {isLoading ? (
                                    <div className='flex items-center justify-center gap-2'>
                                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                        Creating account…
                                    </div>
                                ) : (
                                    'Create account'
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className='flex items-center gap-4 my-6'>
                            <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600' />
                            <span className='text-sm text-gray-500 dark:text-gray-400'>or continue with</span>
                            <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600' />
                        </div>

                        {/* Social Login */}
                        <motion.button
                            type='button'
                            onClick={() => signupWithGoogle()}
                            disabled={isGoogleLoading}
                            className='w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FcGoogle className='w-5 h-5' />
                            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                {isGoogleLoading ? 'Signing in…' : 'Continue with Google'}
                            </span>
                        </motion.button>

                        {/* Footer Links */}
                        <div className='mt-6 text-center space-y-2'>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                Already have an account?{' '}
                                <button
                                    className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors'
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginComponent;
