import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { Button } from '../components/ui/button';
import AnimatedBlob from '../components/Blob';
import ThemeToggle from '../components/ThemeToggle';
import PlaygroundEditor from '../components/PlaygroundEditor';
import logo from '../assets/logo3.svg';
import { FaGithub } from 'react-icons/fa';
import {
    ArrowRight,
    Users,
    History,
    Share2,
    MessageSquare,
    Download,
    Lock,
    Palette,
    FileText,
    Image as ImageIcon,
    Sparkles,
    Star,
    ShieldCheck,
    Eye,
    Link2,
    Zap,
    Globe,
    Moon,
    Menu,
    X,
    WifiOff,
    Search,
    Layout,
    Bold,
    Heading1,
    ListChecks,
    Code,
    Highlighter,
    AlignCenter,
    Undo,
    Type,
    KeyRound,
    Mail,
    Crown,
    UserCog,
    GitBranch,
    Cloud,
} from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
};

const NavBar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { label: 'Playground', to: 'playground' },
        { label: 'Features', to: 'features' },
        { label: 'Editor', to: 'editor-features' },
        { label: 'Why us', to: 'unique' },
    ];

    const scrollTo = (id) => {
        setOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.nav
            initial={false}
            animate={{
                backgroundColor: scrolled
                    ? 'rgba(255,255,255,0.78)'
                    : 'rgba(255,255,255,0)',
            }}
            transition={{ duration: 0.25 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-[backdrop-filter,border-color,box-shadow] duration-300 ${
                scrolled
                    ? 'backdrop-blur-lg border-b border-gray-200/70 dark:border-gray-800/70 shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:!bg-gray-950/70'
                    : 'border-b border-transparent'
            }`}
        >
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between'>
                {/* Logo */}
                <Link to='/' className='flex items-center gap-2 shrink-0'>
                    <img src={logo} alt='Colabdocx' className='h-7' />
                    <span
                        className='text-black dark:text-white text-xl font-extrabold tracking-tight'
                        style={{ fontFamily: 'Nunito' }}
                    >
                        Colabdocx
                    </span>
                </Link>

                {/* Center nav */}
                <div className='hidden md:flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {navLinks.map((l) => (
                        <button
                            key={l.to}
                            onClick={() => scrollTo(l.to)}
                            className='px-3 py-2 rounded-md hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors'
                        >
                            {l.label}
                        </button>
                    ))}
                    <Link
                        to='/testing/docs'
                        className='px-3 py-2 rounded-md hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors'
                    >
                        Docs
                    </Link>
                </div>

                {/* Right cluster */}
                <div className='flex items-center gap-2'>
                    <a
                        href='#'
                        className='hidden sm:inline-flex p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                        aria-label='GitHub'
                    >
                        <FaGithub className='size-4' />
                    </a>
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/login')}
                        className='hidden sm:inline-block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white px-3 py-2 rounded-md transition-colors'
                    >
                        Login
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/signup')}
                        className='relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow'
                    >
                        <span>Get started</span>
                        <ArrowRight className='size-4' />
                    </motion.button>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className='md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                className='md:hidden overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-gray-800'
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
                        to='/testing/docs'
                        onClick={() => setOpen(false)}
                        className='px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                        Docs
                    </Link>
                    <Link
                        to='/login'
                        onClick={() => setOpen(false)}
                        className='px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                        Login
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
                    background: `radial-gradient(500px circle at ${spot.x}px ${spot.y}px, rgba(168,85,247,0.18), rgba(236,72,153,0.10) 30%, transparent 60%)`,
                }}
            />
            <AnimatedBlob
                size={900}
                rotationDuration={10}
                enableRotation={true}
                gradientSpread='50%'
                morphDuration={40}
                colors={[
                    'hsla(357, 95%, 73%, 0.9)',
                    'hsla(283, 79%, 65%, 0.85)',
                    'hsla(216, 82%, 62%, 0.85)',
                    'hsla(76, 75%, 63%, 0.9)',
                ]}
                gradientCenter={['-10%', '-5%']}
                intensity={1.2}
                className='right-10 opacity-80 blur-3xl'
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
                        Portfolio project · MERN + Yjs + Tiptap
                    </motion.div>

                    <motion.h1
                        className='text-5xl md:text-7xl lg:text-8xl max-w-5xl font-bold font-heading text-black dark:text-white leading-tight'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        A collaborative document editor, built end-to-end.
                    </motion.h1>
                    <motion.span
                        className='text-3xl md:text-5xl lg:text-6xl mt-4 mb-8 text-transparent bg-clip-text'
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6, #06b6d4, #a855f7)',
                            backgroundSize: '300% auto',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                        }}
                        animate={{ backgroundPosition: ['0% center', '300% center'] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                        <Typewriter
                            options={{
                                strings: [
                                    'CRDTs over WebSocket',
                                    'role-based permissions',
                                    'versioned history',
                                    'multi-format export',
                                ],
                                autoStart: true,
                                loop: true,
                            }}
                        />
                    </motion.span>

                    <motion.p
                        className='mb-10 max-w-3xl text-lg md:text-xl text-gray-700 dark:text-gray-400'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        I built this to learn how real collaborative editors work under the hood — Yjs CRDTs, a
                        custom Socket.IO relay, a permission resolver that gates both REST and WebSocket, and a
                        version model that tracks who touched what.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className='flex flex-col sm:flex-row gap-3'
                    >
                        <Button
                            size='lg'
                            className='text-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl'
                            onClick={() =>
                                document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            Try the editor
                            <ArrowRight className='size-5 ml-1' />
                        </Button>
                        <Link to='/testing/docs'>
                            <Button
                                size='lg'
                                variant='outline'
                                className='px-8 py-6 text-lg border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                            >
                                Read the implementation notes
                            </Button>
                        </Link>
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

const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
    <motion.div
        {...fadeUp}
        whileHover={{ y: -4 }}
        className='group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm hover:shadow-xl transition-all overflow-hidden'
    >
        <div
            className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl ${gradient}`}
        />
        <div
            className={`inline-flex items-center justify-center rounded-xl p-3 mb-4 bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
            <Icon className='size-5' />
        </div>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>{title}</h3>
        <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>{description}</p>
    </motion.div>
);

const FEATURE_GROUPS = [
    {
        kicker: 'Collaboration',
        title: 'Real-time editing',
        accent: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
        items: [
            {
                icon: Users,
                title: 'Yjs CRDT co-editing',
                description:
                    'Tiptap is wired up with @tiptap/extension-collaboration. Client emits Y.Doc updates, server applies them to an authoritative Y.Doc per room.',
                gradient: 'from-purple-500 to-pink-500',
            },
            {
                icon: Eye,
                title: 'Awareness & presence',
                description:
                    'Cursor and selection metadata relayed over Socket.IO via @tiptap/extension-collaboration-cursor.',
                gradient: 'from-fuchsia-500 to-purple-500',
            },
            {
                icon: MessageSquare,
                title: 'In-document chat',
                description:
                    'Per-room chat over the same socket. Server emits system events on join/leave.',
                gradient: 'from-pink-500 to-rose-500',
            },
            {
                icon: WifiOff,
                title: 'Offline-tolerant edits',
                description:
                    'Yjs keeps local state when the socket drops; the server re-syncs via state-vector diffs on reconnect.',
                gradient: 'from-indigo-500 to-purple-500',
            },
        ],
    },
    {
        kicker: 'Permissions',
        title: 'Roles, sharing, and access',
        accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
        items: [
            {
                icon: Crown,
                title: 'Owner / Editor / Viewer',
                description:
                    'Three roles resolved by a single function (resolveUserRole) used by both REST handlers and the socket layer.',
                gradient: 'from-amber-500 to-orange-500',
            },
            {
                icon: UserCog,
                title: 'Delegated sharing',
                description:
                    'Owner can toggle whether editors can manage access, which roles they may grant, and which visibility modes they may set.',
                gradient: 'from-emerald-500 to-teal-500',
            },
            {
                icon: Link2,
                title: 'Five visibility modes',
                description:
                    'restricted · anyone-with-link:r · anyone-with-link:w · anyone-in-org:r · anyone-in-org:w.',
                gradient: 'from-orange-500 to-red-500',
            },
            {
                icon: Lock,
                title: 'Content lock',
                description:
                    'A boolean on the doc that, when set, forces every non-owner to viewer until cleared.',
                gradient: 'from-slate-600 to-gray-800',
            },
            {
                icon: Mail,
                title: 'Email invites',
                description: 'When a collaborator is added, an invitation email is sent via Nodemailer.',
                gradient: 'from-rose-500 to-pink-500',
            },
            {
                icon: KeyRound,
                title: 'JWT auth',
                description:
                    'Same token verified by REST middleware and by io.use() before the WebSocket connection upgrades.',
                gradient: 'from-cyan-500 to-blue-500',
            },
        ],
    },
    {
        kicker: 'History & export',
        title: 'Versioning and output formats',
        accent: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
        items: [
            {
                icon: History,
                title: 'Version snapshots',
                description:
                    'Mongo collection of HTML snapshots. Each version records source (manual / autosave / recovery), author, contributors, and word count.',
                gradient: 'from-blue-500 to-cyan-500',
            },
            {
                icon: GitBranch,
                title: 'Debounced preview save',
                description:
                    'Server keeps a content preview (first 8000 chars) refreshed every ~3s while a room is active, so the dashboard loads cheaply.',
                gradient: 'from-cyan-500 to-teal-500',
            },
            {
                icon: Download,
                title: 'PDF · Markdown · DOCX',
                description:
                    'PDF rendered server-side with Puppeteer. Markdown via Turndown and DOCX via the docx library, both in the browser.',
                gradient: 'from-yellow-500 to-orange-500',
            },
            {
                icon: Star,
                title: 'Starred docs & versions',
                description:
                    'A starred flag on both docs and version snapshots; the dashboard exposes it as a filter.',
                gradient: 'from-amber-500 to-yellow-500',
            },
        ],
    },
    {
        kicker: 'Glue',
        title: 'The rest of it',
        accent: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
        items: [
            {
                icon: Layout,
                title: 'Dashboard',
                description:
                    'Filters for Owned / Shared / Starred / View-only, plus title search across the user’s documents.',
                gradient: 'from-violet-500 to-purple-500',
            },
            {
                icon: Palette,
                title: 'Deterministic user colors',
                description:
                    'Color is picked by hashing userId + roomId into an 18-entry palette and cached on the document.',
                gradient: 'from-fuchsia-500 to-pink-500',
            },
            {
                icon: Cloud,
                title: 'Cloudinary image uploads',
                description: 'Editor image uploads go through Multer → Cloudinary; the doc stores the secure URL.',
                gradient: 'from-sky-500 to-blue-500',
            },
            {
                icon: Moon,
                title: 'Dark mode',
                description: 'Class-based dark theme with preference persisted in localStorage.',
                gradient: 'from-slate-700 to-gray-900',
            },
            {
                icon: ShieldCheck,
                title: 'Permission-checked writes',
                description:
                    'Y.Doc update events are dropped on the server when the sender’s resolved role isn’t Editor or Owner.',
                gradient: 'from-teal-500 to-emerald-500',
            },
        ],
    },
];

const Features = () => (
    <section id='features' className='relative bg-white dark:bg-[#0a0a0a] py-24 px-4 overflow-hidden'>
        <div className='container mx-auto max-w-7xl'>
            <motion.div {...fadeUp} className='text-center mb-16'>
                <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full uppercase'>
                    Features
                </span>
                <h2 className='mt-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                    What's implemented
                </h2>
                <p className='mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                    Grouped by area. Descriptions stick to what the code actually does.
                </p>
            </motion.div>

            <div className='space-y-20'>
                {FEATURE_GROUPS.map((group) => (
                    <div key={group.kicker}>
                        <motion.div {...fadeUp} className='mb-8'>
                            <span
                                className={`inline-block px-3 py-1 text-[11px] font-semibold tracking-widest rounded-full uppercase ${group.accent}`}
                            >
                                {group.kicker}
                            </span>
                            <h3 className='mt-3 text-2xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading'>
                                {group.title}
                            </h3>
                        </motion.div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {group.items.map((f) => (
                                <FeatureCard key={f.title} {...f} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ---- Tiptap editor capabilities showcase ------------------------------------
const EditorFeatures = () => {
    const caps = [
        { icon: Bold, label: 'Bold · Italic · Underline · Strike' },
        { icon: Heading1, label: 'Headings H1–H6' },
        { icon: ListChecks, label: 'Bullet · Ordered · Task lists' },
        { icon: Highlighter, label: 'Highlight & background color' },
        { icon: Code, label: 'Inline code & code blocks' },
        { icon: AlignCenter, label: 'Text alignment · L/C/R/Justify' },
        { icon: Type, label: 'Subscript & superscript' },
        { icon: Link2, label: 'Smart links with titles' },
        { icon: ImageIcon, label: 'Inline images (Cloudinary)' },
        { icon: Undo, label: 'Undo / redo history' },
        { icon: Sparkles, label: 'Typography auto-replace' },
        { icon: FileText, label: 'Blockquotes & dividers' },
    ];
    return (
        <section
            id='editor-features'
            className='relative py-24 px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-[#0a0a0a] dark:to-gray-950 overflow-hidden'
        >
            <div className='container mx-auto max-w-6xl'>
                <motion.div {...fadeUp} className='text-center mb-12'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-full uppercase'>
                        Editor
                    </span>
                    <h2 className='mt-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                        Tiptap extensions wired up
                    </h2>
                    <p className='mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        Twelve formatting tools mounted in the toolbar above. All standard Tiptap extensions —
                        the work was integration, not invention.
                    </p>
                </motion.div>

                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
                    {caps.map((cap, i) => {
                        const Glyph = cap.icon;
                        return (
                            <motion.div
                                key={cap.label}
                                {...fadeUp}
                                transition={{ duration: 0.4, delay: i * 0.04 }}
                                whileHover={{ y: -3 }}
                                className='flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 px-4 py-3 shadow-sm hover:shadow-md transition-all'
                            >
                                <span className='inline-flex items-center justify-center rounded-lg p-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm shrink-0'>
                                    <Glyph className='size-4' />
                                </span>
                                <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                                    {cap.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const Unique = () => {
    const items = [
        {
            icon: Zap,
            title: 'Custom Yjs relay on Socket.IO',
            description:
                'Instead of using y-websocket, I wrote the relay on Socket.IO so the same connection that carries Y.Doc updates also carries chat, awareness, and presence. New joiners send their state-vector and the server replies with just the diff.',
        },
        {
            icon: ShieldCheck,
            title: 'One permission resolver for REST + WebSocket',
            description:
                'A single resolveUserRole function is the only place that answers "what role does this user have on this doc". Both Express handlers and the socket event handlers call into it, so policy fixes apply everywhere at once.',
        },
        {
            icon: UserCog,
            title: 'Delegated sharing policy',
            description:
                'Owners control more than role assignments — they decide whether editors can re-share at all, which roles editors are allowed to grant, and which visibility modes are even selectable. A small policy-on-policy layer that was fun to design.',
        },
        {
            icon: Star,
            title: 'Versions with source and contributors',
            description:
                'Each version row records why it was saved (manual / autosave / recovery), the author, and the collaborators present at the time. Lets the version history serve as a lightweight audit trail without a separate events table.',
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
                intensity={0.8}
                className='opacity-40 blur-3xl pointer-events-none'
            />
            <div className='container mx-auto max-w-6xl relative z-10'>
                <motion.div {...fadeUp} className='text-center mb-16'>
                    <span className='inline-block px-3 py-1 text-xs font-semibold tracking-wide text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 rounded-full uppercase'>
                        Engineering highlights
                    </span>
                    <h2 className='mt-4 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                        The parts I'm glad I built
                    </h2>
                    <p className='mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        Four pieces of the design that felt worth doing carefully — not because they're rare, but
                        because they're where most of the learning happened.
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

const VisibilityShowcase = () => {
    const modes = [
        { icon: Lock, label: 'Restricted', sub: 'Only invited users', color: 'text-red-500' },
        { icon: Eye, label: 'Link · Read', sub: 'Anyone with link can view', color: 'text-blue-500' },
        { icon: Link2, label: 'Link · Write', sub: 'Anyone with link can edit', color: 'text-purple-500' },
        { icon: Globe, label: 'Org · Read', sub: 'Read across your org', color: 'text-emerald-500' },
        { icon: Share2, label: 'Org · Write', sub: 'Edit across your org', color: 'text-orange-500' },
    ];
    return (
        <section className='py-24 px-4 bg-white dark:bg-[#0a0a0a]'>
            <div className='container mx-auto max-w-6xl'>
                <motion.div {...fadeUp} className='text-center mb-12'>
                    <h2 className='text-3xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading'>
                        Share the way you actually work
                    </h2>
                    <p className='mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                        Five visibility modes — pick the one that matches the moment.
                    </p>
                </motion.div>
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                    {modes.map(({ icon: Icon, label, sub, color }, i) => (
                        <motion.div
                            key={label}
                            {...fadeUp}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            className='rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 text-center shadow-sm hover:shadow-lg transition-all'
                        >
                            <Icon className={`size-7 mx-auto mb-3 ${color}`} />
                            <div className='font-semibold text-gray-900 dark:text-white text-sm'>{label}</div>
                            <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{sub}</div>
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
            items: ['React 19', 'Vite', 'Tailwind v4', 'Redux Toolkit', 'Tiptap', 'framer-motion'],
        },
        {
            label: 'Realtime',
            items: ['Yjs', 'Socket.IO', '@tiptap/extension-collaboration', 'collaboration-cursor'],
        },
        { label: 'Backend', items: ['Node.js', 'Express', 'jsonwebtoken', 'Nodemailer', 'Multer'] },
        { label: 'Storage & files', items: ['MongoDB', 'Mongoose', 'Cloudinary', 'Puppeteer (PDF)'] },
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
                intensity={0.9}
                className='opacity-30 blur-3xl pointer-events-none'
            />
            <motion.div {...fadeUp} className='relative z-10 container mx-auto max-w-3xl text-center'>
                <h2 className='text-3xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading mb-4'>
                    Want to look around?
                </h2>
                <p className='text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8'>
                    Create an account to try the full editor with version history and sharing — or read through
                    the implementation notes.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <Button
                        size='lg'
                        className='text-base bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 text-white shadow-md hover:from-purple-600 hover:to-pink-600'
                        onClick={() => navigate('/signup')}
                    >
                        Create an account <ArrowRight className='size-4 ml-1' />
                    </Button>
                    <Link to='/testing/docs'>
                        <Button
                            size='lg'
                            variant='outline'
                            className='px-6 py-5 text-base border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 w-full'
                        >
                            Read the implementation notes
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

const Footer = () => (
    <footer className='bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 py-10 px-4'>
        <div className='container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
                <img src={logo} alt='Logo' className='h-5' />
                <span className='font-bold text-gray-900 dark:text-white' style={{ fontFamily: 'Nunito' }}>
                    Colabdocx
                </span>
                <span className='text-gray-400 dark:text-gray-600'>· open-source real-time docs</span>
            </div>
            <div className='flex items-center gap-5'>
                <a href='#' className='hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1'>
                    <FaGithub /> GitHub
                </a>
                <a href='#features' className='hover:text-gray-900 dark:hover:text-white'>
                    Features
                </a>
                <Link to='/testing/docs' className='hover:text-gray-900 dark:hover:text-white'>
                    Docs
                </Link>
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
            <EditorFeatures />
            <Features />
            <VisibilityShowcase />
            <Unique />
            <Stats />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
