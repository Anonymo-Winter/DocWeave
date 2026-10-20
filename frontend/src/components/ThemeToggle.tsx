import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState('light');

    const updateHtmlClass = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme) {
            setTheme(savedTheme);
            updateHtmlClass(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            setTheme(systemTheme);
            updateHtmlClass(systemTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        updateHtmlClass(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label='Toggle theme'
            className='inline-flex items-center justify-center size-9 rounded-full border border-gray-300/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-900/50 backdrop-blur text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/70 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer'
        >
            {theme === 'light' ? <Moon className='size-4' /> : <Sun className='size-4' />}
        </button>
    );
};

export default ThemeToggle;
