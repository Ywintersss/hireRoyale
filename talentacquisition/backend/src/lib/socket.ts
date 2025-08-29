import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("Client connected", socket.id);

        socket.on("join_lobby", (roomId: string) => {
            socket.join(roomId);
            io.to(roomId).emit("user_joined", socket.id);
            console.log("User joined lobby", socket.id, roomId);
        });

        socket.on("leave_lobby", (roomId: string) => {
            socket.leave(roomId);
            io.to(roomId).emit("user_left", socket.id);
            console.log("User left lobby", socket.id, roomId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });

    console.log("Socket.io initialized!");

    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
}
