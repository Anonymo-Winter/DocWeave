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
- **Polish** — a public playground on the landing page, a searchable dashboard, full auth (incl. forgot/reset password), and dark mode.

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
frontend/src/
├── pages/         # LandingPage, DashBoard, EditorPage, Login/SignUp, Forgot/Reset, …
├── components/    # Editor, EditorNavbar, ShareModal, VersionComponent, ErrorMessage, …
├── context/       # socketContext (Yjs + Socket.IO), yjsSetup
├── api/           # RTK Query slices: userApi, docApi, versionApi
├── store/         # Redux store + user slice (persisted)
├── hooks/         # useOfflineStatus, …
└── assets/        # logo / favicon
```

## 🚀 Getting started

**Prerequisites:** Node.js 20+ and the [DocWeave backend](https://github.com/Anonymo-Winter/collaborative_docs_backend) running.

```bash
cd frontend
npm install
npm run dev        # Vite dev server → http://localhost:5173
```

No `.env` is required. The backend URL is resolved from **Vite's build mode** in [`src/config.js`](src/config.js):

- `npm run dev` → `http://localhost:5000`
- `npm run build` (production) → the production backend

To change either URL, edit `src/config.js` (it's the single source of truth — no per-environment env vars to manage).

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

<p align="center">Part of <a href="https://docweave.tarunsumanthpuli.me/">DocWeave</a> · backend repo: <a href="https://github.com/Anonymo-Winter/collaborative_docs_backend">collaborative_docs_backend</a></p>
