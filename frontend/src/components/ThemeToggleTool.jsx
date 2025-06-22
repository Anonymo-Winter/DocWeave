import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = ({ className }) => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        // Notify other tabs/components
        window.dispatchEvent(new Event('theme-changed'));
    }, [isDark]);

    // Sync with theme changes in other components
    useEffect(() => {
        const syncTheme = () => {
            const current = localStorage.getItem('theme') === 'dark';
            setIsDark(current);
        };

        window.addEventListener('theme-changed', syncTheme);
        return () => window.removeEventListener('theme-changed', syncTheme);
    }, []);

    return (
        <motion.button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full 
                bg-white/60 dark:bg-neutral-800/60 
                backdrop-blur-md shadow-sm 
                border border-gray-300 dark:border-gray-700 
                text-gray-800 dark:text-gray-100 
                hover:bg-white/80 dark:hover:bg-neutral-700/80 
                transition-all duration-200 ease-in-out
                ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {isDark ? '☀️' : '🌙'}
        </motion.button>
    );
};

export default ThemeToggle;
