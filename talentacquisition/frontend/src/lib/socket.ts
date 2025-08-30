import { io } from "socket.io-client";


export const socket = io("http://localhost:8000", {
    //options
});'use client'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
    if (!socket) {
        socket = io('http://localhost:8000', {
            withCredentials: true,
            autoConnect: true,
        })
    }
    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

