import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo3.svg';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { FaGithub } from 'react-icons/fa';
import {
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Network,
    Users,
    History,
    ShieldCheck,
    Palette,
    Lock,
    Layers,
    Server,
    Database,
    Zap,
    FileText,
    Download,
    GitBranch,
    KeyRound,
    Eye,
} from 'lucide-react';

// ---- Small UI helpers --------------------------------------------------------
const Pre = ({ children, language = 'js' }) => (
    <pre className='mt-4 mb-2 rounded-xl bg-gray-950 dark:bg-black border border-gray-800 text-gray-100 text-[13px] leading-relaxed p-4 overflow-x-auto font-mono'>
        <div className='flex items-center justify-between mb-3 text-xs text-gray-500 uppercase tracking-wide'>
            <span>{language}</span>
            <span className='flex gap-1'>
                <span className='size-2 rounded-full bg-red-400' />
                <span className='size-2 rounded-full bg-yellow-400' />
                <span className='size-2 rounded-full bg-green-400' />
            </span>
        </div>
        <code>{children}</code>
    </pre>
);

const InlineCode = ({ children }) => (
    <code className='font-mono text-[0.9em] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 border border-gray-200 dark:border-gray-700'>
        {children}
    </code>
);

const FilePath = ({ children }) => (
    <code className='font-mono text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'>
        {children}
    </code>
);

const Callout = ({ tone = 'info', title, children }) => {
    const styles = {
        info: 'border-blue-300 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-900 text-blue-900 dark:text-blue-200',
        warn: 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 text-amber-900 dark:text-amber-200',
        success:
            'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200',
    };
    return (
        <div className={`my-5 rounded-xl border-l-4 ${styles[tone]} p-4`}>
            {title && <div className='font-bold mb-1'>{title}</div>}
            <div className='text-sm leading-relaxed'>{children}</div>
        </div>
    );
};

// ---- Navigation --------------------------------------------------------------
const NavBar = () => {
    const navigate = useNavigate();
    return (
        <nav className='sticky top-0 z-50 w-full bg-white/85 dark:bg-gray-950/85 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'>
            <div className='container mx-auto max-w-7xl flex items-center justify-between px-4 py-3'>
                <Link to='/testing' className='flex items-center gap-2'>
                    <img src={logo} alt='Logo' className='h-6' />
                    <span
                        className='text-black dark:text-white text-xl font-bold'
                        style={{ fontFamily: 'Nunito' }}
                    >
                        DocWeave
                    </span>
                    <span className='hidden sm:inline ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'>
                        Docs
                    </span>
                </Link>
                <div className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    <Link
                        to='/testing'
                        className='hidden sm:inline-flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md'
                    >
                        <ArrowLeft className='size-4' /> Landing
                    </Link>
                    <a
                        href='#'
                        className='hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md'
                        aria-label='GitHub'
                    >
                        <FaGithub />
                    </a>
                    <ThemeToggle />
                    <Button
                        size='sm'
                        className='bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        onClick={() => navigate('/signup')}
                    >
                        Try it <ArrowRight className='size-4 ml-1' />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

// ---- Sidebar TOC -------------------------------------------------------------
const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'crdt', label: 'CRDT Core (Yjs)', icon: Zap },
    { id: 'socket', label: 'Socket Layer', icon: Network },
    { id: 'awareness', label: 'Awareness & Presence', icon: Users },
    { id: 'permissions', label: 'Permission Model', icon: ShieldCheck },
    { id: 'visibility', label: 'Visibility Modes', icon: Eye },
    { id: 'colors', label: 'Deterministic Colors', icon: Palette },
    { id: 'lock', label: 'Content Lock', icon: Lock },
    { id: 'versions', label: 'Version Snapshots', icon: History },
    { id: 'preview', label: 'Content Preview', icon: FileText },
    { id: 'export', label: 'Export Pipeline', icon: Download },
    { id: 'auth', label: 'Authentication', icon: KeyRound },
    { id: 'storage', label: 'Storage Model', icon: Database },
    { id: 'stack', label: 'Tech Stack', icon: Server },
    { id: 'futures', label: 'What\'s Next', icon: GitBranch },
];

