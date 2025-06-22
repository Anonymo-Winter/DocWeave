import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const InputField = ({
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
                    } py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border font-light text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200`}
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
