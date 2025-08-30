import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import cors from "cors";
import morgan from "morgan";
import eventRoutes from './routes/events.ts';
import profileRoutes from './routes/profile.ts';
import shortlistRoutes from './routes/shortlist.ts';
import path from "path";
import { __dirname } from "./lib/pathHelper.ts";
import http from "http";
import { initSocket } from "./lib/socket.ts";
import eventRoomRoutes from "./routes/eventroom.ts";

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
app.use('/resumes', express.static(path.join(__dirname, "..", "..", "assets", "resumes")));

// Socket.IO signaling server
const io = new SocketIOServer(httpServer, {
    cors: corsOptions,
});

type PeerMetadata = {
    userId?: string;
    role?: string;
};

io.on("connection", (socket) => {
    let currentRoom: string | null = null;

    socket.on("join-room", (roomId: string, metadata: PeerMetadata = {}) => {
        currentRoom = roomId;
        socket.join(roomId);
        socket.to(roomId).emit("peer-joined", { socketId: socket.id, metadata });
        // Send existing peers back to the new joiner
        const clients = io.sockets.adapter.rooms.get(roomId) || new Set<string>();
        const peers = Array.from(clients).filter((id) => id !== socket.id);
        socket.emit("room-peers", peers);
    });

    socket.on("offer", (payload: { to: string; sdp: RTCSessionDescriptionInit }) => {
        io.to(payload.to).emit("offer", { from: socket.id, sdp: payload.sdp });
    });

    socket.on("answer", (payload: { to: string; sdp: RTCSessionDescriptionInit }) => {
        io.to(payload.to).emit("answer", { from: socket.id, sdp: payload.sdp });
    });

    socket.on("ice-candidate", (payload: { to: string; candidate: RTCIceCandidateInit }) => {
        io.to(payload.to).emit("ice-candidate", { from: socket.id, candidate: payload.candidate });
    });

    socket.on("leave-room", () => {
        if (currentRoom) {
            socket.to(currentRoom).emit("peer-left", { socketId: socket.id });
            socket.leave(currentRoom);
            currentRoom = null;
        }
    });

    socket.on("disconnect", () => {
        if (currentRoom) {
            socket.to(currentRoom).emit("peer-left", { socketId: socket.id });
        }
    });
});

httpServer.listen(port, () => {
    console.log(`API and signaling server listening on http://localhost:${port}`);
});
