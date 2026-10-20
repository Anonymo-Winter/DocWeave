import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { Button } from '../components/ui/button';
import AnimatedBlob from '../components/Blob';
import ThemeToggle from '../components/ThemeToggle';
import PlaygroundEditor from '../components/PlaygroundEditor';
import { FaGithub } from 'react-icons/fa';
import { GiOverInfinity } from 'react-icons/gi';
import {
    ArrowRight,
    History,
    Download,
    FileText,
    Sparkles,
    Star,
    ShieldCheck,
    Zap,
    Menu,
    X,
    UserCog,
    Check,
    WifiOff,
    RefreshCw,
    Wand2,
    PenLine,
    Globe,
    Lock,
    Image as ImageIcon,
    LayoutGrid,
    Moon,
} from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
};

const REPOS = {
    frontend: 'https://github.com/Anonymo-Winter/docweave_frontend',
    backend: 'https://github.com/Anonymo-Winter/docweave_backend',
};

const NavBar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [ghOpen, setGhOpen] = useState(false);
    const ghRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onDown = (e) => {
            if (ghRef.current && !ghRef.current.contains(e.target)) setGhOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const navLinks = [
        { label: 'Playground', to: 'playground' },
        { label: 'Collaborate', to: 'collaboration' },
        { label: 'AI', to: 'ai' },
        { label: 'Versions', to: 'versions' },
        { label: 'Sharing', to: 'sharing' },
    ];

    const scrollTo = (id) => {
        setOpen(false);
        const el = document.getElementById(id);
        if (!el) return;
        // Defer so the mobile menu can start collapsing first, and offset for the
        // fixed navbar so the section heading isn't hidden underneath it.
        setTimeout(() => {
            const top = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top, behavior: 'smooth' });
        }, 50);
    };

    return (
        <motion.nav
            initial={false}
            animate={{
                backgroundColor: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0)',
            }}
            transition={{ duration: 0.25 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-[backdrop-filter,border-color,box-shadow] duration-300 ${
                scrolled
                    ? 'backdrop-blur-lg border-b border-gray-200/70 dark:border-gray-800/70 shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:!bg-gray-950/70'
                    : 'border-b border-transparent'
            }`}
        >
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
                {/* Logo */}
                <Link to='/' className='col-start-1 flex items-center gap-2 shrink-0 justify-self-start'>
                    <span className='inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm'>
                        <GiOverInfinity className='size-[18px]' />
                    </span>
                    <span
                        className='text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                        style={{ fontFamily: "'Comic Neue', cursive" }}
                    >
                        DocWeave
                    </span>
                </Link>

                {/* Center nav */}
                <div className='col-start-2 hidden lg:flex items-center justify-self-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {navLinks.map((l) => (
                        <button
                            key={l.to}
                            onClick={() => scrollTo(l.to)}
                            className='px-3 py-2 rounded-md hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors'
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* Right cluster */}
                <div className='col-start-3 flex items-center justify-self-end gap-2 shrink-0'>
                    <div className='relative' ref={ghRef}>
                        <button
                            type='button'
                            onClick={() => setGhOpen((v) => !v)}
                            aria-label='View source on GitHub'
                            aria-haspopup='menu'
                            aria-expanded={ghOpen}
                            className='inline-flex items-center justify-center size-9 rounded-full border border-gray-300/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-900/50 backdrop-blur text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/70 hover:text-gray-950 dark:hover:text-white transition-colors'
                        >
                            <FaGithub className='size-4' />
                        </button>
                        {ghOpen && (
                            <div className='absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50'>
                                <a
                                    href={REPOS.frontend}
                                    target='_blank'
                                    rel='noreferrer'
                                    onClick={() => setGhOpen(false)}
                                    className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                                >
                                    <FaGithub className='size-4 shrink-0' /> Frontend repo
                                </a>
                                <a
                                    href={REPOS.backend}
                                    target='_blank'
                                    rel='noreferrer'
                                    onClick={() => setGhOpen(false)}
                                    className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                                >
                                    <FaGithub className='size-4 shrink-0' /> Backend repo
                                </a>
                            </div>
                        )}
                    </div>
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/login')}
                        className='hidden sm:inline-flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white border border-gray-300/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-900/50 backdrop-blur hover:bg-gray-100/80 dark:hover:bg-gray-800/70 px-4 py-2 rounded-full transition-colors'
                    >
                        Login
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/signup')}
                        className='relative hidden sm:inline-flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-full items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow'
                    >
                        <span>Get started</span>
                        <ArrowRight className='size-4' />
                    </motion.button>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className='lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        aria-label='Toggle menu'
                    >
                        {open ? <X className='size-5' /> : <Menu className='size-5' />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            <motion.div
                initial={false}
                animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className='lg:hidden overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-gray-800'
            >
                <div className='container mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1'>
                    {navLinks.map((l) => (
                        <button
                            key={l.to}
                            onClick={() => scrollTo(l.to)}
                            className='text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                        >
                            {l.label}
                        </button>
                    ))}
                    <Link
                        to='/login'
                        onClick={() => setOpen(false)}
                        className='px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                        Login
                    </Link>
                    <Link
                        to='/signup'
                        onClick={() => setOpen(false)}
                        className='mt-1 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-md sm:hidden'
                    >
                        Get started <ArrowRight className='size-4' />
                    </Link>
                </div>
            </motion.div>
        </motion.nav>
    );
};

const Hero = () => {
    const heroRef = useRef(null);
    const [spot, setSpot] = useState({ x: -500, y: -500 });

    const onMove = (e) => {
        const r = heroRef.current?.getBoundingClientRect();
        if (r) setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
    };

    return (
        <section
            ref={heroRef}
            onMouseMove={onMove}
            onMouseLeave={() => setSpot({ x: -500, y: -500 })}
            className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 dark:bg-gray-950 pt-24 pb-12'
        >
            <div
                className='pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300'
                style={{
                    background: `radial-gradient(550px circle at ${spot.x}px ${spot.y}px, rgba(168,85,247,0.10), rgba(236,72,153,0.05) 35%, transparent 65%)`,
                }}
            />
            <AnimatedBlob
                size={560}
                rotationDuration={22}
                enableRotation={true}
                gradientSpread='45%'
                morphDuration={44}
                colors={[
                    'hsla(357, 95%, 73%, 0.9)',
                    'hsla(283, 79%, 65%, 0.85)',
                    'hsla(216, 82%, 62%, 0.85)',
                    'hsla(76, 75%, 63%, 0.9)',
                ]}
                gradientCenter={['-10%', '-5%']}
                intensity={0.6}
                opacity={0.3}
                className='-top-44 -right-28 blur-3xl pointer-events-none'
            />

            <div className='container relative z-10 mx-auto px-4'>
                <div className='flex flex-col items-center text-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='mb-6 inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300'
                    >
                        <Sparkles className='size-4 text-purple-500' />
                        Real-time editing, now with an AI assistant
                    </motion.div>

                    <motion.h1
                        className='max-w-4xl text-5xl md:text-7xl font-bold font-heading text-black dark:text-white leading-[1.08]'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Write together,{' '}
                        <span className='bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent'>
                            in real time
                        </span>
                        .
                    </motion.h1>

                    <motion.p
                        className='mt-5 mb-8 text-xl md:text-2xl font-medium text-gray-500 dark:text-gray-300'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        with{' '}
                        <span className='font-semibold text-purple-600 dark:text-purple-400'>
                            <Typewriter
                                options={{
                                    strings: [
                                        'multiplayer editing',
                                        'AI assistance',
                                        'version history',
                                        'fine-grained sharing',
                                    ],
                                    autoStart: true,
                                    loop: true,
                                }}
                            />
                        </span>
                    </motion.p>

                    <motion.p
                        className='mb-10 max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        DocWeave is a collaborative document editor where your whole team writes on the same page at
                        once — live cursors and presence, a built-in AI that drafts and rewrites, full version history,
                        and sharing controls from private draft to anyone-with-the-link.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className='flex flex-col sm:flex-row gap-3'
                    >
                        <Link to='/signup'>
                            <Button
                                size='lg'
                                className='text-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                            >
                                Get started — it's free
                                <ArrowRight className='size-5 ml-1' />
                            </Button>
                        </Link>
                        <Button
                            size='lg'
                            variant='outline'
                            className='px-8 py-6 text-lg border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                            onClick={() =>
                                document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            Try the editor
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ---- Public Playground (real Tiptap editor, anyone can type) ----------------
const LiveDemo = () => {
    return (
        <section id='playground' className='relative py-24 px-4 bg-white dark:bg-[#0a0a0a] overflow-hidden'>
            <div className='container mx-auto max-w-5xl relative z-10'>
                <motion.div {...fadeUp} className='text-center mb-12'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full uppercase'>
                        Playground
                    </span>
                    <h2 className='mt-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                        Try the editor
                    </h2>
                    <p className='mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        The same Tiptap surface used inside the app, mounted standalone here so you can poke at it.
                        Edits are local — they don't go to a server.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30, rotateX: 6 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ perspective: 1200 }}
                >
                    <PlaygroundEditor />
                </motion.div>

                <p className='mt-6 text-center text-xs text-gray-500 dark:text-gray-500'>
                    Inside the app, keystrokes are wrapped as Yjs CRDT ops and broadcast to the room via Socket.IO.
                </p>
            </div>
        </section>
    );
};

// ---- Real-time multiplayer editing showcase --------------------------------
// Seamless looping for the marquee without depending on framer's `wrap` export.
const wrapValue = (min, max, v) => {
    const range = max - min;
    if (range <= 0) return min;
    return ((((v - min) % range) + range) % range) + min;
};

const ShowcaseCard = ({ title, children }) => (
    <div className='relative w-[300px] sm:w-[340px] shrink-0 select-none rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-5 shadow-sm'>
        <div className='mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
            {title}
        </div>
        <div className='relative h-44 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-zinc-50 dark:bg-gray-950/60 p-4'>
            {children}
        </div>
    </div>
);

const Caret = ({ name, color, x, y, duration }) => (
    <motion.div
        className='absolute top-0 left-0'
        initial={false}
        animate={{ x, y }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
        <motion.div
            className='h-4 w-[2px] rounded-full'
            style={{ backgroundColor: color }}
            animate={{ opacity: [1, 1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
        />
        <span
            className='absolute left-1 -top-4 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white'
            style={{ backgroundColor: color }}
        >
            {name}
        </span>
    </motion.div>
);

const LiveCursorsMock = () => (
    <>
        <div className='space-y-2.5'>
            <div className='h-2.5 w-3/4 rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-2.5 w-full rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-2.5 w-5/6 rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-2.5 w-2/3 rounded bg-gray-200 dark:bg-gray-700' />
        </div>
        <Caret name='Aditya' color='#a855f7' x={[24, 150, 90, 200, 24]} y={[24, 24, 58, 58, 24]} duration={6} />
        <Caret name='Sam' color='#ec4899' x={[180, 70, 150, 30, 180]} y={[58, 58, 24, 24, 58]} duration={7} />
    </>
);

const PresenceMock = () => {
    const people = [
        { initials: 'AD', color: 'bg-purple-500' },
        { initials: 'SM', color: 'bg-pink-500' },
        { initials: 'JK', color: 'bg-blue-500' },
        { initials: 'Ra', color: 'bg-emerald-500' },
    ];
    return (
        <div className='flex h-full flex-col items-center justify-center gap-4'>
            <div className='flex -space-x-3'>
                {people.map((p, i) => (
                    <motion.div
                        key={p.initials}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: i * 0.3,
                            duration: 0.4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            repeatDelay: 2.4,
                        }}
                        className={`flex size-9 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 text-[11px] font-semibold text-white ${p.color}`}
                    >
                        {p.initials}
                    </motion.div>
                ))}
            </div>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                <motion.span
                    className='size-2 rounded-full bg-emerald-500'
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                />
                4 people editing now
            </div>
        </div>
    );
};

const ChatMock = () => {
    const msgs = [
        { name: 'Aditya', color: 'text-purple-500', text: 'pushed the intro section', side: 'left' },
        { name: 'Sam', color: 'text-pink-500', text: 'nice — fixing the table now', side: 'right' },
        { name: 'JK', color: 'text-blue-500', text: 'who’s taking the conclusion?', side: 'left' },
    ];
    return (
        <div className='flex h-full flex-col justify-end gap-2'>
            {msgs.map((m, i) => (
                <motion.div
                    key={m.text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: [0, 1, 1, 1], y: [8, 0, 0, 0] }}
                    transition={{ duration: 5, times: [0, 0.08, 0.92, 1], repeat: Infinity, delay: i * 0.7 }}
                    className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug shadow-sm ${
                        m.side === 'right'
                            ? 'self-end bg-purple-500 text-white'
                            : 'self-start border border-gray-100 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                >
                    <span className={`mr-1 font-semibold ${m.side === 'right' ? 'text-white/90' : m.color}`}>
                        {m.name}
                    </span>
                    {m.text}
                </motion.div>
            ))}
        </div>
    );
};

const OfflineMock = () => (
    <div className='relative flex h-full items-center justify-center'>
        <motion.div
            className='absolute flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, times: [0, 0.46, 0.5, 0.92, 1] }}
        >
            <WifiOff className='size-3.5' /> Offline — saved locally
        </motion.div>
        <motion.div
            className='absolute flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            animate={{ opacity: [1, 1, 0, 0, 1] }}
            transition={{ duration: 6, repeat: Infinity, times: [0, 0.46, 0.5, 0.92, 1] }}
        >
            <RefreshCw className='size-3.5' /> Synced
        </motion.div>
    </div>
);

const UndoMock = () => (
    <div className='flex h-full flex-col justify-center gap-2.5'>
        {/* your edit — reverts on undo */}
        <motion.div
            className='flex items-center gap-2 rounded-lg border-l-2 border-purple-500 bg-purple-500/5 px-2 py-1.5'
            animate={{ opacity: [1, 1, 0.15, 0.15, 1], x: [0, 0, -6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 1] }}
        >
            <span className='rounded bg-purple-500 px-1 py-0.5 text-[9px] font-semibold text-white'>You</span>
            <div className='h-2 flex-1 rounded bg-gray-200 dark:bg-gray-700' />
        </motion.div>
        {/* teammate edit — untouched */}
        <div className='flex items-center gap-2 rounded-lg border-l-2 border-pink-500 bg-pink-500/5 px-2 py-1.5'>
            <span className='rounded bg-pink-500 px-1 py-0.5 text-[9px] font-semibold text-white'>Sam</span>
            <div className='h-2 flex-1 rounded bg-gray-200 dark:bg-gray-700' />
        </div>
        {/* Ctrl+Z chip — pulses at the moment your edit reverts */}
        <motion.div
            className='mt-1 flex items-center gap-1.5 self-center rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
            animate={{ scale: [1, 1, 1.12, 1, 1], opacity: [0.55, 0.55, 1, 0.7, 0.55] }}
            transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.52, 0.62, 1] }}
        >
            <span className='rounded bg-gray-100 px-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200'>Ctrl</span>+
            <span className='rounded bg-gray-100 px-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200'>Z</span>
            <span className='ml-1 text-gray-400 dark:text-gray-500'>undoes only your edit</span>
        </motion.div>
    </div>
);

const RT_CARDS = [
    { title: 'Live cursors', mock: <LiveCursorsMock /> },
    { title: 'Per-user undo', mock: <UndoMock /> },
    { title: 'Who’s in the room', mock: <PresenceMock /> },
    { title: 'In-document chat', mock: <ChatMock /> },
    { title: 'Offline & resync', mock: <OfflineMock /> },
];

const RealtimeMarquee = () => {
    const baseX = useMotionValue(0);
    const trackRef = useRef(null);
    const [half, setHalf] = useState(0);
    const dragging = useRef(false);

    useEffect(() => {
        const measure = () => {
            if (trackRef.current) setHalf(trackRef.current.scrollWidth / 2);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const x = useTransform(baseX, (v) => (half ? wrapValue(-half, 0, v) : 0));

    useAnimationFrame((t, delta) => {
        if (dragging.current || !half) return;
        // Gentle left-to-right drift (~26px/s).
        baseX.set(baseX.get() + (26 * delta) / 1000);
    });

    const cards = [...RT_CARDS, ...RT_CARDS];

    return (
        <div className='relative overflow-hidden py-2'>
            <div className='pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-zinc-50 to-transparent dark:from-gray-950 sm:w-24' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-zinc-50 to-transparent dark:from-gray-950 sm:w-24' />
            <motion.div
                ref={trackRef}
                className='flex w-max cursor-grab gap-5 active:cursor-grabbing'
                style={{ x }}
                onPanStart={() => {
                    dragging.current = true;
                }}
                onPan={(e, info) => baseX.set(baseX.get() + info.delta.x)}
                onPanEnd={() => {
                    dragging.current = false;
                }}
            >
                {cards.map((c, i) => (
                    <ShowcaseCard key={i} title={c.title}>
                        {c.mock}
                    </ShowcaseCard>
                ))}
            </motion.div>
        </div>
    );
};

const RealtimeShowcase = () => (
    <section id='collaboration' className='relative overflow-hidden bg-zinc-50 py-24 dark:bg-gray-950'>
        <div className='container mx-auto max-w-6xl px-4'>
            <motion.div {...fadeUp} className='mb-12 text-center'>
                <span className='inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                    Real-time
                </span>
                <h2 className='mt-4 font-heading text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
                    Real-time, multiplayer editing
                </h2>
                <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                    Everyone in the same document at once — live cursors, presence, in-doc chat, and conflict-free
                    merges that survive a dropped connection. Drag the cards to explore.
                </p>
            </motion.div>
        </div>
        <RealtimeMarquee />
    </section>
);

// ---- AI assistant showcase -------------------------------------------------
// Progressively "streams in" a set of lines, then resets — reads as live generation.
const StreamLines = ({ widths, className = 'bg-purple-200/70 dark:bg-purple-800/50', duration = 3.6 }) => (
    <div className='space-y-2'>
        {widths.map((w, i) => (
            <motion.div
                key={i}
                className={`h-2 rounded ${className}`}
                style={{ width: w, transformOrigin: 'left' }}
                animate={{ scaleX: [0, 1, 1, 0] }}
                transition={{
                    duration,
                    times: [0, 0.45, 0.85, 1],
                    repeat: Infinity,
                    delay: i * 0.45,
                    ease: 'easeInOut',
                }}
            />
        ))}
    </div>
);

const AskMock = () => (
    <div className='flex h-full flex-col gap-3'>
        <div className='max-w-[80%] self-end rounded-2xl rounded-br-sm bg-gray-900 px-3 py-1.5 text-[11px] text-white dark:bg-gray-700'>
            What are the key risks here?
        </div>
        <div className='flex-1 rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-900/40 dark:bg-purple-950/20'>
            <div className='mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400'>
                <Sparkles className='size-3' /> Assistant
            </div>
            <StreamLines widths={['100%', '90%', '70%']} />
        </div>
    </div>
);

const GenerateMock = () => (
    <div className='flex h-full flex-col gap-2.5'>
        <div className='flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'>
            <Wand2 className='size-3 shrink-0 text-purple-500' />
            “Write a short intro about CRDTs”
        </div>
        <div className='flex-1 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-950/40'>
            <div className='mb-2 h-2.5 w-2/5 rounded bg-gray-300 dark:bg-gray-600' />
            <StreamLines widths={['100%', '95%', '88%', '60%']} className='bg-gray-200 dark:bg-gray-700' />
        </div>
    </div>
);

const REWRITE_TONES = ['Professional', 'Casual', 'Formal', 'Friendly'];
const REWRITE_OUTPUTS = [
    'We recommend investigating this further.',
    'we should def dig into this',
    'It is advisable to examine this matter.',
    'Let’s take a friendly look at this!',
];

const RewriteMock = () => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setIdx((p) => (p + 1) % REWRITE_TONES.length), 2200);
        return () => clearInterval(id);
    }, []);
    return (
        <div className='flex h-full flex-col gap-2.5'>
            <div className='rounded-lg border-l-2 border-yellow-400 bg-yellow-100/70 px-2.5 py-1.5 text-[11px] text-gray-600 dark:bg-yellow-500/10 dark:text-gray-300'>
                we should maybe look into this
            </div>
            <div className='flex flex-wrap gap-1.5'>
                {REWRITE_TONES.map((t, i) => (
                    <span
                        key={t}
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
                            i === idx
                                ? 'border-purple-500 bg-purple-500 text-white'
                                : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {t}
                    </span>
                ))}
            </div>
            <div className='flex flex-1 items-center rounded-lg border border-purple-200 bg-purple-50/60 px-2.5 py-1.5 dark:border-purple-900/40 dark:bg-purple-950/20'>
                <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className='flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-200'
                >
                    <PenLine className='size-3 shrink-0 text-purple-500' />
                    {REWRITE_OUTPUTS[idx]}
                </motion.p>
            </div>
        </div>
    );
};

const AICard = ({ tag, title, desc, children }) => (
    <motion.div
        {...fadeUp}
        className='flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow dark:border-gray-800 dark:bg-gray-900/60'
    >
        <div className='mb-1 text-[11px] font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400'>
            {tag}
        </div>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>{title}</h3>
        <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>{desc}</p>
        <div className='relative h-40 rounded-xl border border-gray-100 bg-zinc-50 p-3 dark:border-gray-800 dark:bg-gray-950/50'>
            {children}
        </div>
    </motion.div>
);

const AIShowcase = () => (
    <section id='ai' className='relative overflow-hidden bg-white px-4 py-24 dark:bg-[#0a0a0a]'>
        <div className='container mx-auto max-w-6xl'>
            <motion.div {...fadeUp} className='mb-14 text-center'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'>
                    <Sparkles className='size-3.5' /> AI assistant
                </span>
                <h2 className='mt-4 font-heading text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
                    AI that writes alongside you
                </h2>
                <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                    Streamed straight into the editor over the same socket — ask about the document, generate new
                    content for the whole room, or rewrite a selection in any tone.
                </p>
            </motion.div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <AICard tag='Ask' title='Question the document' desc='Private to you — even viewers can ask.'>
                    <AskMock />
                </AICard>
                <AICard tag='Generate' title='Create new content' desc='Streams live to everyone in the room.'>
                    <GenerateMock />
                </AICard>
                <AICard tag='Rewrite' title='Reshape a selection' desc='Pick a tone; the passage transforms.'>
                    <RewriteMock />
                </AICard>
            </div>
        </div>
    </section>
);

// ---- Shared checklist for showcase sections --------------------------------
const PointList = ({ points }) => (
    <ul className='space-y-3'>
        {points.map((p) => (
            <li key={p} className='flex items-start gap-3 text-gray-600 dark:text-gray-400'>
                <Check className='mt-1 size-4 shrink-0 text-emerald-500' />
                <span>{p}</span>
            </li>
        ))}
    </ul>
);

// ---- Version history showcase ----------------------------------------------
const VERSIONS = [
    { name: 'Final draft', author: 'AD', color: 'bg-purple-500', words: 1284, current: true },
    { name: 'Before review', author: 'SM', color: 'bg-pink-500', words: 1190, starred: true },
    { name: 'Today · 2:30 PM', author: 'JK', color: 'bg-blue-500', words: 1042 },
    { name: 'First outline', author: 'AD', color: 'bg-purple-500', words: 980 },
];

const VersionPanelMock = () => (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60'>
        <div className='mb-3 flex items-center justify-between'>
            <span className='text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
                Version history
            </span>
            <motion.span
                className='flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <span className='size-1.5 rounded-full bg-emerald-500' /> Autosaving
            </motion.span>
        </div>
        <div className='space-y-2'>
            {VERSIONS.map((v, i) => (
                <motion.div
                    key={v.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                        v.current
                            ? 'border-purple-300 bg-purple-50/50 dark:border-purple-800/60 dark:bg-purple-950/20'
                            : 'border-gray-100 dark:border-gray-800'
                    }`}
                >
                    <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${v.color}`}
                    >
                        {v.author}
                    </div>
                    <div className='min-w-0 flex-1'>
                        <span className='block truncate text-xs font-medium text-gray-900 dark:text-white'>
                            {v.name}
                        </span>
                        <div className='text-[10px] text-gray-400 dark:text-gray-500'>{v.words} words</div>
                    </div>
                    {v.current ? (
                        <motion.span
                            className='shrink-0 rounded-md border border-purple-300 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:border-purple-700 dark:text-purple-300'
                            animate={{ opacity: [0.55, 1, 0.55] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Restore
                        </motion.span>
                    ) : v.starred ? (
                        <Star className='size-4 shrink-0 fill-amber-400 text-amber-400' />
                    ) : null}
                </motion.div>
            ))}
        </div>
    </div>
);

const VERSION_POINTS = [
    'Save a named version anytime — each records its author, the collaborators present, and the word count.',
    'Restore the document to any earlier version in one click.',
    'Star the versions that matter, then rename, duplicate, or delete as the history grows.',
    'Autosave runs continuously in the background with a guaranteed max-wait, so a closed tab or crash never costs you work — even between manual saves.',
];

const VersionsShowcase = () => (
    <section id='versions' className='relative overflow-hidden bg-zinc-50 px-4 py-24 dark:bg-gray-950'>
        <div className='container mx-auto max-w-6xl'>
            <motion.div {...fadeUp} className='mb-14 text-center'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                    <History className='size-3.5' /> Version history
                </span>
                <h2 className='mt-4 font-heading text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
                    Rewind to any point
                </h2>
                <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                    Save a named checkpoint whenever you want and restore it in one click — while autosave quietly
                    protects your working copy the whole time you write.
                </p>
            </motion.div>
            <div className='grid grid-cols-1 items-center gap-10 md:grid-cols-2'>
                <motion.div {...fadeUp}>
                    <VersionPanelMock />
                </motion.div>
                <motion.div {...fadeUp} className='text-base'>
                    <PointList points={VERSION_POINTS} />
                </motion.div>
            </div>
        </div>
    </section>
);

// ---- Roles & access showcase -----------------------------------------------
const VIS_MODES = [
    'Restricted — invited people only',
    'Anyone with the link · can view',
    'Anyone with the link · can edit',
    'Anyone in your org · can view',
    'Anyone in your org · can edit',
];

const SHARE_PEOPLE = [
    { name: 'You', initials: 'AD', color: 'bg-purple-500', role: 'Owner' },
    { name: 'Sam Rivera', initials: 'SM', color: 'bg-pink-500', role: 'Editor' },
    { name: 'Jordan Kee', initials: 'JK', color: 'bg-blue-500', role: 'Viewer' },
];

const ROLE_STYLE = {
    Owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Editor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

const ShareDialogMock = () => {
    const [vis, setVis] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setVis((p) => (p + 1) % VIS_MODES.length), 2000);
        return () => clearInterval(id);
    }, []);
    return (
        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60'>
            <div className='mb-4 text-sm font-semibold text-gray-900 dark:text-white'>Share “Project Spec”</div>
            <div className='space-y-2.5'>
                {SHARE_PEOPLE.map((p) => (
                    <div key={p.name} className='flex items-center gap-3'>
                        <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${p.color}`}
                        >
                            {p.initials}
                        </div>
                        <span className='flex-1 truncate text-xs font-medium text-gray-700 dark:text-gray-200'>
                            {p.name}
                        </span>
                        <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLE[p.role]}`}
                        >
                            {p.role}
                        </span>
                    </div>
                ))}
            </div>
            <div className='my-4 h-px bg-gray-100 dark:bg-gray-800' />
            <div className='flex items-center gap-3'>
                <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'>
                    <Globe className='size-4' />
                </div>
                <div className='min-w-0 flex-1'>
                    <div className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                        General access
                    </div>
                    <motion.div
                        key={vis}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='truncate text-xs font-medium text-gray-700 dark:text-gray-200'
                    >
                        {VIS_MODES[vis]}
                    </motion.div>
                </div>
            </div>
            <div className='mt-4 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-gray-950/50'>
                <span className='flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300'>
                    <Lock className='size-3.5' /> Content lock
                </span>
                <motion.div
                    className='relative h-5 w-9 rounded-full'
                    animate={{ backgroundColor: ['#d1d5db', '#d1d5db', '#a855f7', '#a855f7', '#d1d5db'] }}
                    transition={{ duration: 5, repeat: Infinity, times: [0, 0.42, 0.5, 0.92, 1] }}
                >
                    <motion.span
                        className='absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow'
                        animate={{ x: [0, 0, 16, 16, 0] }}
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.42, 0.5, 0.92, 1] }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

const ROLE_POINTS = [
    'Three roles — Owner, Editor, Viewer — enforced on both the REST API and the live socket.',
    'Five visibility modes, from fully restricted to anyone-in-your-org can edit.',
    'Delegated sharing — decide whether editors can re-share and which roles they may grant.',
    'A content lock instantly drops everyone but the owner to view-only.',
    'Add a collaborator and an invitation goes out by email.',
];

const RolesShowcase = () => (
    <section id='sharing' className='relative overflow-hidden bg-white px-4 py-24 dark:bg-[#0a0a0a]'>
        <div className='container mx-auto max-w-6xl'>
            <motion.div {...fadeUp} className='mb-14 text-center'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'>
                    <ShieldCheck className='size-3.5' /> Roles & access
                </span>
                <h2 className='mt-4 font-heading text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
                    Share exactly how you want
                </h2>
                <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                    From a private draft to org-wide editing — set a role per person, choose link or org visibility, or
                    lock the whole document down. The same rules guard every request.
                </p>
            </motion.div>
            <div className='grid grid-cols-1 items-center gap-10 md:grid-cols-2'>
                <motion.div {...fadeUp} className='order-2 text-base md:order-1'>
                    <PointList points={ROLE_POINTS} />
                </motion.div>
                <motion.div {...fadeUp} className='order-1 md:order-2'>
                    <ShareDialogMock />
                </motion.div>
            </div>
        </div>
    </section>
);

const ESSENTIALS = [
    {
        icon: FileText,
        title: 'Rich text editor',
        desc: 'Headings, lists, tasks, code blocks, highlights, alignment, links, and typography.',
    },
    {
        icon: ImageIcon,
        title: 'Inline images',
        desc: 'Drop images straight into the page — uploaded and served through Cloudinary.',
    },
    {
        icon: Download,
        title: 'Export anywhere',
        desc: 'Download any document as PDF, Word, Markdown, or HTML.',
    },
    {
        icon: LayoutGrid,
        title: 'Dashboard & search',
        desc: 'Find documents fast with title search and Owned / Shared / Starred filters.',
    },
    {
        icon: Lock,
        title: 'Secure by default',
        desc: 'Bcrypt-hashed passwords, and one token guards both the API and the live socket.',
    },
    {
        icon: Moon,
        title: 'Dark mode',
        desc: 'Easy on the eyes — and it remembers your preference.',
    },
];

const Features = () => (
    <section id='features' className='relative overflow-hidden bg-zinc-50 px-4 py-24 dark:bg-gray-950'>
        <div className='container mx-auto max-w-6xl'>
            <motion.div {...fadeUp} className='mb-14 text-center'>
                <span className='inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                    The essentials
                </span>
                <h2 className='mt-4 font-heading text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
                    Everything else you'd expect
                </h2>
                <p className='mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400'>
                    The day-to-day details that make it a real editor, not a demo.
                </p>
            </motion.div>

            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                {ESSENTIALS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.title}
                            {...fadeUp}
                            whileHover={{ y: -4 }}
                            className='flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60'
                        >
                            <span className='inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white shadow-md'>
                                <Icon className='size-5' />
                            </span>
                            <div>
                                <h3 className='font-bold text-gray-900 dark:text-white'>{item.title}</h3>
                                <p className='mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);

// ---- Under the hood (architecture highlights) -------------------------------
const Unique = () => {
    const items = [
        {
            icon: Zap,
            title: 'A custom real-time relay',
            description:
                'A single Socket.IO connection carries document updates, chat, awareness, and presence together. New collaborators sync with just a state-vector diff, so joining or reconnecting is instant.',
        },
        {
            icon: ShieldCheck,
            title: 'One permission model, everywhere',
            description:
                'A single source of truth decides what each person can do on a document — and both the REST API and the live socket call into it, so access never drifts between them.',
        },
        {
            icon: UserCog,
            title: 'Layered sharing controls',
            description:
                'Owners control more than who has access: whether editors can re-share, which roles they can grant, and which visibility modes are even available.',
        },
        {
            icon: Star,
            title: 'Versions with full context',
            description:
                'Each saved version records its author, the collaborators present at the time, and the word count — so the history doubles as a lightweight audit trail without a separate events table.',
        },
    ];

    return (
        <section
            id='unique'
            className='relative py-24 px-4 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-gray-950 dark:via-[#0a0a0a] dark:to-gray-950 overflow-hidden'
        >
            <AnimatedBlob
                size={700}
                rotationDuration={20}
                enableRotation={true}
                gradientSpread='40%'
                morphDuration={50}
                colors={['hsla(283, 79%, 65%, 0.5)', 'hsla(216, 82%, 62%, 0.5)', 'hsla(157, 75%, 63%, 0.4)']}
                gradientCenter={['80%', '20%']}
                intensity={0.6}
                opacity={0.35}
                className='blur-3xl pointer-events-none'
            />
            <div className='container mx-auto max-w-6xl relative z-10'>
                <motion.div {...fadeUp} className='text-center mb-16'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 rounded-full uppercase'>
                        Under the hood
                    </span>
                    <h2 className='mt-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                        Built for real-time
                    </h2>
                    <p className='mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        The architecture choices that keep editing fast, consistent, and secure — for everyone in the
                        document at once.
                    </p>
                </motion.div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {items.map(({ icon: Icon, title, description }, idx) => (
                        <motion.div
                            key={title}
                            {...fadeUp}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className='relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-8 shadow-sm hover:shadow-2xl transition-shadow'
                        >
                            <div className='flex items-start gap-4'>
                                <div className='shrink-0 inline-flex items-center justify-center rounded-xl p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'>
                                    <Icon className='size-6' />
                                </div>
                                <div>
                                    <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                                        {title}
                                    </h3>
                                    <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>{description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Stats = () => {
    const groups = [
        {
            label: 'Frontend',
            items: ['React 19', 'Vite', 'Tailwind v4', 'Redux Toolkit', 'Tiptap', 'Framer Motion'],
        },
        {
            label: 'Real-time',
            items: ['Yjs (CRDTs)', 'Socket.IO', 'Tiptap Collaboration', 'y-protocols'],
        },
        {
            label: 'AI & backend',
            items: ['Node.js', 'Express 5', 'Groq · Llama 3.3 70B', 'JWT auth', 'Nodemailer'],
        },
        {
            label: 'Data & files',
            items: ['MongoDB', 'Mongoose', 'Cloudinary', 'Puppeteer (PDF)', 'bcrypt'],
        },
    ];
    return (
        <section className='py-20 px-4 bg-zinc-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800'>
            <div className='container mx-auto max-w-6xl'>
                <motion.div {...fadeUp} className='mb-10'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 rounded-full uppercase border border-gray-200 dark:border-gray-800'>
                        Stack
                    </span>
                    <h2 className='mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading'>
                        What it's built with
                    </h2>
                </motion.div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {groups.map((g, i) => (
                        <motion.div
                            key={g.label}
                            {...fadeUp}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className='rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5'
                        >
                            <div className='text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3'>
                                {g.label}
                            </div>
                            <ul className='space-y-1.5 text-sm text-gray-700 dark:text-gray-300'>
                                {g.items.map((item) => (
                                    <li key={item} className='flex items-center gap-2'>
                                        <span className='size-1.5 rounded-full bg-gray-400 dark:bg-gray-600' />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTA = () => {
    const navigate = useNavigate();
    return (
        <section className='relative py-24 px-4 bg-zinc-50 dark:bg-gray-950 overflow-hidden'>
            <AnimatedBlob
                size={600}
                rotationDuration={15}
                enableRotation={true}
                gradientSpread='40%'
                morphDuration={35}
                colors={['hsla(283, 79%, 65%, 0.6)', 'hsla(357, 95%, 73%, 0.6)', 'hsla(216, 82%, 62%, 0.6)']}
                gradientCenter={['50%', '50%']}
                intensity={0.7}
                opacity={0.3}
                className='blur-3xl pointer-events-none'
            />
            <motion.div {...fadeUp} className='relative z-10 container mx-auto max-w-3xl text-center'>
                <h2 className='text-3xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading mb-4'>
                    Ready to write together?
                </h2>
                <p className='text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8'>
                    Create a free account and start collaborating in seconds — full editor, AI assistant, version
                    history, and sharing included.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <Button
                        size='lg'
                        className='text-base bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 text-white shadow-md hover:from-purple-600 hover:to-pink-600'
                        onClick={() => navigate('/signup')}
                    >
                        Create an account <ArrowRight className='size-4 ml-1' />
                    </Button>
                    <Button
                        size='lg'
                        variant='outline'
                        className='px-6 py-5 text-base border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                        onClick={() => document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Try the editor
                    </Button>
                </div>
            </motion.div>
        </section>
    );
};

const Footer = () => (
    <footer className='bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 py-10 px-4'>
        <div className='container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
                <span className='inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-pink-600 text-white'>
                    <GiOverInfinity className='size-3.5' />
                </span>
                <span className='font-bold text-gray-900 dark:text-white' style={{ fontFamily: "'Comic Neue', cursive" }}>
                    DocWeave
                </span>
                <span className='text-gray-400 dark:text-gray-600'>· open-source real-time docs</span>
            </div>
            <div className='flex items-center gap-5'>
                <a
                    href={REPOS.frontend}
                    target='_blank'
                    rel='noreferrer'
                    className='hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1'
                >
                    <FaGithub /> Frontend
                </a>
                <a
                    href={REPOS.backend}
                    target='_blank'
                    rel='noreferrer'
                    className='hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1'
                >
                    <FaGithub /> Backend
                </a>
                <a href='#features' className='hover:text-gray-900 dark:hover:text-white'>
                    Features
                </a>
                <Link to='/login' className='hover:text-gray-900 dark:hover:text-white'>
                    Login
                </Link>
            </div>
        </div>
    </footer>
);

const LandingPage = () => {
    return (
        <div className='flex flex-col w-full relative bg-white dark:bg-[#0a0a0a]'>
            <NavBar />
            <Hero />
            <LiveDemo />
            <RealtimeShowcase />
            <AIShowcase />
            <VersionsShowcase />
            <RolesShowcase />
            <Features />
            <Unique />
            <Stats />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
