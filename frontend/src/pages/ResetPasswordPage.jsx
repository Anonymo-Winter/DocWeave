import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { FaLock } from 'react-icons/fa';
import { GiOverInfinity } from 'react-icons/gi';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AnimatedBlob from '../components/Blob';
import ThemeToggle from '../components/ThemeToggleTool';
import { ErrorAlert } from '../components/Alert';
import { InputField } from '../components/InputField';
import { useResetPasswordMutation } from '../api/userApi';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [resetPassword] = useResetPasswordMutation();

    const [formData, setFormData] = useState({ password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.confirm !== formData.password) {
            newErrors.confirm = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
        if (generalError) setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setGeneralError('This reset link is invalid or missing. Please request a new one.');
            return;
        }
        if (!validateForm()) return;

        setIsLoading(true);
        setGeneralError('');
        try {
            await resetPassword({ token, password: formData.password }).unwrap();
            setDone(true);
        } catch (error) {
            setGeneralError(error?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300'>
            {/* Background Layers */}
            <div className='fixed inset-0 overflow-hidden'>
                <div
                    className='absolute inset-0 opacity-50'
                    style={{
                        background:
                            'radial-gradient(circle at center, rgba(147, 51, 234, 0.18) 0%, rgba(219, 39, 119, 0.1) 50%, transparent 100%)',
                    }}
                />
                <AnimatedBlob
                    size={600}
                    morphDuration={60}
                    enableRotation={false}
                    enableMorph={true}
                    palette='cosmic'
                    className='absolute -bottom-[15%] -right-[15%] xl:bottom-[40%] xl:right-[20%] -z-[5]'
                />
                <AnimatedBlob
                    size={600}
                    morphDuration={60}
                    enableRotation={false}
                    enableMorph={true}
                    palette='cosmic'
                    className='absolute -top-[15%] -left-[15%] xl:top-[40%] xl:left-[20%] -z-[5]'
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
                            <div className='inline-flex items-center gap-2 mb-4'>
                                <span className='w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md'>
                                    <GiOverInfinity className='text-white size-5' />
                                </span>
                                <span className='font-semibold text-gray-900 dark:text-white tracking-tight'>
                                    DocWeave
                                </span>
                            </div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1'>
                                {done ? 'Password updated' : 'Choose a new password'}
                            </h1>
                            <p className='text-sm text-gray-600 dark:text-gray-300'>
                                {done
                                    ? 'Your password has been changed successfully.'
                                    : 'Enter and confirm your new password below.'}
                            </p>
                        </div>

                        <ErrorAlert message={generalError} onClose={() => setGeneralError('')} />

                        {done ? (
                            <div className='text-center'>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6'
                                >
                                    <CheckCircle2 className='h-8 w-8 text-white' />
                                </motion.div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className='w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md transition-all'
                                >
                                    Go to sign in
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className='space-y-5'>
                                <InputField
                                    type='password'
                                    placeholder='New password'
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    error={errors.password}
                                    icon={FaLock}
                                    autoComplete='new-password'
                                />
                                <InputField
                                    type='password'
                                    placeholder='Confirm new password'
                                    value={formData.confirm}
                                    onChange={handleInputChange('confirm')}
                                    error={errors.confirm}
                                    icon={FaLock}
                                    autoComplete='new-password'
                                />

                                <motion.button
                                    type='submit'
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                                        isLoading
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className='flex items-center justify-center gap-2'>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Updating…
                                        </div>
                                    ) : (
                                        'Reset password'
                                    )}
                                </motion.button>
                            </form>
                        )}

                        <div className='mt-6 text-center'>
                            <button
                                onClick={() => navigate('/login')}
                                className='text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1'
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

export default ResetPassword;
