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
const server = createServer(app, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

setupSocketIo(server);

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);

app.get('/', verifyToken, (req, res) => {
    res.send('HELLo WORLD');
});

const port = process.env.PORT || 5000;
const mongo_url = process.env.MONGO_URL;
server.listen(port, () => {
    connectDB(mongo_url);
    console.log('⚡ server is running on port:' + port);
});
