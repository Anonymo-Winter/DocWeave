import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Mail, Lock, CheckCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import AnimatedBlob from '../components/Blob';
import { useNavigate } from 'react-router-dom';
// Theme Toggle Component
const ThemeToggle = ({ className }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <motion.button
            onClick={() => setIsDark(!isDark)}
            className={`${className} m-4 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {isDark ? '☀️' : '🌙'}
        </motion.button>
    );
};

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
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulate success
            setSuccessMessage('Reset link sent to your email!');
            setShowSuccessAlert(true);
            setCountdown(30); // Start 30-second countdown
        } catch (error) {
            setGeneralError(error.message || 'Failed to send reset link. Please try again.');
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

            <ThemeToggle className='absolute top-0 left-0 z-20' />

            <div className='flex-1 flex items-center justify-center p-4 relative'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-md'
                >
                    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8'>
                        <div className='text-center mb-8'>
                            <motion.h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                                Forgot Password?
                            </motion.h1>
                            <motion.p className='text-gray-600 dark:text-gray-300'>
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
                            <div className='space-y-6'>
                                <InputField
                                    type='email'
                                    placeholder='Enter your email'
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    error={errors.email}
                                    autoComplete='email'
                                />

                                <motion.button
                                    onClick={handleSubmit}
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
                                            Sending...
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </motion.button>
                            </div>
                        )}

                        <div className='mt-6 text-center'>
                            <button
                                onClick={() => navigate('/login')}
                                className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors'
                            >
                                ← Back to Sign In
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
