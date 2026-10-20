import * as React from 'react';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';

// --- Icons ---
import { MoonStarIcon } from '@/components/tiptap-icons/moon-star-icon';
import { SunIcon } from '@/components/tiptap-icons/sun-icon';

export function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true);

    React.useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored) {
            setIsDarkMode(stored === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

    return (
        <Button
            onClick={toggleDarkMode}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            data-style='ghost'
        >
            {isDarkMode ? <MoonStarIcon className='tiptap-button-icon' /> : <SunIcon className='tiptap-button-icon' />}
        </Button>
    );
}
