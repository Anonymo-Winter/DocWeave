import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Error Component
export const ErrorAlert = ({ message, onClose }) => (
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
export const SuccessAlert = ({ message, onClose }) => (
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
