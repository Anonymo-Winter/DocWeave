import 'dotenv/config';
import express from 'express';
import { isProduction, CLIENT_URL } from './config.js';
import connectDB from './connectDB.js';
import authRouter from './routes/auth.route.js';
import docRouter from './routes/doc.route.js';
import versionRouter from './routes/version.route.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { setupSocketIo, flushAllAutosaves } from './socket.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const mongo_url = process.env.MONGO_URL;

app.use(
    cors({
        origin: isProduction ? CLIENT_URL : ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/api/auth', authRouter);
app.use('/api/doc', docRouter);
app.use('/api/version', versionRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = createServer(app);
setupSocketIo(server);

server.listen(port, '0.0.0.0', () => {
    connectDB(mongo_url);
    console.log('⚡ server is running on port:' + port);
});

// Graceful shutdown: persist every active document's rolling-blob state before exit.
let shuttingDown = false;
const gracefulShutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received — flushing autosaves before exit...`);
    try {
        await flushAllAutosaves();
    } catch (err) {
        console.error('Error flushing autosaves on shutdown:', err);
    }
    server.close(() => process.exit(0));
    // Safety net: force exit if close() hangs.
    setTimeout(() => process.exit(0), 10000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
