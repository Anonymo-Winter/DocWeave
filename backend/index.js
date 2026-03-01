import express from "express";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import authRouter from "./routes/auth.route.js";
import docRouter from "./routes/doc.route.js";
import versionRouter from "./routes/version.route.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { setupSocketIo } from "./socket.js";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const mongo_url = process.env.MONGO_URL;

app.use(
	cors({
		origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL],
		methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// ✅ Your public folder is already inside backend, so:
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/api/auth", authRouter);
app.use("/api/doc", docRouter);
app.use("/api/version", versionRouter);

// ✅ If you want "/" to serve the HTML explicitly:
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = createServer(app);
setupSocketIo(server);

server.listen(port, "0.0.0.0", () => {
	connectDB(mongo_url);
	console.log("⚡ server is running on port:" + port);
});
