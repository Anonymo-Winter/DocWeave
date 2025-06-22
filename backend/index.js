import express from 'express';
import dotenv from 'dotenv';
import connectDB from './connectDB.js';
import authRouter from './routes/auth.route.js';
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
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://192.168.200.30:5173',
            'http://192.168.200.30:5174',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);

app.get('/', verifyToken, (req, res) => {
    res.send('HELLo WORLD');
});

const server = createServer(app);
setupSocketIo(server);

server.listen(port, '0.0.0.0', () => {
    connectDB(mongo_url);
    console.log('⚡ server is running on port:' + port);
});
