import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Mail, Lock, CheckCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import AnimatedBlob from '../components/Blob';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggleTool';

import { useLoginMutation } from '../api/userApi';

// Error Component
const ErrorAlert = ({ message, onClose }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 flex items-start gap-2'
            >
                <AlertCircle className='w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                    <p className='text-sm text-red-700 dark:text-red-300'>{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'
                    >
                        ×
                    </button>
                )}
            </motion.div>
        )}
    </AnimatePresence>
);

// Success Component
const SuccessAlert = ({ message, onClose }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className='mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 flex items-start gap-2'
            >
                <CheckCircle className='w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                    <p className='text-sm text-green-700 dark:text-green-300'>{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className='text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors'
                    >
                        ×
                    </button>
                )}
            </motion.div>
        )}
    </AnimatePresence>
);

const InputField = ({
    type,
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    showPasswordToggle = false,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    return (
        <div className='relative'>
            <div
                className={`relative flex items-center transition-all duration-200 rounded-sm ${
                    error
                        ? 'ring-2 ring-red-500/50 dark:ring-red-400/50'
                        : isFocused
                        ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50'
                        : ''
                }`}
            >
                {Icon && (
                    <Icon
                        className={`absolute left-3 w-5 h-5 transition-colors z-10 ${
                            error
                                ? 'text-red-500 dark:text-red-400'
                                : isFocused
                                ? 'text-blue-500 dark:text-blue-400'
                                : 'text-gray-400 dark:text-gray-500'
                        }`}
                    />
                )}
                <input
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${
                        showPasswordToggle ? 'pr-10' : 'pr-4'
                    } py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200`}
                    {...props}
                />
                {showPasswordToggle && (
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors'
                    >
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                )}
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0, y: -5 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className='text-xs text-red-500 dark:text-red-400 mt-1 ml-1'
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main Login Component
const LoginComponent = () => {
    const [formData, setFormData] = useState({
        email: 'pulitarun2432@gmail.com',
        password: '123123',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const [handleLogin, { isLoading: isLoginLoading }] = useLoginMutation();

    const validateForm = () => {
        const newErrors = {};

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
            const res = await handleLogin({ email: formData.email, password: formData.password });

            // Simulate random success/failure for demo
            if (res?.data?.success === true) {
                setSuccessMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate('/user-profile');
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

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
    };

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
            <ThemeToggle className='absolute top-0 left-0 z-20' />

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
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className='text-3xl font-bold text-gray-900 dark:text-white mb-2'
                            >
                                Welcome Back
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='text-gray-600 dark:text-gray-300'
                            >
                                Sign in to your CollabDocs account
                            </motion.p>
                        </div>

                        {/* Alerts */}
                        <ErrorAlert message={generalError} onClose={() => setGeneralError('')} />
                        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />

                        {/* Form */}
                        <div className='space-y-6'>
                            <InputField
                                type='email'
                                placeholder='Enter your email'
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={errors.email}
                                // icon={Mail}
                                autoComplete='email'
                            />

                            <InputField
                                type='password'
                                placeholder='Enter your password'
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={errors.password}
                                // icon={Lock}
                                showPasswordToggle={true}
                                autoComplete='current-password'
                            />

                            {/* Submit Button */}
                            <motion.button
                                type='button'
                                onClick={handleSubmit}
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
                                        Signing In...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className='flex items-center gap-4 my-6'>
                            <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600' />
                            <span className='text-sm text-gray-500 dark:text-gray-400'>or continue with</span>
                            <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600' />
                        </div>

                        {/* Social Login */}
                        <div className='flex gap-3'>
                            <motion.button
                                onClick={() => handleSocialLogin('github')}
                                className='flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200'
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaGithub className='w-4 h-4 text-gray-700 dark:text-gray-300' />
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>GitHub</span>
                            </motion.button>

                            <motion.button
                                onClick={() => handleSocialLogin('google')}
                                className='flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200'
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FcGoogle className='w-4 h-4 text-gray-700 dark:text-gray-300' />

                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Google</span>
                            </motion.button>
                        </div>

                        {/* Footer Links */}
                        <div className='mt-6 text-center space-y-2'>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                Don't have an account?{' '}
                                <button
                                    className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors cursor-pointer'
                                    onClick={() => {
                                        navigate('/signup');
                                    }}
                                >
                                    Sign up
                                </button>
                            </p>
                            <button
                                className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer'
                                onClick={() => {
                                    navigate('/forgot-password');
                                }}
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes blob {
                    0%,
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginComponent;
