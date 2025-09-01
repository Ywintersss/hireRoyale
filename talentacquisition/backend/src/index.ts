import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import morgan from "morgan";
import eventRoutes from './routes/events.js';
import profileRoutes from './routes/profile.js';
import shortlistRoutes from './routes/shortlist.js';
import path from "path";
import { __dirname } from "./lib/pathHelper.js";
import http from "http";
import { initSocket } from "./lib/socket.js";
import eventRoomRoutes from "./routes/eventroom.js";
import { scheduleLobbyCreation } from "./timed/timedLobbyCreation.js";
import eventCallRoomRoutes from "./routes/eventcallroom.js"

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT || 8000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS for both Express and Socket.IO
const corsOptions = {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Auth and routes
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/events', eventRoutes);
app.use('/profile', profileRoutes);
app.use('/shortlist', shortlistRoutes);
app.use('/lobby', eventRoomRoutes)
app.use('/rooms', eventCallRoomRoutes)
app.use('/resumes', express.static(path.join(__dirname, "..", "..", "assets", "resumes")));

initSocket(httpServer)

httpServer.listen(port, () => {
    console.log(`API and signaling server listening on http://localhost:${port}`);
});

scheduleLobbyCreation("cmf0s98470009tqz8wbs983s0", "Lobby")
