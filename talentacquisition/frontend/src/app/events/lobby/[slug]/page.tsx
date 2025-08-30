'use client'
import React, { useState, useEffect } from 'react';
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
    GraduationCap,
    Phone,
    Mail,
    Calendar
} from 'lucide-react';

// Mock data types
interface UserProfile {
    id: string;
    name: string;
    email: string;
    image: string;
    contact: string;
    role: 'user' | 'recruiter';
    // Additional profile data
    location?: string;
    experience?: string;
    skills?: string[];
    company?: string;
    position?: string;
    industry?: string;
    rating?: number;
    isOnline: boolean;
}

interface EventData {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    industry: string;
    level: string;
    participants: UserProfile[];
}

interface ConnectionRequest {
    from: UserProfile;
    to: UserProfile;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
}

const EventLobby = () => {
    // State management
    const [leftExpanded, setLeftExpanded] = useState(false);
    const [rightExpanded, setRightExpanded] = useState(false);
    const [currentUser] = useState<UserProfile>({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://i.pravatar.cc/150?img=1',
        contact: '+60123456789',
        role: 'user', // Change this to 'recruiter' to test recruiter view
        location: 'Kuala Lumpur, Malaysia',
        experience: '3 years',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        isOnline: true,
        rating: 4.5
    });

    const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
    const [activeConnections, setActiveConnections] = useState<string[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedConnection, setSelectedConnection] = useState<UserProfile | null>(null);

    // Mock event data
    const eventData: EventData = {
        id: '1',
        name: 'Tech Talent Connect 2025',
        description: 'Connect with top tech talent and leading companies',
        date: '2025-03-15',
        time: '14:00',
        industry: 'Technology',
        level: 'All Levels',
        participants: [
            {
                id: '2',
                name: 'Sarah Wilson',
                email: 'sarah@example.com',
                image: 'https://i.pravatar.cc/150?img=2',
                contact: '+60123456790',
                role: 'user',
                location: 'Singapore',
                experience: '5 years',
                skills: ['JavaScript', 'React', 'Vue.js', 'AWS'],
                isOnline: true,
                rating: 4.8
            },
            {
                id: '3',
                name: 'Mike Chen',
                email: 'mike@techcorp.com',
                image: 'https://i.pravatar.cc/150?img=3',
                contact: '+60123456791',
                role: 'recruiter',
                company: 'TechCorp Solutions',
                position: 'Senior Tech Recruiter',
                industry: 'Software Development',
                location: 'Kuala Lumpur, Malaysia',
                isOnline: true,
                rating: 4.9
            },
            {
                id: '4',
                name: 'Emily Rodriguez',
                email: 'emily@example.com',
                image: 'https://i.pravatar.cc/150?img=4',
                contact: '+60123456792',
                role: 'user',
                location: 'Bangkok, Thailand',
                experience: '2 years',
                skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
                isOnline: false,
                rating: 4.3
            },
            {
                id: '5',
                name: 'David Kim',
                email: 'david@innovative.com',
                image: 'https://i.pravatar.cc/150?img=5',
                contact: '+60123456793',
                role: 'recruiter',
                company: 'Innovative Tech Ltd',
                position: 'Lead Recruiter',
                industry: 'AI & Machine Learning',
                location: 'Seoul, South Korea',
                isOnline: true,
                rating: 4.7
            },
            {
                id: '6',
                name: 'Lisa Thompson',
                email: 'lisa@example.com',
                image: 'https://i.pravatar.cc/150?img=6',
                contact: '+60123456794',
                role: 'user',
                location: 'Melbourne, Australia',
                experience: '4 years',
                skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
                isOnline: true,
                rating: 4.6
            }
        ]
    };

    const jobSeekers = eventData.participants.filter(p => p.role === 'user');
    const recruiters = eventData.participants.filter(p => p.role === 'recruiter');

    const handlePanelToggle = (side: 'left' | 'right') => {
        if (side === 'left' && currentUser.role === 'user') {
            setLeftExpanded(!leftExpanded);
            setRightExpanded(false);
        } else if (side === 'right' && currentUser.role === 'recruiter') {
            setRightExpanded(!rightExpanded);
            setLeftExpanded(false);
        }
    };

    const handleConnectRequest = (recruiter: UserProfile) => {
        const newRequest: ConnectionRequest = {
            from: currentUser,
            to: recruiter,
            status: 'pending',
            message: `Hi ${recruiter.name}, I'm interested in connecting with you about opportunities at ${recruiter.company}.`
        };

        setConnectionRequests(prev => [...prev, newRequest]);

        // Simulate recruiter accepting the request after 2 seconds
        setTimeout(() => {
            setConnectionRequests(prev =>
                prev.map(req =>
                    req.to.id === recruiter.id && req.from.id === currentUser.id
                        ? { ...req, status: 'accepted' }
                        : req
                )
            );
            setActiveConnections(prev => [...prev, recruiter.id]);
        }, 2000);
    };

    const handleJoinVideoCall = (user: UserProfile) => {
        setSelectedConnection(user);
        // Navigate to the dedicated video room route with event slug and peer id
        const roomId = `${eventData.id}-${user.id}`;
        window.location.href = `/events/room/${roomId}`;
    };

    const renderUserCard = (user: UserProfile, isExpanded: boolean) => (
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
                            src={user.image}
                            size={isExpanded ? "lg" : "md"}
                            name={user.name}
                        />
                    </Badge>
                    <div className="flex-1">
                        <h4 className="text-brand-blue font-semibold text-sm">
                            {user.name}
                        </h4>
                        {!isExpanded ? (
                            <p className="text-xs text-gray-500">{user.role === 'user' ? 'Job Seeker' : 'Recruiter'}</p>
                        ) : (
                            <div className="space-y-2 mt-2">
                                {user.role === 'user' ? (
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

    const renderRecruiterRequirements = (recruiter: UserProfile) => {
        const hasConnection = activeConnections.includes(recruiter.id);
        const hasPendingRequest = connectionRequests.some(
            req => req.to.id === recruiter.id && req.from.id === currentUser.id && req.status === 'pending'
        );

        return (
            <Card key={recruiter.id} className="mb-4">
                <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Badge
                                content=""
                                color={recruiter.isOnline ? "success" : "default"}
                                shape="circle"
                                placement="bottom-right"
                            >
                                <Avatar src={recruiter.image} size="md" name={recruiter.name} />
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
                            <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">Frontend Developer</Chip>
                            <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">3+ years exp</Chip>
                            <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">React/TypeScript</Chip>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            "Seeking passionate frontend developers to join our innovative team. Remote-friendly with competitive compensation."
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
                                isDisabled={!recruiter.isOnline}
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
                            >
                                <User className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    </div>
                </CardBody>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316] p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Card className="mb-4 bg-white/95 backdrop-blur">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h1 className="text-2xl font-bold text-brand-blue">{eventData.name}</h1>
                                <p className="text-gray-600">{eventData.description}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{eventData.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{eventData.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{eventData.participants.length} participants</span>
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
                                                {jobSeekers.length}
                                            </Chip>
                                        </div>
                                    )}
                                    {currentUser.role === 'user' && (
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
                                        {jobSeekers.map(user => renderUserCard(user, true))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2">
                                        {jobSeekers.slice(0, 8).map(user => (
                                            <Badge
                                                key={user.id}
                                                content=""
                                                color={user.isOnline ? "success" : "default"}
                                                shape="circle"
                                                placement="bottom-right"
                                            >
                                                <Avatar
                                                    src={user.image}
                                                    size="sm"
                                                    name={user.name}
                                                />
                                            </Badge>
                                        ))}
                                        {jobSeekers.length > 8 && (
                                            <Chip size="sm" className="bg-[#EEF2FF] text-brand-blue">
                                                +{jobSeekers.length - 8}
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
                                {currentUser.role === 'user' ? (
                                    <div className="space-y-4">
                                        {recruiters.map(recruiter => renderRecruiterRequirements(recruiter))}
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
                                                .filter(req => req.to.id === currentUser.id)
                                                .map((request, idx) => (
                                                    <Card key={idx} className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar src={request.from.image} size="sm" />
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
                                    {currentUser.role === 'recruiter' && (
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
                                                {recruiters.length}
                                            </Chip>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-3 overflow-y-auto">
                                {rightExpanded ? (
                                    <div className="space-y-3">
                                        {recruiters.map(user => renderUserCard(user, true))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2">
                                        {recruiters.slice(0, 8).map(user => (
                                            <Badge
                                                key={user.id}
                                                content=""
                                                color={user.isOnline ? "success" : "default"}
                                                shape="circle"
                                                placement="bottom-right"
                                            >
                                                <Avatar
                                                    src={user.image}
                                                    size="sm"
                                                    name={user.name}
                                                />
                                            </Badge>
                                        ))}
                                        {recruiters.length > 8 && (
                                            <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">
                                                +{recruiters.length - 8}
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
            </div>
        </div>
    );
};

export default EventLobby;
