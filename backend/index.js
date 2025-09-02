import express from 'express';
import dotenv from 'dotenv';
import connectDB from './connectDB.js';
import authRouter from './routes/auth.route.js';
import docRouter from './routes/doc.route.js';
import versionRouter from './routes/version.route.js';

import { verifyToken } from './middlewares/verifytoken.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { setupSocketIo } from './socket.js';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongo_url = process.env.MONGO_URL;

app.use(
    cors({
        origin: ['http://localhost:5173', process.env.FRONTEND_URL],
        methods: ['GET', 'POST'],
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/doc', docRouter);
app.use('/api/version', versionRouter);

app.get('/', (req, res) => {
    res.send('HELLo WORLD');
});

const server = createServer(app);
setupSocketIo(server);

server.listen(port, '0.0.0.0', () => {
    connectDB(mongo_url);
    console.log('⚡ server is running on port:' + port);
});
