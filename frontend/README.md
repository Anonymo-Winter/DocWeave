<h1 align="center">DocWeave — Frontend</h1>

<p align="center">
  The React client for <strong>DocWeave</strong> — write documents together, in real time.
</p>

<p align="center">
  <a href="https://docweave.tarunsumanthpuli.me/">🔗 Live app</a>
</p>

---

DocWeave is a collaborative document editor where your whole team edits the same page at once — live cursors and presence, a built-in AI writing assistant, full version history, and sharing controls from a private draft to anyone-with-the-link. This is the Vite + React frontend.

## ✨ Features

- **Real-time multiplayer editing** — Tiptap + Yjs CRDTs over a Socket.IO connection, with live cursors, color-coded presence, in-document chat, offline tolerance, and **per-user undo/redo**.
- **AI writing assistant** — ask questions about the document, generate new content, or rewrite a selection in a chosen tone — streamed live into the editor.
- **Version history** — save named checkpoints (author, collaborators, word count), then restore, star, rename, or delete.
- **Sharing & roles** — Owner / Editor / Viewer, five visibility modes, delegated sharing, content lock, and email invites.
- **A capable editor** — headings, lists, task lists, code blocks, highlights, alignment, links, sub/superscript, typography, and inline image uploads (Cloudinary).
- **Export anywhere** — PDF, Word (DOCX), Markdown, and HTML.
- **Auth** — email/password and **Sign in with Google** (OAuth), plus forgot/reset password.
- **Polish** — a public playground on the landing page, a searchable dashboard, and dark mode.

## 🧱 Tech stack

| Area | Tech |
| --- | --- |
| Framework | React 19, Vite |
| Styling | Tailwind CSS v4, framer-motion |
| State / data | Redux Toolkit + RTK Query, redux-persist |
| Editor | Tiptap |
| Real-time | Yjs, Socket.IO client, y-indexeddb |
| Routing | React Router 7 |
| Export | docx, turndown, html2pdf.js, file-saver |
| Icons / toasts | lucide-react, react-icons, sonner |

## 📂 Structure

```
src/
├── pages/         # LandingPage, DashBoard, EditorPage, Login/SignUp, Forgot/Reset, …
├── components/    # Editor, EditorNavbar, ShareModal, VersionComponent, ErrorMessage, …
├── context/       # socketContext (Yjs + Socket.IO), yjsSetup
├── api/           # RTK Query slices: userApi, docApi, versionApi
├── store/         # Redux store + user slice (persisted)
├── hooks/         # useOfflineStatus, …
└── assets/        # logo / favicon
```

## 🚀 Getting started

**Prerequisites:** Node.js 20+ and the [DocWeave backend](../backend) running.

```bash
git clone https://github.com/Anonymo-Winter/docweave.git
cd docweave/frontend
npm install
cp .env.example .env   # only needed for Google sign-in
npm run dev            # Vite dev server → http://localhost:5173
```

For Google sign-in, set this in `.env`:

```ini
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

> Create the client ID in Google Cloud Console (OAuth 2.0 Client ID → Web application) and add your origins to **Authorized JavaScript origins**: `http://localhost:5173` and your production URL. Email/password auth works without it; only Google sign-in needs it.

The **backend URL** is *not* an env var — it's resolved from **Vite's build mode** in [`src/config.js`](src/config.js):

- `npm run dev` → `http://localhost:5000`
- `npm run build` (production) → the production backend

To change either URL, edit `src/config.js`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## 🔗 How it connects

- **REST** goes through RTK Query slices (`api/`) to the backend's `/api/*` routes; the JWT is attached from the persisted Redux store and a session cookie.
- **Real-time** is handled in `context/socketContext.jsx` — it opens the Socket.IO connection (authenticated with the JWT), wires the Yjs document to the editor, and relays updates, awareness, chat, and presence. `y-indexeddb` keeps a local copy so edits survive reloads and brief disconnects.

---

<p align="center">Part of <a href="https://docweave.tarunsumanthpuli.me/">DocWeave</a> · <a href="../backend">backend</a> · <a href="../README.md">project overview</a></p>

<p align="center"><sub>© 2026 Tarun Sumanth Puli. All rights reserved. This code is shared for portfolio viewing only and may not be copied, modified, or used without permission.</sub></p>
