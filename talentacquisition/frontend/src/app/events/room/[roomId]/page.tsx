'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, CardBody, Chip, Select, SelectItem, Tooltip, Badge, Avatar } from '@heroui/react'
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Monitor,
    MonitorOff,
    PhoneOff,
    Settings,
    Users,
    MessageCircle,
    Circle,
    Square,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react'
import VideoTile from '@/components/VideoTile'
import { socket } from '@/lib/socket'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'


export default function VideoRoomPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params.roomId as string

    const { data: session, error } = authClient.useSession()
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStreams, setRemoteStreams] = useState<Participant[]>([])
    const [isMicOn, setIsMicOn] = useState(true)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [showParticipants, setShowParticipants] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [availableDevices, setAvailableDevices] = useState<{
        video: MediaDeviceInfo[]
        audio: MediaDeviceInfo[]
    }>({ video: [], audio: [] })
    const [selectedVideoDevice, setSelectedVideoDevice] = useState('')
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('')
    const [connectionQuality, setConnectionQuality] = useState('excellent')
    const [roomStats, setRoomStats] = useState({
        participants: 1,
        duration: 0,
        bandwidth: '2.5 Mbps',
        latency: '45ms'
    })

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunksRef = useRef<Blob[]>([])

    const { data: roomData, isSuccess, isLoading, isError, error: roomError } = useQuery({
        queryKey: ['room', roomId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8000/rooms/get-room/${roomId}`);

            return response.json()
        }
    })
    // Performance optimization with debounced updates
    const debouncedSetConnectionQuality = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout
            return (quality: string) => {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => setConnectionQuality(quality), 500)
            }
        })(),
        []
    )

    useEffect(() => {
        let durationInterval: NodeJS.Timeout
        let initialized = false

        const initializeRoom = async () => {
            if (initialized) return
            initialized = true
            try {
                console.log('Initializing room:', roomId)
                console.log('Session:', session)

                let stream: MediaStream | null = null

                try {
                    // Try to get user media, but don’t block room join if it fails
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    })
                    setLocalStream(stream)
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream
                    }

                    // Get available devices only if permissions granted
                    const devices = await navigator.mediaDevices.enumerateDevices()
                    setAvailableDevices({
                        video: devices.filter(device => device.kind === 'videoinput'),
                        audio: devices.filter(device => device.kind === 'audioinput')
                    })
                } catch (err) {
                    console.warn('No camera/mic access. Joining room without media.', err)
                }

                // ✅ Always join the room, with or without media
                socket.emit('join-room', roomId, {
                    name: session?.user?.name || 'Unknown User',
                    role: session?.user?.role?.name || 'Unknown Role',
                    avatar: 'https://i.pravatar.cc/150?img=1'
                })
                console.log('join-room emitted!')

                // Start duration timer
                durationInterval = setInterval(() => {
                    setRoomStats(prev => ({ ...prev, duration: prev.duration + 1 }))
                }, 1000)

                // Simulate connection quality updates
                const qualityInterval = setInterval(() => {
                    const qualities = ['excellent', 'good', 'fair', 'poor']
                    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]
                    debouncedSetConnectionQuality(randomQuality)
                }, 10000)

                return () => {
                    clearInterval(qualityInterval)
                }
            } catch (error) {
                console.error('Error initializing room:', error)
            }
        }

        initializeRoom()

        return () => {
            if (durationInterval) clearInterval(durationInterval)
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [roomId, socket, debouncedSetConnectionQuality])

    // Fixed socket event handlers
    useEffect(() => {
        const handleRoomPeers = async (peers: string[]) => {
            console.log('Existing peers:', peers)

            // Update participant count

            // Create connections for existing peers (I'm the new joiner)
            for (const peerId of peers) {
                if (!peerConnections.current.has(peerId)) {
                    console.log('Creating connection for existing peer:', peerId)
                    const peerConnection = createPeerConnection(peerId)

                    // Add local stream
                    if (localStream) {
                        localStream.getTracks().forEach(track => {
                            peerConnection.addTrack(track, localStream)
                        })
                    }

                    // Create offer
                    const offer = await peerConnection.createOffer()
                    await peerConnection.setLocalDescription(offer)
                    socket.emit('offer', { to: peerId, sdp: offer })
                    console.log('Sent offer to existing peer:', peerId)
                }
            }
        }

        const handlePeerJoined = async (data: { socketId: string, metadata: any }) => {
            console.log('Peer joined:', data.socketId, data.metadata)

            // Add to remote streams list if not already there
            setRemoteStreams(prev => {
                if (prev.find(p => p.id === data.socketId)) return prev
                return [...prev, { id: data.socketId, metadata: data.metadata }]
            })

            // Update participant count

            // ✅ Create connection toward the new peer
            if (!peerConnections.current.has(data.socketId)) {
                console.log('Creating connection for newly joined peer:', data.socketId)
                const peerConnection = createPeerConnection(data.socketId)

                // Attach our local tracks
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        peerConnection.addTrack(track, localStream)
                    })
                }

                // Create and send offer
                const offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer)
                socket.emit('offer', { to: data.socketId, sdp: offer })
                console.log('Sent offer to new peer:', data.socketId)
            }
        }

        const handlePeerLeft = (data: { socketId: string }) => {
            console.log('Peer left:', data.socketId)

            const peerConnection = peerConnections.current.get(data.socketId)
            if (peerConnection) {
                peerConnection.close()
                peerConnections.current.delete(data.socketId)
            }

            setRemoteStreams(prev => prev.filter(p => p.id !== data.socketId))
            setRoomStats(prev => ({ ...prev, participants: Math.max(1, prev.participants - 1) }))
        }

        const handleOffer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
            console.log('Received offer from:', from)

            const peerConnection = createPeerConnection(from)

            // Add local stream
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStream)
                })
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            socket.emit('answer', { to: from, sdp: answer })
            console.log('Sent answer to:', from)
        }

        const handleAnswer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
            console.log('Received answer from:', from)
            const peerConnection = peerConnections.current.get(from)
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
            }
        }

        const handleIceCandidate = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
            const peerConnection = peerConnections.current.get(from)
            if (peerConnection && peerConnection.remoteDescription) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            }
        }

        socket.on('room-peers', handleRoomPeers)
        socket.on('peer-joined', handlePeerJoined)
        socket.on('peer-left', handlePeerLeft)
        socket.on('offer', handleOffer)
        socket.on('answer', handleAnswer)
        socket.on('ice-candidate', handleIceCandidate)

        return () => {
            socket.off('room-peers', handleRoomPeers)
            socket.off('peer-joined', handlePeerJoined)
            socket.off('peer-left', handlePeerLeft)
            socket.off('offer', handleOffer)
            socket.off('answer', handleAnswer)
            socket.off('ice-candidate', handleIceCandidate)
        }
    }, [socket, localStream])

    useEffect(() => {
        if (!localStream) return

        peerConnections.current.forEach((pc) => {
            const senders = pc.getSenders()

            localStream.getTracks().forEach(track => {
                // Replace track if already present
                const sender = senders.find(s => s.track?.kind === track.kind)
                if (sender) {
                    sender.replaceTrack(track)
                } else {
                    pc.addTrack(track, localStream)
                }
            })
        })
    }, [localStream])

    useEffect(() => {
        setRoomStats(prev => ({
            ...prev,
            participants: remoteStreams.length + 1 // 1 for me
        }))
    }, [remoteStreams])

    const createPeerConnection = (peerId: string) => {
        if (peerConnections.current.has(peerId)) {
            console.log('Connection already exists for:', peerId)
            return peerConnections.current.get(peerId)!
        }

        console.log('Creating new connection for:', peerId)
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        })

        peerConnection.ontrack = (event) => {
            console.log('Got remote stream from:', peerId)
            setRemoteStreams(prev =>
                prev.map(p =>
                    p.id === peerId ? { ...p, stream: event.streams[0] } : p
                )
            )
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { to: peerId, candidate: event.candidate })
            }
        }

        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}:`, peerConnection.connectionState)
        }

        peerConnections.current.set(peerId, peerConnection)
        return peerConnection
    }

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsMicOn(audioTrack.enabled)
            }
        }
    }

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsCameraOn(videoTrack.enabled)
            }
        }
    }

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream
                }
                setIsScreenSharing(true)
            } catch (error) {
                console.error('Error sharing screen:', error)
            }
        } else {
            if (localVideoRef.current && localStream) {
                localVideoRef.current.srcObject = localStream
            }
            setIsScreenSharing(false)
        }
    }

    const toggleRecording = () => {
        if (!isRecording) {
            startRecording()
        } else {
            stopRecording()
        }
    }

    const startRecording = () => {
        if (localStream) {
            const mediaRecorder = new MediaRecorder(localStream)
            mediaRecorderRef.current = mediaRecorder
            recordedChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `interview-recording-${Date.now()}.webm`
                a.click()
                URL.revokeObjectURL(url)
            }

            mediaRecorder.start()
            setIsRecording(true)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const changeCamera = async (deviceId: string) => {
        if (localStream) {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: true
            })
            setLocalStream(newStream)
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream
            }
            setSelectedVideoDevice(deviceId)
        }
    }

    const changeMic = async (deviceId: string) => {
        if (localStream) {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { deviceId: { exact: deviceId } }
            })
            setLocalStream(newStream)
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream
            }
            setSelectedAudioDevice(deviceId)
        }
    }

    const leaveRoom = () => {
        console.log('Leaving room...')

        // Close all peer connections
        peerConnections.current.forEach((pc, peerId) => {
            console.log('Closing connection with:', peerId)
            pc.close()
        })
        peerConnections.current.clear()

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }

        const { connectionInfo } = roomData

        socket.emit('leave-room')
        router.replace(`/events/lobby/${connectionInfo.eventId}`)
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getConnectionQualityColor = (quality: string) => {
        switch (quality) {
            case 'excellent': return 'success'
            case 'good': return 'primary'
            case 'fair': return 'warning'
            case 'poor': return 'danger'
            default: return 'default'
        }
    }

    return (
        <div className={`min-h-screen w-full transition-all duration-500 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316]'
            }`}>
            {/* Header */}
            <div className="top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full">
                                    <Video className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-xl font-bold text-white">Interview Room</span>
                                <Chip className="bg-green-500/20 text-green-300 border-green-500/30">
                                    <span className='flex items-center'>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                                        Live
                                    </span>
                                </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{formatDuration(roomStats.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">{roomStats.participants} participants</span>
                                </div>
                                <Chip
                                    size="sm"
                                    color={getConnectionQualityColor(connectionQuality) as any}
                                    variant="flat"
                                >
                                    {connectionQuality}
                                </Chip>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Tooltip content="Toggle Dark Mode">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="bordered"
                                    className="text-white border-white/30 hover:bg-white/10"
                                    onPress={() => setIsDarkMode(!isDarkMode)}
                                >
                                    {isDarkMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                            </Tooltip>
                            <Tooltip content="Toggle Sound">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="bordered"
                                    className="text-white border-white/30 hover:bg-white/10"
                                    onPress={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </Tooltip>
                            <Button
                                size="sm"
                                variant="bordered"
                                className="text-white border-white/30 hover:bg-white/10"
                                onPress={() => setShowParticipants(!showParticipants)}
                                startContent={<Users className="h-4 w-4" />}
                            >
                                Participants
                            </Button>
                            <Button
                                size="sm"
                                variant="bordered"
                                className="text-white border-white/30 hover:bg-white/10"
                                onPress={() => setShowChat(!showChat)}
                                startContent={<MessageCircle className="h-4 w-4" />}
                            >
                                Chat
                            </Button>
                            <Button
                                size="sm"
                                variant="bordered"
                                className="text-white border-white/30 hover:bg-white/10"
                                onPress={() => setShowSettings(!showSettings)}
                                startContent={<Settings className="h-4 w-4" />}
                            >
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 pb-6 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Video Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                        {/* Local Video */}
                        <Card className="bg-white/95 backdrop-blur shadow-xl border-0 overflow-hidden">
                            <CardBody className="p-0">
                                <div className="relative">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Chip className="bg-black/50 text-white text-xs">
                                            You (Local)
                                        </Chip>
                                    </div>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {!isMicOn && (
                                            <div className="p-1 bg-red-500 rounded-full">
                                                <MicOff className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                        {!isCameraOn && (
                                            <div className="p-1 bg-red-500 rounded-full">
                                                <VideoOff className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Remote Videos */}
                        {remoteStreams.map((participant) => (
                            <Card key={participant.id} className="bg-white/95 backdrop-blur shadow-xl border-0 overflow-hidden">
                                <CardBody className="p-0">
                                    <div className="relative">
                                        <VideoTile key={participant.id}
                                            stream={participant.stream}
                                            metadata={participant.metadata} />
                                        <div className="absolute top-3 left-3">
                                            <Chip className="bg-black/50 text-white text-xs">
                                                {participant.metadata?.name || 'Participant'}
                                            </Chip>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* Controls */}
                    <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <Tooltip content={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}>
                                    <Button
                                        isIconOnly
                                        size="lg"
                                        color={isMicOn ? 'primary' : 'danger'}
                                        variant={isMicOn ? 'solid' : 'bordered'}
                                        onPress={toggleMic}
                                        className="w-16 h-16"
                                    >
                                        {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                                    </Button>
                                </Tooltip>

                                <Tooltip content={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}>
                                    <Button
                                        isIconOnly
                                        size="lg"
                                        color={isCameraOn ? 'primary' : 'danger'}
                                        variant={isCameraOn ? 'solid' : 'bordered'}
                                        onPress={toggleCamera}
                                        className="w-16 h-16"
                                    >
                                        {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                                    </Button>
                                </Tooltip>

                                <Tooltip content={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
                                    <Button
                                        isIconOnly
                                        size="lg"
                                        color={isScreenSharing ? 'success' : 'primary'}
                                        variant={isScreenSharing ? 'solid' : 'bordered'}
                                        onPress={toggleScreenShare}
                                        className="w-16 h-16"
                                    >
                                        {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                                    </Button>
                                </Tooltip>

                                <Tooltip content={isRecording ? 'Stop Recording' : 'Start Recording'}>
                                    <Button
                                        isIconOnly
                                        size="lg"
                                        color={isRecording ? 'danger' : 'primary'}
                                        variant={isRecording ? 'solid' : 'bordered'}
                                        onPress={toggleRecording}
                                        className="w-16 h-16"
                                    >
                                        {isRecording ? <Square className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                    </Button>
                                </Tooltip>

                                <Tooltip content="Leave Room">
                                    <Button
                                        isIconOnly
                                        size="lg"
                                        color="danger"
                                        variant="solid"
                                        onPress={leaveRoom}
                                        className="w-16 h-16"
                                    >
                                        <PhoneOff className="h-6 w-6" />
                                    </Button>
                                </Tooltip>
                            </div>

                            {/* Device Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Camera"
                                    placeholder="Select camera"
                                    selectedKeys={selectedVideoDevice ? [selectedVideoDevice] : []}
                                    onSelectionChange={(keys) => {
                                        const deviceId = Array.from(keys)[0] as string
                                        if (deviceId) changeCamera(deviceId)
                                    }}
                                >
                                    {availableDevices.video.map((device) => (
                                        <SelectItem key={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Microphone"
                                    placeholder="Select microphone"
                                    selectedKeys={selectedAudioDevice ? [selectedAudioDevice] : []}
                                    onSelectionChange={(keys) => {
                                        const deviceId = Array.from(keys)[0] as string
                                        if (deviceId) changeMic(deviceId)
                                    }}
                                >
                                    {availableDevices.audio.map((device) => (
                                        <SelectItem key={device.deviceId}>
                                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Room Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
                            <CardBody className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span className="text-2xl font-bold text-gray-800">{roomStats.participants}</span>
                                </div>
                                <p className="text-sm text-gray-600">Participants</p>
                            </CardBody>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
                            <CardBody className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                    <span className="text-2xl font-bold text-gray-800">{formatDuration(roomStats.duration)}</span>
                                </div>
                                <p className="text-sm text-gray-600">Duration</p>
                            </CardBody>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
                            <CardBody className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    <span className="text-2xl font-bold text-gray-800">{roomStats.bandwidth}</span>
                                </div>
                                <p className="text-sm text-gray-600">Bandwidth</p>
                            </CardBody>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur shadow-lg border-0">
                            <CardBody className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-orange-600" />
                                    <span className="text-2xl font-bold text-gray-800">{roomStats.latency}</span>
                                </div>
                                <p className="text-sm text-gray-600">Latency</p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Side Panels */}
            {showParticipants && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur shadow-2xl border-l border-gray-200 z-40">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Participants</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <Avatar src="https://i.pravatar.cc/150?img=1" size="sm" />
                                <div>
                                    <div className="font-medium text-gray-800">John Developer</div>
                                    <div className="text-sm text-gray-600">Candidate</div>
                                </div>
                                <Chip size="sm" color="success" variant="flat">You</Chip>
                            </div>
                            {remoteStreams.map((participant) => (
                                <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Avatar src={participant.metadata?.avatar || 'https://i.pravatar.cc/150?img=2'} size="sm" />
                                    <div>
                                        <div className="font-medium text-gray-800">{participant.metadata?.name || 'Interviewer'}</div>
                                        <div className="text-sm text-gray-600">{participant.metadata?.role || 'Recruiter'}</div>
                                    </div>
                                    <Chip size="sm" color="primary" variant="flat">Online</Chip>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showChat && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur shadow-2xl border-l border-gray-200 z-40">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat</h3>
                        <div className="space-y-3 mb-4">
                            <div className="text-sm text-gray-500 text-center">Chat feature coming soon...</div>
                        </div>
                    </div>
                </div>
            )}

            {showSettings && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur shadow-2xl border-l border-gray-200 z-40">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Video Quality</label>
                                <Select label="Quality" defaultSelectedKeys={['720p']}>
                                    <SelectItem key="480p">480p</SelectItem>
                                    <SelectItem key="720p">720p</SelectItem>
                                    <SelectItem key="1080p">1080p</SelectItem>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Audio Quality</label>
                                <Select label="Quality" defaultSelectedKeys={['high']}>
                                    <SelectItem key="low">Low</SelectItem>
                                    <SelectItem key="medium">Medium</SelectItem>
                                    <SelectItem key="high">High</SelectItem>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

