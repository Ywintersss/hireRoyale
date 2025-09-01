'use client'
import React, { useEffect, useRef } from 'react'
import { Avatar } from '@heroui/react'

interface VideoTileProps {
    stream?: MediaStream
    metadata: {
        name?: string
        role?: string
        avatar?: string
    }
    isLocal?: boolean
}

export default function VideoTile({ stream, metadata, isLocal = false }: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-md relative">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal} // mute only your own video
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-white">
                    <Avatar
                        src={metadata.avatar}
                        name={metadata.name || 'Unknown'}
                        size="lg"
                        className="mb-2"
                    />
                    <p className="text-sm font-medium">{metadata.name || 'Unknown User'}</p>
                    {metadata.role && (
                        <p className="text-xs text-gray-400">{metadata.role}</p>
                    )}
                </div>
            )}
        </div>
    )
}
