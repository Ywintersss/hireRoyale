'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
    stream?: MediaStream | null
    label?: string
    muted?: boolean
}

export default function VideoTile({ stream, label, muted }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        if (videoRef.current) {
            if (stream) {
                videoRef.current.srcObject = stream
            } else {
                videoRef.current.srcObject = null
            }
        }
    }, [stream])

    return (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
            {label && (
                <div className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-black/60 text-white rounded">
                    {label}
                </div>
            )}
        </div>
    )
}

