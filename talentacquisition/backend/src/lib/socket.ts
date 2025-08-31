import { Server } from "socket.io";
import type { PeerMetadata, User } from "../../../frontend/types/types.ts";
import type { ConnectionData, RoomData } from "../types/types.ts";

let io: Server;

export function initSocket(server: any) {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("Client connected", socket.id);

        // Track current room for cleanup
        let currentRoom: string | null = null;

        socket.on("join-room", (roomId: string, metadata: PeerMetadata = {}) => {
            console.log(`=== JOIN ROOM REQUEST ===`);
            console.log(`Socket ${socket.id} requesting to join room: ${roomId}`);
            console.log('Metadata:', metadata);

            // Prevent duplicate joins
            if (currentRoom === roomId) {
                console.log(`Socket ${socket.id} already in room ${roomId}`);
                return;
            }

            // Leave previous room if exists
            if (currentRoom) {
                socket.leave(currentRoom);
                socket.to(currentRoom).emit("peer-left", { socketId: socket.id });
                console.log(`Socket ${socket.id} left previous room: ${currentRoom}`);
            }

            // Join new room
            socket.join(roomId);
            currentRoom = roomId;

            // Get existing peers BEFORE joining
            const room = io.sockets.adapter.rooms.get(roomId);
            const existingPeers = room ? Array.from(room).filter(id => id !== socket.id) : [];

            console.log(`Room ${roomId} status:`);
            console.log(`- Total sockets in room: ${room?.size || 1}`);
            console.log(`- Existing peers: ${existingPeers.length}`, existingPeers);
            console.log(`- New joiner: ${socket.id}`);

            // Send existing peers to new joiner FIRST
            socket.emit("room-peers", existingPeers);
            console.log(`✅ Sent ${existingPeers.length} existing peers to ${socket.id}`);

            // Then announce new peer to existing peers
            socket.to(roomId).emit("peer-joined", {
                socketId: socket.id,
                metadata
            });
            console.log(`✅ Announced new peer ${socket.id} to ${existingPeers.length} existing peers`);
        });

        socket.on("offer", (payload: { to: string; sdp: RTCSessionDescriptionInit }) => {
            console.log(`📤 Forwarding OFFER: ${socket.id} → ${payload.to}`);
            io.to(payload.to).emit("offer", {
                from: socket.id,
                sdp: payload.sdp
            });
        });

        socket.on("answer", (payload: { to: string; sdp: RTCSessionDescriptionInit }) => {
            console.log(`📤 Forwarding ANSWER: ${socket.id} → ${payload.to}`);
            io.to(payload.to).emit("answer", {
                from: socket.id,
                sdp: payload.sdp
            });
        });

        socket.on("ice-candidate", (payload: { to: string; candidate: RTCIceCandidateInit }) => {
            console.log(`📤 Forwarding ICE: ${socket.id} → ${payload.to}`);
            io.to(payload.to).emit("ice-candidate", {
                from: socket.id,
                candidate: payload.candidate
            });
        });

        socket.on("leave-room", () => {
            console.log(`=== LEAVE ROOM REQUEST ===`);
            console.log(`Socket ${socket.id} leaving room: ${currentRoom}`);

            if (currentRoom) {
                // Announce departure to other peers
                socket.to(currentRoom).emit("peer-left", { socketId: socket.id });

                // Leave the room
                socket.leave(currentRoom);

                const room = io.sockets.adapter.rooms.get(currentRoom);
                console.log(`Room ${currentRoom} now has ${room?.size || 0} participants`);

                currentRoom = null;
            }
        });

        socket.on("disconnect", () => {
            console.log(`=== DISCONNECT ===`);
            console.log(`Socket ${socket.id} disconnected`);

            if (currentRoom) {
                socket.to(currentRoom).emit("peer-left", { socketId: socket.id });
                console.log(`Announced departure of ${socket.id} from ${currentRoom}`);
            }
        });

        socket.on("join_lobby", (lobbyId: string, userId: string) => {
            socket.join(lobbyId);
            socket.join(userId);
            io.to(lobbyId).emit("user_joined", socket.id);
            console.log("User joined lobby", socket.id, lobbyId);
        });

        socket.on("leave_lobby", (lobbyId: string) => {
            socket.leave(lobbyId);
            io.to(lobbyId).emit("user_left", socket.id);
            console.log("User left lobby", socket.id, lobbyId);
        });

        socket.on("send-connection-request", ({ user, connection }: { user: User, connection: ConnectionData }) => {
            io.to(connection.recruiterId).emit('receive-connection-request', {
                connectingUser: user,
                connection: connection
            });
        });

        socket.on('accept-connection-request', ({ roomId, roomData }: { roomId: string, roomData: RoomData }) => {
            io.to(roomData.applicantId).emit('connection-accepted', { roomId: roomId });
            io.to(roomData.applicantId).socketsJoin(roomId);
            io.to(roomData.recruiterId).socketsJoin(roomId);
        });
    });

    console.log("Socket.io initialized!");
    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
}
