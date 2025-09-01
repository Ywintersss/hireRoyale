'use client'
import React, { useState, useEffect, use } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Avatar,
    Chip,
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Badge,
    Tooltip,
    addToast,
} from "@heroui/react";
import {
    ChevronLeft,
    ChevronRight,
    Users,
    Briefcase,
    User,
    Video,
    MessageCircle,
    Star,
    MapPin,
    Clock,
    Building,
    Phone,
    Calendar
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { User as UserSchema, UserEvent, JobRequirementData, ConnectionRequest } from '../../../../../types/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import RecruiterProfileModal from '@/components/LobbyRecruiterProfile';
import { socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { ConnectionData, RoomData } from '../../../../../../backend/src/types/types copy';

const EventLobby = ({ params }: { params: Promise<{ slug: string }> }) => {
    const [leftExpanded, setLeftExpanded] = useState(false);
    const [rightExpanded, setRightExpanded] = useState(false);

    const [selectedRecruiter, setSelectedRecruiter] = useState<UserSchema | {}>({});
    const [selectedJob, setSelectedJob] = useState<JobRequirementData | {}>({});
    const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
    const [activeConnections, setActiveConnections] = useState<string[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
    const [selectedConnection, setSelectedConnection] = useState<UserSchema | null>(null);
    const [jobSeekers, setJobSeekers] = useState<UserSchema[]>([])
    const [recruiters, setRecruiters] = useState<UserSchema[]>([])

    const router = useRouter()

    const { slug } = use(params)

    const { data: session, isPending, error, refetch } = authClient.useSession()
    const currentUser = session?.user

    const { data: eventData, isLoading, isSuccess } = useQuery({
        queryKey: ['events', slug],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8000/events/fetch-one/${slug}`)
            return response.json()
        },
    })

    const { data: jobsData, isLoading: isJobsLoading, isSuccess: isJobsSuccess } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8000/events/get-jobs`)
            return response.json()
        },
    })

    const createConnectionRequestMutation = useMutation({
        mutationFn: async ({ applicantId, recruiterId }: { applicantId: string, recruiterId: string }) => {
            const response = await fetch(`http://localhost:8000/rooms/create-connection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicantId: applicantId,
                    recruiterId: recruiterId,
                    eventId: slug
                }),
                credentials: 'include'
            })

            return response.json()
        },
        onSuccess: (data) => {
            addToast({
                title: "Request Sent",
                description: "Connection request has been sent to the recruiter!",
                timeout: 3000,
                shouldShowTimeoutProgress: true,
            })
            socket?.emit('send-connection-request', { user: session?.user, connection: data.connection })
        }

    })

    const createRoomMutation = useMutation({
        mutationFn: async ({ connectingUserId, connection }: { connectingUserId: string, connection: ConnectionData }): Promise<{ roomId: string, room: RoomData }> => {
            const response = await fetch(`http://localhost:8000/rooms/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicantId: connectingUserId,
                    recruiterId: connection.recruiterId,
                    lobbyId: connection.lobbyId
                }),
                credentials: 'include'
            })

            return response.json()
        },
        onSuccess: (data: { roomId: string, room: RoomData }) => {
            socket.emit('accept-connection-request', { roomId: data.roomId, roomData: data.room })
            router.push(`/events/room/${data.roomId}`)
        }
    })

    const acceptConnection = (connectingUser: UserSchema, connection: ConnectionData) => {
        createRoomMutation.mutate({
            connectingUserId: connectingUser.id,
            connection: connection
        })
    }

    useEffect(() => {
        const handler = (data: { roomId: string }) => {
            router.push(`/events/room/${data.roomId}`)
        };

        socket?.on('connection-accepted', handler)

        return () => {
            socket.off("connection-accepted", handler); // cleanup
        };
    }, []);

    useEffect(() => {
        const handler = (data: any) => {
            addToast({
                title: `Request Connection from ${data.connectingUser.name}`,
                description: `${data.connectingUser.name} wants to connect with you!`,
                timeout: 3000,
                shouldShowTimeoutProgress: true,
                color: 'primary',
                endContent: (
                    <Button size='sm' variant='flat' color='primary' onPress={() => {
                        acceptConnection(data.connectingUser, data.connection)
                    }}>
                        Connect
                    </Button>
                )
            })
        };

        socket?.on('receive-connection-request', handler)

        return () => {
            socket.off("receive-connection-request", handler); // cleanup
        };
    }, []);

    useEffect(() => {
        if (isSuccess) {
            let jobSeekers = eventData?.participants.filter((p: { user: { role: { name: string; }; }; }) => p.user.role.name === 'User')
            jobSeekers = jobSeekers.map((participant: UserEvent) => {
                return participant.user
            })

            let recruiters = eventData?.participants.filter((p: { user: { role: { name: string; }; }; }) => p.user.role.name === 'Recruiter')
            recruiters = recruiters.map((recruiter: UserEvent) => {
                return recruiter.user
            })

            setJobSeekers(jobSeekers)
            setRecruiters(recruiters)
        }

    }, [isSuccess])

    const handlePanelToggle = (side: 'left' | 'right') => {
        if (side === 'left' && currentUser?.role.name === 'User') {
            setLeftExpanded(!leftExpanded);
            setRightExpanded(false);
        } else if (side === 'right' && currentUser?.role.name === 'Recruiter') {
            setRightExpanded(!rightExpanded);
            setLeftExpanded(false);
        }
    };

    const handleConnectRequest = (recruiter: UserSchema) => {
        const newRequest: ConnectionRequest = {
            from: currentUser,
            to: recruiter,
            status: 'pending',
            message: `Hi ${recruiter.name}, I'm interested in connecting with you about opportunities at ${recruiter.company}.`
        };

        setConnectionRequests(prev => [...prev, newRequest]);

        // Have recruiter accept connection
        createConnectionRequestMutation.mutate({
            recruiterId: recruiter.id,
            applicantId: currentUser?.id as string
        })

    };

    const handleJoinVideoCall = (user: UserSchema) => {
        setSelectedConnection(user);
        const roomId = `${eventData.id}-${user.id}`;
        window.location.href = `/events/room/${roomId}`;
    };

    const leaveLobby = () => {
        fetch('http://localhost:8000/lobby/leave-lobby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                eventId: eventData.id,
            })
        }
        )
            .then(response => response.json())
            .then(data => {
                console.log('Lobby left:', data);
                socket.emit('leave_lobby', eventData.id);
                router.push('/events')
            })
            .catch(error => console.error('Error leaving lobby:', error));
    }

    const handleOpenRecruiterProfile = (recruiter: UserSchema, job: JobRequirementData) => {
        setSelectedRecruiter(recruiter)
        setSelectedJob(job)
        onProfileOpen()
    }

    const renderUserCard = (user: UserSchema, isExpanded: boolean) => (
        <Card key={user.id} className="mb-3">
            <CardBody className="p-3">
                <div className="flex items-center gap-3">
                    <Badge
                        content=""
                        color={user.isOnline ? "success" : "default"}
                        shape="circle"
                        placement="bottom-right"
                    >
                        <Avatar
                            src={user.image as string}
                            size={isExpanded ? "lg" : "md"}
                            name={user.name}
                        />
                    </Badge>
                    <div className="flex-1">
                        <h4 className="text-brand-blue font-semibold text-sm">
                            {user.name}
                        </h4>
                        {!isExpanded ? (
                            <p className="text-xs text-gray-500">{user?.role.name === 'User' ? 'Job Seeker' : 'Recruiter'}</p>
                        ) : (
                            <div className="space-y-2 mt-2">
                                {user?.role.name === 'User' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-brand-teal" />
                                            <span className="text-xs text-gray-600">{user.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-3 w-3 text-brand-teal" />
                                            <span className="text-xs text-gray-600">{user.experience} experience</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 text-brand-orange" />
                                            <span className="text-xs text-gray-600">{user.rating}/5.0</span>
                                        </div>
                                        {user.skills && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {user.skills.slice(0, 3).map((skill, idx) => (
                                                    <Chip key={idx} size="sm" className="text-xs bg-[#EEF2FF] text-brand-blue">
                                                        {skill}
                                                    </Chip>
                                                ))}
                                                {user.skills.length > 3 && (
                                                    <Chip size="sm" className="text-xs bg-gray-100 text-gray-600">
                                                        +{user.skills.length - 3}
                                                    </Chip>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3 text-brand-teal" />
                                            <span className="text-xs text-gray-600">{user.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3 text-brand-teal" />
                                            <span className="text-xs text-gray-600">{user.position}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-brand-teal" />
                                            <span className="text-xs text-gray-600">{user.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 text-brand-orange" />
                                            <span className="text-xs text-gray-600">{user.rating}/5.0</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const renderRecruiterRequirements = (recruiter: UserSchema) => {
        const hasConnection = activeConnections.includes(recruiter.id);
        const hasPendingRequest = connectionRequests.some(
            req => req.to.id === recruiter.id && req.from.id === currentUser?.id && req.status === 'pending'
        );

        return (
            <>
                {
                    !isJobsLoading && jobsData.filter((job: JobRequirementData) => recruiter.id === job.userId && slug === job.eventId).map((job: JobRequirementData, idx: number) => {
                        const requirements = job.requiredSkills.split(',')
                        return (<Card key={`${job.id}-${recruiter.id}`} className="mb-4">
                            <CardBody className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            content=""
                                            color={recruiter.isOnline ? "success" : "default"}
                                            shape="circle"
                                            placement="bottom-right"
                                        >
                                            <Avatar src={recruiter.image as string} size="md" name={recruiter.name} />
                                        </Badge>
                                        <div>
                                            <h4 className="text-brand-blue font-semibold">{recruiter.name}</h4>
                                            <p className="text-sm text-gray-600">{recruiter.company}</p>
                                            <p className="text-xs text-brand-teal">{recruiter.industry}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-brand-orange fill-current" />
                                        <span className="text-sm text-gray-600">{recruiter.rating}</span>
                                    </div>
                                </div>

                                <Divider className="my-3" />

                                <div className="space-y-2 mb-4">
                                    <h5 className="font-medium text-brand-blue text-sm">Looking For:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            requirements.map((req) => {
                                                return (

                                                    <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">{req}</Chip>
                                                )
                                            })
                                        }
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {hasConnection ? (
                                        <Button
                                            size="sm"
                                            className="bg-green-500 text-white flex-1"
                                            startContent={<Video className="h-4 w-4" />}
                                            onPress={() => handleJoinVideoCall(recruiter)}
                                        >
                                            Join Call
                                        </Button>
                                    ) : hasPendingRequest ? (
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="border-brand-orange text-brand-orange flex-1"
                                            isDisabled
                                        >
                                            Request Sent
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="bg-brand-teal text-white flex-1"
                                            startContent={<MessageCircle className="h-4 w-4" />}
                                            onPress={() => handleConnectRequest(recruiter)}
                                        >
                                            Connect
                                        </Button>
                                    )}
                                    <Tooltip content="View Profile">
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            isIconOnly
                                            className="border-brand-blue text-brand-blue"
                                            onPress={() => handleOpenRecruiterProfile(recruiter, job)}
                                        >
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </Tooltip>

                                </div>
                            </CardBody>
                        </Card>)
                    })
                }
            </>
        );
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316] p-4">
            <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-brand-blue border-red-500 bg-red-500/75"
                onPress={() => leaveLobby()}
            >
                <ChevronLeft />
            </Button>
            {!isLoading && isSuccess &&
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <Card className="mb-4 bg-white/95 backdrop-blur">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <h1 className="text-2xl font-bold text-brand-blue">{eventData?.name}</h1>
                                    <p className="text-gray-600">{eventData?.description}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{eventData?.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{eventData?.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {eventData?.participants &&
                                            <span>{eventData?.participants.length} participants</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Main Content */}
                    <div className="flex gap-4 h-[calc(100vh-200px)]">
                        {/* Left Panel - Job Seekers */}
                        <div className={`transition-all duration-300 ${leftExpanded ? 'w-80' : 'w-16'
                            } flex-shrink-0`}>
                            <Card className="h-full bg-white/95 backdrop-blur">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        {leftExpanded && (
                                            <div className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-brand-blue" />
                                                <span className="font-semibold text-brand-blue">Job Seekers</span>
                                                <Chip size="sm" className="bg-[#EEF2FF] text-brand-blue">
                                                    {jobSeekers?.length}
                                                </Chip>
                                            </div>
                                        )}
                                        {currentUser?.role.name === 'User' && (
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="text-brand-blue"
                                                onPress={() => handlePanelToggle('left')}
                                            >
                                                {leftExpanded ? <ChevronLeft /> : <ChevronRight />}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-3 overflow-y-auto">
                                    {leftExpanded ? (
                                        <div className="space-y-3">
                                            {jobSeekers?.map(user => renderUserCard(user, true))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            {jobSeekers?.slice(0, 8).map(user => (
                                                <Badge
                                                    key={user.id}
                                                    content=""
                                                    color={user.isOnline ? "success" : "default"}
                                                    shape="circle"
                                                    placement="bottom-right"
                                                >
                                                    <Avatar
                                                        src={user.image as string}
                                                        size="sm"
                                                        name={user.name}
                                                    />
                                                </Badge>
                                            ))}
                                            {jobSeekers?.length > 8 && (
                                                <Chip size="sm" className="bg-[#EEF2FF] text-brand-blue">
                                                    +{jobSeekers?.length - 8}
                                                </Chip>
                                            )}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Center Panel */}
                        <div className="flex-1">
                            <Card className="h-full bg-white/95 backdrop-blur">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-brand-teal" />
                                        <span className="font-semibold text-brand-teal">Opportunities</span>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-4 overflow-y-auto">
                                    {currentUser?.role.name === 'User' ? (
                                        <div className="space-y-4">
                                            {recruiters?.map(recruiter => renderRecruiterRequirements(recruiter))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                                Recruiter Dashboard
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                Manage your connections and review candidate profiles
                                            </p>
                                            <div className="space-y-3">
                                                {connectionRequests
                                                    .filter(req => req.to.id === currentUser?.id)
                                                    .map((request, idx) => (
                                                        <Card key={idx} className="p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar src={request.from.image as string} size="sm" />
                                                                    <div>
                                                                        <p className="font-medium text-sm">{request.from.name}</p>
                                                                        <p className="text-xs text-gray-500">wants to connect</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="bg-brand-teal text-white">
                                                                        Accept
                                                                    </Button>
                                                                    <Button size="sm" variant="bordered">
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Right Panel - Recruiters */}
                        <div className={`transition-all duration-300 ${rightExpanded ? 'w-80' : 'w-16'
                            } flex-shrink-0`}>
                            <Card className="h-full bg-white/95 backdrop-blur">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        {currentUser?.role.name === 'Recruiter' && (
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="text-brand-teal"
                                                onPress={() => handlePanelToggle('right')}
                                            >
                                                {rightExpanded ? <ChevronRight /> : <ChevronLeft />}
                                            </Button>
                                        )}
                                        {rightExpanded && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-brand-teal" />
                                                <span className="font-semibold text-brand-teal">Recruiters</span>
                                                <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">
                                                    {recruiters?.length}
                                                </Chip>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-3 overflow-y-auto">
                                    {rightExpanded ? (
                                        <div className="space-y-3">
                                            {recruiters?.map(user => renderUserCard(user, true))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            {recruiters?.slice(0, 8).map(user => (
                                                <Badge
                                                    key={user.id}
                                                    content=""
                                                    color={user.isOnline ? "success" : "default"}
                                                    shape="circle"
                                                    placement="bottom-right"
                                                >
                                                    <Avatar
                                                        src={user.image as string}
                                                        size="sm"
                                                        name={user.name}
                                                    />
                                                </Badge>
                                            ))}
                                            {recruiters?.length > 8 && (
                                                <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">
                                                    +{recruiters?.length - 8}
                                                </Chip>
                                            )}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Video Call Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                        <ModalContent>
                            <ModalHeader className="flex flex-col gap-1">
                                <h3 className="text-brand-blue">Video Call with {selectedConnection?.name}</h3>
                                <p className="text-sm text-gray-600">{selectedConnection?.company}</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
                                    <div className="text-center text-white">
                                        <Video className="h-12 w-12 mx-auto mb-4 opacity-60" />
                                        <p className="text-lg">Video call would start here</p>
                                        <p className="text-sm opacity-80">Integration with video calling service</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <Button
                                        isIconOnly
                                        className="bg-red-500 text-white"
                                        size="lg"
                                    >
                                        <Phone className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="bg-brand-teal text-white"
                                        size="lg"
                                    >
                                        <Video className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        className="bg-brand-blue text-white"
                                        size="lg"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose}>
                                    End Call
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <RecruiterProfileModal
                        isOpen={isProfileOpen}
                        onClose={onProfileClose}
                        recruiter={selectedRecruiter}
                        jobData={selectedJob}
                    />
                </div>
            }
        </div>

    );
};

export default EventLobby;
