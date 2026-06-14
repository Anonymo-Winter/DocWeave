import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, ArrowRight } from 'lucide-react';
import { TbFileTypeDoc } from 'react-icons/tb';
import ThemeToggle from './ThemeToggleTool';
import { DropDown } from '../pages/DashBoard.jsx';

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
];

const Brand = () => (
    <Link to='/' className='flex items-center gap-2 group' aria-label='CollabDocs home'>
        <span className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all'>
            <TbFileTypeDoc className='text-white' size={20} />
        </span>
        <span
            className='font-bold text-lg text-gray-900 dark:text-white tracking-tight'
            style={{ fontFamily: "'Comic Neue', cursive" }}
        >
            CollabDocs
        </span>
    </Link>
);

const Navbar = ({ links = navLinks }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className='sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/70 dark:border-gray-800/70'>
            <div className='max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between'>
                {/* Left: Brand */}
                <Brand />

                {/* Center: Nav links (desktop) */}
                {links?.length > 0 && (
                    <nav className='hidden md:flex items-center gap-1'>
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className='px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                )}

                {/* Right: Actions */}
                <div className='flex items-center gap-2'>
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <>
                            <button
                                type='button'
                                onClick={() => navigate('/dashboard')}
                                className='hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition-colors'
                            >
                                Open app
                                <ArrowRight size={14} />
                            </button>
                            <DropDown />
                        </>
                    ) : (
                        <>
                            <button
                                type='button'
                                onClick={() => navigate('/login')}
                                className='hidden sm:inline-flex h-9 px-3.5 items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                            >
                                Sign in
                            </button>
                            <button
                                type='button'
                                onClick={() => navigate('/signup')}
                                className='inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm transition-all'
                            >
                                Get started
                                <ArrowRight size={14} />
                            </button>
                        </>
                    )}

                    {/* Mobile menu trigger */}
                    {links?.length > 0 && (
                        <button
                            type='button'
                            onClick={() => setMobileOpen((o) => !o)}
                            aria-expanded={mobileOpen}
                            aria-label='Toggle navigation menu'
                            className='md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && links?.length > 0 && (
                <div className='md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95'>
                    <nav className='max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1'>
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className='px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
                            >
                                {link.label}
                            </a>
                        ))}
                        {!isAuthenticated && (
                            <button
                                type='button'
                                onClick={() => {
                                    setMobileOpen(false);
                                    navigate('/login');
                                }}
                                className='sm:hidden mt-1 px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
                            >
                                Sign in
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