const Sidebar = ({ active }) => (
    <aside className='hidden lg:block sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-6 border-r border-gray-200 dark:border-gray-800'>
        <div className='text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3'>
            On this page
        </div>
        <ul className='space-y-1 text-sm'>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                    <a
                        href={`#${id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                            active === id
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                        }`}
                    >
                        <Icon className='size-3.5' />
                        {label}
                    </a>
                </li>
            ))}
        </ul>
    </aside>
);

// ---- Section primitive ------------------------------------------------------
const Section = ({ id, icon: Icon, title, kicker, children }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4 }}
        className='scroll-mt-20 py-10 border-b border-gray-100 dark:border-gray-900'
    >
        {kicker && (
            <div className='text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2'>
                {kicker}
            </div>
        )}
        <h2 className='flex items-center gap-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading mb-4'>
            {Icon && (
                <span className='inline-flex items-center justify-center rounded-lg p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'>
                    <Icon className='size-5' />
                </span>
            )}
            {title}
        </h2>
        <div className='prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed'>
            {children}
        </div>
    </motion.section>
);

// ---- Page --------------------------------------------------------------------
const DocsPage = () => {
    const [active, setActive] = useState('overview');
    const observerRef = useRef(null);

    useEffect(() => {
        const elems = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
        observerRef.current?.disconnect();
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) setActive(visible.target.id);
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
        );
        elems.forEach((el) => obs.observe(el));
        observerRef.current = obs;
        return () => obs.disconnect();
    }, []);

    return (
        <div className='min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100'>
            <NavBar />

            {/* Hero */}
            <header className='relative overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-zinc-50 via-white to-purple-50 dark:from-gray-950 dark:via-[#0a0a0a] dark:to-purple-950/20'>
                <div className='container mx-auto max-w-5xl px-4 py-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className='inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-gray-900/70 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-4'>
                            <BookOpen className='size-3.5' />
                            Implementation guide · v1
                        </div>
                        <h1 className='text-4xl md:text-6xl font-bold font-heading text-gray-900 dark:text-white leading-tight'>
                            How DocWeave was built
                        </h1>
                        <p className='mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl'>
                            A walk through the engineering core — the CRDT layer, the socket protocol, the
                            permission resolver, the version model, and the small design choices that make it
                            feel real-time.
                        </p>
                    </motion.div>
                </div>
            </header>

            <div className='container mx-auto max-w-7xl px-4 grid lg:grid-cols-[260px_1fr] gap-8'>
                <Sidebar active={active} />

                <main className='py-8 max-w-3xl'>
                    {/* Overview */}
                    <Section id='overview' icon={BookOpen} title='Overview' kicker='Start here'>
                        <p>
                            DocWeave is a real-time collaborative document editor built on three load-bearing
                            ideas: a <strong>CRDT</strong> for the document state, a thin{' '}
                            <strong>WebSocket relay</strong> for transport, and a{' '}
                            <strong>policy-driven permission resolver</strong> that decides who can do what every
                            single time a client touches the doc.
                        </p>
                        <p>
                            The frontend is a React + Tiptap editor; the backend is Node.js + Express + Socket.IO
                            with MongoDB for persistence. Below is the full picture, layer by layer.
                        </p>
                    </Section>

                    {/* Architecture */}
                    <Section
                        id='architecture'
                        icon={Layers}
                        title='Architecture at a glance'
                        kicker='High level'
                    >
                        <p>The system has four moving parts:</p>
                        <ol className='list-decimal pl-6 space-y-1 my-3'>
                            <li>
                                <strong>Editor (Tiptap + Yjs)</strong> — the rich text surface that produces and
                                consumes CRDT updates.
                            </li>
                            <li>
                                <strong>Socket.IO transport</strong> — relays binary CRDT diffs and awareness
                                packets between clients in a room.
                            </li>
                            <li>
                                <strong>Authoritative server doc</strong> — an in-memory{' '}
                                <InlineCode>Y.Doc</InlineCode> per room that applies updates and serves
                                state-vectors to new joiners.
                            </li>
                            <li>
                                <strong>MongoDB</strong> — long-term storage for docs, collaborators, versions,
                                and the rolling content preview.
                            </li>
                        </ol>
                        <Pre language='ascii'>
                            {`  Client A  ──┐                        ┌── Client B
              │  Y.Doc updates (Uint8Array)  │
              ├──►  Socket.IO  ◄─── relay ───┤
              │                              │
              └──►  Server Y.Doc (in-mem)  ──┘
                          │
                          ▼
                      MongoDB
                  (docs, versions,
                   collaborators, preview)`}
                        </Pre>
                    </Section>

                    {/* CRDT */}
                    <Section id='crdt' icon={Zap} title='The CRDT core (Yjs)' kicker='The magic'>
                        <p>
                            Every room is backed by a server-side <InlineCode>Y.Doc</InlineCode> kept in a{' '}
                            <InlineCode>Map</InlineCode> keyed by <InlineCode>roomId</InlineCode>. When a client
                            edits the document, Tiptap emits a binary update that's shipped over the socket; the
                            server applies it to the room's <InlineCode>Y.Doc</InlineCode> and rebroadcasts it to
                            every other socket in the room.
                        </p>
                        <p>
                            Because Yjs is a true CRDT, the order of arrival doesn't matter — every client
                            converges on the same document state without conflict-resolution dialogs.
                        </p>
                        <Pre language='js'>
                            {`// backend/socket.js
const docsMap = new Map(); // roomId -> { doc: Y.Doc }

socket.on('update', (update) => {
    const ctx = getCtx();
    if (ctx.role !== 'EDITOR' && ctx.role !== 'OWNER') {
        socket.emit('permission-denied', { action: 'edit' });
        return;
    }
    const u8 = toUint8(update);
    const { doc } = getRoomState(ctx.roomId);
    Y.applyUpdate(doc, u8);              // server stays canonical
    socket.to(ctx.roomId).emit('update', Buffer.from(u8));
});`}
                        </Pre>
                        <Callout tone='info' title='Why the server stores its own Y.Doc'>
                            New joiners send their state vector, and the server replies with just the diff they
                            need — not the whole document. This keeps re-sync cheap and lets late joiners catch
                            up cleanly even if they were briefly offline.
                        </Callout>
                        <Pre language='js'>
                            {`socket.on('request-sync', (stateVector) => {
    const { doc } = getRoomState(ctx.roomId);
    const sv   = toUint8(stateVector);
    const diff = sv ? Y.encodeStateAsUpdate(doc, sv)
                    : Y.encodeStateAsUpdate(doc);
    socket.emit('sync-update', Buffer.from(diff));
});`}
                        </Pre>
                    </Section>

                    {/* Socket Layer */}
                    <Section id='socket' icon={Network} title='The socket layer' kicker='Transport'>
                        <p>
                            Socket.IO is intentionally treated as a dumb pipe — but a JWT-guarded one. The
                            handshake runs through <InlineCode>jwt.verify</InlineCode> before any room state is
                            allocated:
                        </p>
                        <Pre language='js'>
                            {`io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication Error'));
    try {
        socket.user = jwt.verify(token, process.env.JWT_KEY);
        next();
    } catch {
        next(new Error('Authentication Error'));
    }
});`}
                        </Pre>
                        <p>The four event categories the server handles:</p>
                        <ul className='list-disc pl-6 space-y-1 my-2'>
                            <li>
                                <InlineCode>update</InlineCode> — CRDT diff, write-guarded
                            </li>
                            <li>
                                <InlineCode>request-sync</InlineCode> / <InlineCode>sync</InlineCode> — full or
                                diff sync, read-guarded
                            </li>
                            <li>
                                <InlineCode>awareness-update</InlineCode> — cursor & presence, relayed
                            </li>
                            <li>
                                <InlineCode>message</InlineCode> — in-doc chat, room-guarded
                            </li>
                        </ul>
                        <p>
                            Membership data lives in a per-room <InlineCode>Map(userId → {`{ user, sockets:Set }`})</InlineCode>{' '}
                            so a single user with three tabs counts once for presence but lets all three tabs
                            stay in sync.
                        </p>
                    </Section>

                    {/* Awareness */}
                    <Section id='awareness' icon={Users} title='Awareness & presence' kicker='Live cursors'>
                        <p>
                            Awareness packets are forwarded with no server-side mutation — they carry cursor
                            positions, selections, and the user's display metadata (name, color). The server
                            just relays to other sockets in the same room:
                        </p>
                        <Pre language='js'>
                            {`socket.on('awareness-update', (update) => {
    const ctx = getCtx();
    if (!ctx) return;
    socket.to(ctx.roomId).emit('awareness-update', update);
});`}
                        </Pre>
                        <p>
                            Membership changes (join / leave) emit a system event so the chat panel can show "X
                            has left the document" without polling.
                        </p>
                    </Section>

                    {/* Permissions */}
                    <Section
                        id='permissions'
                        icon={ShieldCheck}
                        title='Permission resolution'
                        kicker='The policy engine'
                    >
                        <p>
                            Every privileged action — joining a room, sending an update, sharing the doc —
                            funnels through <InlineCode>resolveUserRole</InlineCode>. It returns one of{' '}
                            <InlineCode>OWNER</InlineCode>, <InlineCode>EDITOR</InlineCode>, or{' '}
                            <InlineCode>VIEWER</InlineCode>, factoring in:
                        </p>
                        <ul className='list-disc pl-6 space-y-1 my-2'>
                            <li>Direct ownership</li>
                            <li>Explicit collaborator entry</li>
                            <li>Visibility mode (link / org / restricted)</li>
                            <li>Delegated sharing settings owners configured</li>
                            <li>
                                The content-lock flag — when set, every non-owner is demoted to{' '}
                                <InlineCode>VIEWER</InlineCode> until the owner unlocks
                            </li>
                        </ul>
                        <Callout tone='success' title='Why one resolver is better than scattered checks'>
                            By centralising the policy, the same answer applies whether the request came in over
                            HTTP (saving a version, sharing) or over WebSocket (sending an edit). One bug fix
                            covers every entry point.
                        </Callout>
                        <p>
                            Source: <FilePath>backend/controllers/doc.controller.js</FilePath>
                        </p>
                    </Section>

                    {/* Visibility */}
                    <Section
                        id='visibility'
                        icon={Eye}
                        title='Visibility modes'
                        kicker='Five sharing surfaces'
                    >
                        <p>
                            The <InlineCode>visibility</InlineCode> field on the document model is the single
                            source of truth for "who can find this":
                        </p>
                        <Pre language='js'>
                            {`visibility: {
    type: String,
    enum: [
        'restricted',          // only listed collaborators
        'anyone-with-link:r',  // read by link
        'anyone-with-link:w',  // write by link
        'anyone-in-org:r',     // read across the org
        'anyone-in-org:w',     // write across the org
    ],
    default: 'restricted',
},`}
                        </Pre>
                        <p>
                            Owners can additionally restrict <em>which</em> visibility modes editors are even
                            allowed to choose via{' '}
                            <InlineCode>sharing.allowedVisibility</InlineCode> — a meta-policy on the policy.
                        </p>
                    </Section>

                    {/* Colors */}
                    <Section
                        id='colors'
                        icon={Palette}
                        title='Deterministic user colors'
                        kicker='No setup, no clashes'
                    >
                        <p>
                            Every user gets a color the first time they join a room. The color is derived from a
                            deterministic hash of <InlineCode>userId + roomId</InlineCode>, persisted on the
                            document, and reused for every future session — so Alex is always rose-red in this
                            doc, even if she rejoins a week later.
                        </p>
                        <Pre language='js'>
                            {`function hashStringToIndex(str, len) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % len;
}

// 18 tailwind base colors, indexed by hash
const color = palette[hashStringToIndex(userId + roomId, palette.length)];`}
                        </Pre>
                    </Section>

                    {/* Lock */}
                    <Section id='lock' icon={Lock} title='Content lock' kicker='Freeze-the-doc'>
                        <p>
                            A single boolean on the sharing config (<InlineCode>sharing.lockContent</InlineCode>)
                            flips the entire document into read-only for everyone except the owner. The
                            permission resolver checks this flag last — meaning even an Editor with write rights
                            gets demoted to Viewer the moment the owner toggles the lock.
                        </p>
                        <p>
                            Useful for review windows, post-mortem reads, or compliance freezes where you want
                            certainty that nothing else lands.
                        </p>
                    </Section>

                    {/* Versions */}
                    <Section
                        id='versions'
                        icon={History}
                        title='Version snapshots'
                        kicker='Time travel'
                    >
                        <p>
                            Versions are stored as a separate Mongo collection with a strong link back to the
                            parent document. Each entry captures the HTML snapshot, the author, the contributing
                            collaborators at that moment, a word count, and the <em>source</em> that triggered
                            the save (manual / autosave / recovery).
                        </p>
                        <Pre language='js'>
                            {`// backend/models/version.model.js
{
    documentId: ObjectId,
    html: String,
    description: String,
    starred: Boolean,
    source: { type: String, enum: ['manual', 'autosave', 'recovery'] },
    wordCount: Number,
    author: ObjectId,
    collaborators: [{ userId, role }],
    createdAt, updatedAt,
}`}
                        </Pre>
                        <p>
                            Starred versions are protected from any cleanup policy and can be downloaded
                            directly as PDF / Markdown / DOCX — without restoring them.
                        </p>
                    </Section>

                    {/* Preview */}
                    <Section
                        id='preview'
                        icon={FileText}
                        title='Content preview (debounced)'
                        kicker='Dashboard speed'
                    >
                        <p>
                            The dashboard would crawl if it had to fetch every document's full HTML to render a
                            card. So the socket layer maintains a debounced "first 8000 chars" preview:
                        </p>
                        <Pre language='js'>
                            {`function scheduleContentPreviewSave(roomId, html) {
    const trimmed = (html || '').slice(0, PREVIEW_MAX_LENGTH);
    const existing = previewSaveTimers.get(roomId);
    if (existing) clearTimeout(existing.timer);
    const timer = setTimeout(async () => {
        await Document.updateOne(
            { _id: roomId },
            { $set: { contentPreview: entry?.html ?? trimmed } }
        );
    }, 3000);
    previewSaveTimers.set(roomId, { timer, html: trimmed });
}`}
                        </Pre>
                        <p>
                            One DB write every three seconds <em>per actively-edited doc</em>, regardless of how
                            many keystrokes happened in between.
                        </p>
                    </Section>

                    {/* Export */}
                    <Section
                        id='export'
                        icon={Download}
                        title='Export pipeline'
                        kicker='PDF · Markdown · DOCX'
                    >
                        <p>Three formats, three different paths:</p>
                        <ul className='list-disc pl-6 space-y-2 my-3'>
                            <li>
                                <strong>PDF</strong> — server-side, headless Chromium via Puppeteer. The HTML
                                snapshot is rendered to a real browser, then printed.
                            </li>
                            <li>
                                <strong>Markdown</strong> — client-side via TurndownService. HTML → MD
                                round-trip happens entirely in the browser, no server round-trip needed.
                            </li>
                            <li>
                                <strong>DOCX</strong> — client-side using the <InlineCode>docx</InlineCode>{' '}
                                library. The HTML is walked once to build the Word document tree.
                            </li>
                        </ul>
                        <p>
                            Critically, any of these can be applied to <em>any version</em>, not just the current
                            head — so you can re-export an older snapshot without having to restore it first.
                        </p>
                    </Section>

                    {/* Auth */}
                    <Section
                        id='auth'
                        icon={KeyRound}
                        title='Authentication'
                        kicker='JWT, one place'
                    >
                        <p>
                            Login issues a JWT signed with <InlineCode>process.env.JWT_KEY</InlineCode>, valid
                            for one day. The same token guards both HTTP requests (via middleware) and the
                            WebSocket handshake. There's no separate session store — the token is the session.
                        </p>
                        <p>
                            Source: <FilePath>backend/controllers/auth.controller.js</FilePath>
                        </p>
                    </Section>

                    {/* Storage */}
                    <Section id='storage' icon={Database} title='Storage model' kicker='Mongo collections'>
                        <ul className='list-disc pl-6 space-y-1 my-2'>
                            <li>
                                <InlineCode>User</InlineCode> — credentials, recent docs (last 5),
                                starred docs
                            </li>
                            <li>
                                <InlineCode>Document</InlineCode> — title, owner, collaborators, visibility,
                                sharing policy, content preview, user-colors map
                            </li>
                            <li>
                                <InlineCode>Version</InlineCode> — historical snapshots with author and
                                contributors
                            </li>
                        </ul>
                        <p>
                            Indexes on <InlineCode>ownerId</InlineCode>,{' '}
                            <InlineCode>collaborators.userId</InlineCode>, and{' '}
                            <InlineCode>visibility</InlineCode> keep dashboard queries fast even with thousands
                            of docs.
                        </p>
                        <p>
                            Images go to <strong>Cloudinary</strong> (folder{' '}
                            <InlineCode>collab_docs</InlineCode>) — Mongo only stores the secure URLs.
                        </p>
                    </Section>

                    {/* Stack */}
                    <Section id='stack' icon={Server} title='Tech stack' kicker='The full menu'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose'>
                            {[
                                ['Frontend', 'React 19, Vite, Tailwind v4, Redux Toolkit'],
                                ['Editor', 'Tiptap + Yjs (CRDT)'],
                                ['Realtime', 'Socket.IO (binary transport)'],
                                ['Backend', 'Node.js, Express'],
                                ['Database', 'MongoDB + Mongoose'],
                                ['Files', 'Cloudinary + Multer'],
                                ['PDF', 'Puppeteer (headless Chromium)'],
                                ['UI', 'Radix UI, lucide-react, framer-motion'],
                                ['Auth', 'JWT (jsonwebtoken)'],
                                ['Email', 'Nodemailer for invites'],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className='rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3'
                                >
                                    <div className='text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                                        {k}
                                    </div>
                                    <div className='text-sm text-gray-800 dark:text-gray-200 mt-1'>{v}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Futures */}
                    <Section id='futures' icon={GitBranch} title="What's next" kicker='Roadmap'>
                        <ul className='list-disc pl-6 space-y-1 my-2'>
                            <li>Inline comments anchored to text ranges (the chat is the first step).</li>
                            <li>
                                Sketch-board template — the model already supports{' '}
                                <InlineCode>'sketch-board'</InlineCode>; the canvas surface is the missing piece.
                            </li>
                            <li>
                                Offline-first drafts via the IndexedDB Yjs provider — already a half-step away
                                given Yjs is the source of truth.
                            </li>
                            <li>AI-assisted summaries and inline suggestions.</li>
                        </ul>
                    </Section>

                    {/* End CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className='my-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 p-8 text-center'
                    >
                        <h3 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                            That's the whole picture.
                        </h3>
                        <p className='text-gray-600 dark:text-gray-400 mb-6'>
                            Go open a doc and try every layer for yourself.
                        </p>
                        <Link
                            to='/signup'
                            className='inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-shadow'
                        >
                            Get started <ArrowRight className='size-4' />
                        </Link>
                    </motion.div>
                </main>
            </div>

            <footer className='border-t border-gray-200 dark:border-gray-800 py-8 px-4'>
                <div className='container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400'>
                    <div className='flex items-center gap-2'>
                        <img src={logo} alt='Logo' className='h-5' />
                        <span
                            className='font-bold text-gray-900 dark:text-white'
                            style={{ fontFamily: 'Nunito' }}
                        >
                            DocWeave
                        </span>
                        <span className='text-gray-400 dark:text-gray-600'>· docs</span>
                    </div>
                    <div className='flex items-center gap-5'>
                        <Link to='/testing' className='hover:text-gray-900 dark:hover:text-white'>
                            Landing
                        </Link>
                        <Link to='/login' className='hover:text-gray-900 dark:hover:text-white'>
                            Login
                        </Link>
                        <a href='#' className='hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-1'>
                            <FaGithub /> GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DocsPage;
