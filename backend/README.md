<h1 align="center">DocWeave — Backend</h1>

<p align="center">
  The real-time, multiplayer engine behind <strong>DocWeave</strong> — a collaborative document editor.
</p>

<p align="center">
  <a href="https://docweave.tarunsumanthpuli.me/">🔗 Live app</a>
</p>

---

DocWeave lets a whole team write in the same document at once — with live cursors, an AI writing assistant, version history, and fine-grained sharing. This is the Node/Express + Socket.IO backend that powers it.

## ✨ What it does

- **Real-time co-editing** — a custom **Yjs CRDT relay over Socket.IO**. One connection carries document updates, chat, presence, and awareness. New joiners sync with just a **state-vector diff**.
- **AI assistant** — `ask` (Q&A about a doc), `generate` (stream new content to the whole room), and `rewrite` (reshape a selection in a chosen tone), streamed token-by-token via **Groq (Llama 3.3 70B)**.
- **Roles & access** — Owner / Editor / Viewer resolved by a **single source of truth** (`resolveUserRole`) used by *both* the REST API and the socket layer, plus 5 visibility modes, delegated sharing, content lock, and ownership transfer.
- **Versioning** — manual snapshots with author, collaborators, and word count; restore / rename / star / delete.
- **Rolling-blob autosave** — the server owns the authoritative `Y.Doc` and persists it on a debounce + max-wait, flushes when the last user leaves, and **flushes every room on graceful shutdown**.
- **Emails** — welcome, document invite, ownership transfer, and password reset (Nodemailer).
- **Exports & uploads** — server-side PDF (Puppeteer); inline image uploads via Multer → Cloudinary.
- **Auth** — email/password (bcrypt-hashed) and **Google sign-in** (the access token is verified server-side against Google's userinfo endpoint — no client secret needed). JWT verified by both REST middleware and the socket handshake; password reset via hashed, expiring tokens.

## 🧱 Tech stack

| Area | Tech |
| --- | --- |
| Runtime | Node.js, Express 5 |
| Real-time | Socket.IO, Yjs, y-protocols |
| Database | MongoDB, Mongoose |
| AI | OpenAI SDK → Groq (`llama-3.3-70b-versatile`) |
| Auth | jsonwebtoken, bcryptjs |
| Files | Multer, Cloudinary, Puppeteer (PDF) |
| Email | Nodemailer |

## 📂 Structure

```
backend/
├── index.js              # Entry: Express + Socket.IO server, graceful shutdown
├── connectDB.js          # Mongo connection
├── socket.js             # Yjs relay, autosave, chat, awareness, AI events
├── realtime.js           # Helpers to push role/access changes to live sockets
├── controllers/          # auth · doc · version
├── routes/               # /api/auth · /api/doc · /api/version
├── models/               # user · document · documentState · version
├── middlewares/          # verifytoken · metrics
├── util/                 # sendEmail · cloudinary · templates
└── AI/                   # client (Groq) + actions (ask · generate · rewrite)
```

## 🚀 Getting started

**Prerequisites:** Node.js 20+, a MongoDB database, and a Groq API key (for AI features).

```bash
cd backend
npm install
npm run dev        # nodemon index.js  →  http://localhost:5000
```

Create a `.env` in `backend/`:

```ini
# 'production' uses the production frontend URL for CORS + email links;
# anything else falls back to http://localhost:5173 (see config.js).
NODE_ENV=production

PORT=5000
MONGO_URL=your-mongodb-connection-string
JWT_KEY=a-long-random-secret

# AI (Groq)
GROQ_API_KEY=your-groq-api-key

# Email (Gmail App Password — not your account password)
ADMIN_GMAIL=you@gmail.com
ADMIN_GMAIL_PASSWORD=your-16-char-app-password

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> `.env` is loaded **before any other import** (`import "dotenv/config"` is the first line of `index.js`) so values are available when the email transporter and AI client are constructed.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | yes (prod) | `production` selects the production frontend URL (CORS + email links); otherwise localhost. The URLs live in `config.js`, not env. |
| `PORT` | no (default `5000`) | Server port |
| `MONGO_URL` | **yes** | MongoDB connection string |
| `JWT_KEY` | **yes** | Secret for signing/verifying JWTs (REST + socket) |
| `GROQ_API_KEY` | for AI | Groq key; AI features are disabled without it |
| `ADMIN_GMAIL` / `ADMIN_GMAIL_PASSWORD` | for email | Gmail + App Password for Nodemailer |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for uploads | Cloudinary credentials |

## 🌐 REST API

All routes are prefixed with `/api`. Most require a valid JWT (cookie or `Authorization: Bearer <token>`).

**Auth — `/api/auth`**
| Method | Path | Description |
| --- | --- | --- |
| POST | `/register` | Create account (sends welcome email) |
| POST | `/login` | Sign in, returns JWT + sets cookie |
| POST | `/google` | Sign in / sign up with a Google access token |
| POST | `/logout` | Clear session |
| GET | `/check-auth` | Current user from token |
| POST | `/search` | Find users by email (for sharing) |
| POST | `/forgot-password` | Email a reset link |
| POST | `/reset-password` | Set a new password from a token |

**Documents — `/api/doc`**
| Method | Path | Description |
| --- | --- | --- |
| POST | `/create` | Create a document |
| GET | `/document/:id` | Get a document + caller's role |
| POST | `/document/:id` | Update visibility / roles / sharing / transfer ownership |
| DELETE | `/document/:id` | Delete (owner only) |
| POST | `/add-people` | Invite collaborators by email |
| POST | `/doc-rename` | Rename a document |
| POST | `/:id/upload` | Upload an inline image (Cloudinary) |
| POST | `/generate-pdf` | Render the document to PDF (Puppeteer) |
| GET | `/user-documents/:userId` | Dashboard listing |
| POST | `/save-version` | Save a manual version snapshot |
| GET | `/versions/:id` | List a document's versions |
| GET | `/version/:id` | Load the latest state (autosave blob or version) |

**Versions — `/api/version`**
| Method | Path | Description |
| --- | --- | --- |
| PATCH | `/star` | Toggle a version's starred flag |
| POST | `/:documentId` | Rename / describe a version |
| DELETE | `/:documentId` | Delete a version |

## 🔌 Socket.IO

The token is verified in `io.use()` before the connection upgrades. Key events:

- `join-room` → server resolves role, assigns a deterministic color, returns the current `Y.Doc` state
- `update` / `sync` / `request-sync` / `sync-update` → CRDT document sync (write-guarded by role)
- `awareness-update` → cursors & presence
- `message` / `message-notification` → in-document chat + system notices
- `active-users` / `assign-color` / `access-updated` / `access-denied` → presence & live permission changes
- `ai-ask` / `ai-generate` / `ai-rewrite` → AI streams (`*-start` / `*-stream` / `*-end` / `*-error`)

## 🏗️ Notable design decisions

- **One permission resolver, everywhere.** `resolveUserRole` is the only function that answers "what can this user do on this doc," and both Express handlers and socket handlers call into it — so access rules never drift.
- **Server-owned autosave.** Because the server applies every edit to an authoritative `Y.Doc`, it's the single writer for autosave — no client coordination, and state is flushed before a room's doc is evicted from memory or the process exits.
- **Env loaded first.** ES module imports run before module bodies, so `dotenv` is imported for its side effect on line 1 to avoid constructing the mail/AI clients with empty credentials.

---

<p align="center">Part of <a href="https://docweave.tarunsumanthpuli.me/">DocWeave</a> · frontend repo: <a href="https://github.com/Anonymo-Winter/collaborative_docs_frontend">collaborative_docs_frontend</a></p>
