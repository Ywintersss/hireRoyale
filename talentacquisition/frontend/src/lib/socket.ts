'use client'
import { io, Socket } from 'socket.io-client'

export let socket: Socket = io("http://localhost:8000", {
    //options
});

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

