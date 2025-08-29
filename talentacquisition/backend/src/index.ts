import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import cors from "cors"
import eventRoutes from './routes/events.ts'
import profileRoutes from './routes/profile.ts'
import path from "path";
import { __dirname } from "./lib/pathHelper.ts";
import http from "http";
import { initSocket } from "./lib/socket.ts";
import eventRoomRoutes from "./routes/eventroom.ts";

const app = express();

const port = 8000;


app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json())

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/events', eventRoutes)
app.use('/profile', profileRoutes)
app.use('/lobby', eventRoomRoutes)
app.use('/resumes', express.static(path.join(__dirname, "..", "..", "assets", "resumes")));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

const server = http.createServer(app);

initSocket(server); 

server.listen(port, () => {
    console.log(`Better Auth app listening on port ${port}`);
});
