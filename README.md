<h1 align="center">DocWeave</h1>

<p align="center">
  A real-time collaborative document editor — write together, with live cursors, an AI writing assistant, and full version history.
</p>

<p align="center">
  <a href="https://docweave.tarunsumanthpuli.me/">🔗 Live app</a>
</p>

---

DocWeave lets a whole team edit the same document at once. Edits sync instantly through Yjs CRDTs over Socket.IO, an AI assistant can answer questions about a document or write and rewrite content in place, and every document has version history and fine-grained sharing controls.

## ✨ Highlights

- **Real-time multiplayer editing** — Tiptap + Yjs CRDTs over Socket.IO, with live cursors, presence, in-document chat, and offline tolerance.
- **AI writing assistant** — ask, generate, and rewrite, streamed live into the editor (Groq, Llama 3.3 70B).
- **Version history** — named checkpoints you can restore, star, rename, or delete.
- **Sharing & roles** — Owner / Editor / Viewer, five visibility modes, delegated sharing, and email invites.
- **Export** — PDF, Word (DOCX), Markdown, and HTML.
- **Auth** — email/password and Google sign-in.

## 📁 Repository layout

| Folder | What's inside | Docs |
| ------ | ------------- | ---- |
| [`backend/`](backend) | Node.js, Express 5, Socket.IO, Yjs relay, MongoDB, AI and email services | [Backend README](backend/README.md) |
| [`frontend/`](frontend) | React 19, Vite, Tiptap editor, Redux Toolkit, Tailwind CSS | [Frontend README](frontend/README.md) |

## 🚀 Running locally

```bash
git clone https://github.com/Anonymo-Winter/docweave.git
cd docweave
cp backend/.env.example backend/.env     # fill in your values
cp frontend/.env.example frontend/.env   # only needed for Google sign-in
```

### Option 1: Docker (includes a MongoDB database)

```bash
docker compose --profile db up --build
```

Then open http://localhost:5173. The `db` profile starts a local MongoDB for you, and the backend connects to it automatically.

> PDF export uses Puppeteer, whose bundled Chrome doesn't run in the Alpine-based container. Set `BROWSER_WS_ENDPOINT` in `backend/.env` (for example, to a Browserless endpoint) to use PDF export under Docker. Everything else works out of the box.

### Option 2: Without Docker

Requires Node.js 20+ and a MongoDB database (set `MONGO_URL` in `backend/.env`).

```bash
cd backend && npm install && npm run dev     # http://localhost:5000
cd frontend && npm install && npm run dev    # http://localhost:5173 (in a second terminal)
```

See the [backend](backend/README.md) and [frontend](frontend/README.md) READMEs for environment variables, the REST and Socket.IO APIs, and design notes.

---

<p align="center"><sub>© 2026 Tarun Sumanth Puli. All rights reserved. This code is shared for portfolio viewing only and may not be copied, modified, or used without permission.</sub></p>
