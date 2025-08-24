'use client'
import React, { useState, useEffect } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Badge,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    Select,
    SelectItem,
    DatePicker,
    Divider,
    Spinner,
    Avatar,
    AvatarGroup,
} from "@heroui/react";
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Plus,
    Edit,
    Eye,
    UserPlus,
    Building,
    Star,
    CheckCircle,
    AlertCircle,
    Filter,
} from 'lucide-react';

// Types based on your Prisma schema
interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: Role;
}

interface Role {
    id: string;
    name: string;
}

interface Event {
    id: string;
    name: string;
    description?: string;
    date?: Date;
    time?: Date;
    requirements?: string;
    status?: string;
    maxParticipants?: number;
    industry?: string;
    level?: string;
    imgUrl?: string;
    createdBy: User;
    participants: UserEvent[];
    _count?: {
        participants: number;
    };
}

interface UserEvent {
    userId: string;
    eventId: string;
    user: User;
    event: Event;
}

interface EventsPageProps {
    currentUser: User;
    events: Event[];
    onJoinEvent: (eventId: string) => Promise<void>;
    onCreateEvent: (eventData: any) => Promise<void>;
    onEditEvent: (eventId: string, eventData: any) => Promise<void>;
}

const EventsPage: React.FC<EventsPageProps> = ({
    currentUser,
    events,
    onJoinEvent,
    onCreateEvent,
    onEditEvent
}) => {
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        time: '',
        requirements: '',
        maxParticipants: '',
        industry: '',
        level: '',
        imgUrl: ''
    });

    const isRecruiter = currentUser.role?.name === 'Recruiter';
    const isUser = currentUser.role?.name === 'User';
    const MINIMUM_RECRUITERS = 5; // Based on your requirement

    // Filter events based on user role and status
    useEffect(() => {
        let filtered = events;

        if (isUser) {
            // Users can only see approved events
            filtered = events.filter(event => event.status === 'approved');
        }

        // Apply additional filters
        if (filter === 'my-events' && isRecruiter) {
            filtered = filtered.filter(event => event.createdBy.id === currentUser.id);
        } else if (filter === 'joined') {
            filtered = filtered.filter(event =>
                event.participants.some(p => p.userId === currentUser.id)
            );
        }

        setFilteredEvents(filtered);
    }, [events, currentUser, filter, isUser, isRecruiter]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return { backgroundColor: '#0EA5E9', color: '#ffffff' };
            case 'pending':
                return { backgroundColor: '#F97316', color: '#ffffff' };
            case 'live':
                return { backgroundColor: '#10B981', color: '#ffffff' };
            case 'completed':
                return { backgroundColor: '#6B7280', color: '#ffffff' };
            default:
                return { backgroundColor: '#1E3A8A', color: '#ffffff' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            case 'live':
                return <Users className="h-4 w-4" />;
            default:
                return <Calendar className="h-4 w-4" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'beginner':
                return { backgroundColor: '#EEF2FF', color: '#1E3A8A' };
            case 'intermediate':
                return { backgroundColor: '#F0F9FF', color: '#0EA5E9' };
            case 'advanced':
                return { backgroundColor: '#FFF7ED', color: '#F97316' };
            default:
                return { backgroundColor: '#F3F4F6', color: '#374151' };
        }
    };

    const handleCreateEvent = async () => {
        setIsLoading(true);
        try {
            await onCreateEvent(formData);
            setIsCreateModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditEvent = async () => {
        if (!selectedEvent) return;
        setIsLoading(true);
        try {
            await onEditEvent(selectedEvent.id, formData);
            setIsEditModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error editing event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinEvent = async (eventId: string) => {
        setIsLoading(true);
        try {
            await onJoinEvent(eventId);
        } catch (error) {
            console.error('Error joining event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            date: '',
            time: '',
            requirements: '',
            maxParticipants: '',
            industry: '',
            level: '',
            imgUrl: ''
        });
    };

    const openEditModal = (event: Event) => {
        setSelectedEvent(event);
        setFormData({
            name: event.name,
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.time ? new Date(event.time).toTimeString().slice(0, 5) : '',
            requirements: event.requirements || '',
            maxParticipants: event.maxParticipants?.toString() || '',
            industry: event.industry || '',
            level: event.level || '',
            imgUrl: event.imgUrl || ''
        });
        setIsEditModalOpen(true);
    };

    const isUserJoined = (event: Event) => {
        return event.participants.some(p => p.userId === currentUser.id);
    };

    const getRecruiterCount = (event: Event) => {
        return event.participants.filter(p => p.user.role?.name === 'Recruiter').length;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
                            Events
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {isUser
                                ? 'Discover and join approved events'
                                : 'Manage and participate in events'
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Dropdown */}
                        <Select
                            placeholder="Filter Events"
                            size="md"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-48"
                            classNames={{
                                trigger: "border-gray-300 hover:border-brand-teal",
                                value: "text-gray-900"
                            }}
                        >
                            <SelectItem key="all" value="all">All Events</SelectItem>
                            <SelectItem key="joined" value="joined">Joined Events</SelectItem>
                            {isRecruiter && (
                                <SelectItem key="my-events" value="my-events">My Events</SelectItem>
                            )}
                        </Select>

                        {/* Create Event Button - Only for Recruiters */}
                        {isRecruiter && (
                            <Button
                                startContent={<Plus className="h-4 w-4" />}
                                className="bg-brand-teal text-white font-semibold"
                                onPress={() => setIsCreateModalOpen(true)}
                            >
                                Create Event
                            </Button>
                        )}
                    </div>
                </div>

                {/* Events Grid */}
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4" style={{ color: '#6B7280' }} />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-600">
                            {isRecruiter
                                ? "Create your first event to get started"
                                : "Check back later for new events"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const recruiterCount = getRecruiterCount(event);
                            const userJoined = isUserJoined(event);

                            return (
                                <Card key={event.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        style={getStatusColor(event.status || 'pending')}
                                                        startContent={getStatusIcon(event.status || 'pending')}
                                                    >
                                                        {event.status || 'Pending'}
                                                    </Chip>
                                                    {event.level && (
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            style={getLevelColor(event.level)}
                                                        >
                                                            {event.level}
                                                        </Chip>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
                                                    {event.name}
                                                </h3>
                                            </div>

                                            {/* Actions Dropdown for Recruiters */}
                                            {isRecruiter && event.createdBy.id === currentUser.id && (
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    size="sm"
                                                    onPress={() => openEditModal(event)}
                                                >
                                                    <Edit className="h-4 w-4" style={{ color: '#F97316' }} />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardBody className="pt-0">
                                        {/* Event Details */}
                                        <div className="space-y-3 mb-4">
                                            {event.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}

                                            {event.date && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                    {event.time && (
                                                        <>
                                                            <Clock className="h-4 w-4 ml-2" />
                                                            {new Date(event.time).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {event.industry && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building className="h-4 w-4" />
                                                    {event.industry}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users className="h-4 w-4" />
                                                    {event._count?.participants || event.participants.length} joined
                                                    {event.maxParticipants && (
                                                        <span>/ {event.maxParticipants}</span>
                                                    )}
                                                </div>

                                                {/* Show recruiter count for pending events */}
                                                {event.status === 'pending' && (
                                                    <Chip size="sm" style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}>
                                                        {recruiterCount}/{MINIMUM_RECRUITERS} recruiters
                                                    </Chip>
                                                )}
                                            </div>

                                            {/* Participants Preview */}
                                            {event.participants.length > 0 && (
                                                <AvatarGroup size="sm" max={3}>
                                                    {event.participants.slice(0, 3).map((participant) => (
                                                        <Avatar
                                                            key={participant.userId}
                                                            src={participant.user.image}
                                                            name={participant.user.name}
                                                            size="sm"
                                                        />
                                                    ))}
                                                </AvatarGroup>
                                            )}
                                        </div>

                                        <Divider className="mb-4" />

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="bordered"
                                                size="sm"
                                                startContent={<Eye className="h-4 w-4" />}
                                                className="flex-1"
                                                onPress={() => {
                                                    setSelectedEvent(event);
                                                    setIsDetailModalOpen(true);
                                                }}
                                            >
                                                View Details
                                            </Button>

                                            {/* Join Button */}
                                            {!userJoined ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-brand-teal text-white flex-1"
                                                    startContent={<UserPlus className="h-4 w-4" />}
                                                    onPress={() => handleJoinEvent(event.id)}
                                                    isLoading={isLoading}
                                                    isDisabled={
                                                        event.maxParticipants ?
                                                            (event._count?.participants || event.participants.length) >= event.maxParticipants
                                                            : false
                                                    }
                                                >
                                                    Join Event
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="bordered"
                                                    className="flex-1 border-green-500 text-green-600"
                                                    startContent={<CheckCircle className="h-4 w-4" />}
                                                    isDisabled
                                                >
                                                    Joined
                                                </Button>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Create Event Modal */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    size="2xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader style={{ color: '#1E3A8A' }}>
                            Create New Event
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Event Name"
                                    placeholder="Enter event name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Describe your event"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                        }}
                                    />

                                    <Input
                                        type="time"
                                        label="Time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Industry"
                                        placeholder="Select industry"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            trigger: 'border-gray-300 focus:border-brand-teal',
                                        }}
                                    >
                                        <SelectItem key="technology" value="technology">Technology</SelectItem>
                                        <SelectItem key="finance" value="finance">Finance</SelectItem>
                                        <SelectItem key="healthcare" value="healthcare">Healthcare</SelectItem>
                                        <SelectItem key="education" value="education">Education</SelectItem>
                                        <SelectItem key="retail" value="retail">Retail</SelectItem>
                                    </Select>

                                    <Select
                                        label="Level"
                                        placeholder="Select level"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            trigger: 'border-gray-300 focus:border-brand-teal',
                                        }}
                                    >
                                        <SelectItem key="beginner" value="beginner">Beginner</SelectItem>
                                        <SelectItem key="intermediate" value="intermediate">Intermediate</SelectItem>
                                        <SelectItem key="advanced" value="advanced">Advanced</SelectItem>
                                    </Select>
                                </div>

                                <Input
                                    type="number"
                                    label="Max Participants"
                                    placeholder="Maximum number of participants"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <Textarea
                                    label="Requirements"
                                    placeholder="List any requirements or prerequisites"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => setIsCreateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-brand-teal text-white"
                                onPress={handleCreateEvent}
                                isLoading={isLoading}
                            >
                                Create Event
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Edit Event Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    size="2xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader style={{ color: '#1E3A8A' }}>
                            Edit Event
                        </ModalHeader>
                        <ModalBody>
                            {/* Same form fields as create modal */}
                            <div className="space-y-4">
                                <Input
                                    label="Event Name"
                                    placeholder="Enter event name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Describe your event"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                        }}
                                    />

                                    <Input
                                        type="time"
                                        label="Time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Industry"
                                        placeholder="Select industry"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            trigger: 'border-gray-300 focus:border-brand-teal',
                                        }}
                                    >
                                        <SelectItem key="technology" value="technology">Technology</SelectItem>
                                        <SelectItem key="finance" value="finance">Finance</SelectItem>
                                        <SelectItem key="healthcare" value="healthcare">Healthcare</SelectItem>
                                        <SelectItem key="education" value="education">Education</SelectItem>
                                        <SelectItem key="retail" value="retail">Retail</SelectItem>
                                    </Select>

                                    <Select
                                        label="Level"
                                        placeholder="Select level"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            trigger: 'border-gray-300 focus:border-brand-teal',
                                        }}
                                    >
                                        <SelectItem key="beginner" value="beginner">Beginner</SelectItem>
                                        <SelectItem key="intermediate" value="intermediate">Intermediate</SelectItem>
                                        <SelectItem key="advanced" value="advanced">Advanced</SelectItem>
                                    </Select>
                                </div>

                                <Input
                                    type="number"
                                    label="Max Participants"
                                    placeholder="Maximum number of participants"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />

                                <Textarea
                                    label="Requirements"
                                    placeholder="List any requirements or prerequisites"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-brand-orange text-white"
                                onPress={handleEditEvent}
                                isLoading={isLoading}
                            >
                                Update Event
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Event Detail Modal */}
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    size="3xl"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        {selectedEvent && (
                            <>
                                <ModalHeader className="flex items-center gap-3">
                                    <span style={{ color: '#1E3A8A' }}>{selectedEvent.name}</span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        style={getStatusColor(selectedEvent.status || 'pending')}
                                        startContent={getStatusIcon(selectedEvent.status || 'pending')}
                                    >
                                        {selectedEvent.status || 'Pending'}
                                    </Chip>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-6">
                                        {selectedEvent.description && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                                <p className="text-gray-600">{selectedEvent.description}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                                                <div className="space-y-2">
                                                    {selectedEvent.date && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    {selectedEvent.time && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    {selectedEvent.industry && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Building className="h-4 w-4 text-gray-400" />
                                                            <span>{selectedEvent.industry}</span>
                                                        </div>
                                                    )}
                                                    {selectedEvent.level && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Star className="h-4 w-4 text-gray-400" />
                                                            <span>{selectedEvent.level}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Participation</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span>
                                                            {selectedEvent._count?.participants || selectedEvent.participants.length} participants
                                                            {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants} max`}
                                                        </span>
                                                    </div>

                                                    {selectedEvent.status === 'pending' && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                                            <span className="text-orange-600">
                                                                {getRecruiterCount(selectedEvent)}/{MINIMUM_RECRUITERS} recruiters needed to approve
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedEvent.requirements && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                                                <p className="text-gray-600 text-sm">{selectedEvent.requirements}</p>
                                            </div>
                                        )}

                                        {selectedEvent.participants.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedEvent.participants.map((participant) => (
                                                        <div key={participant.userId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                            <Avatar
                                                                src={participant.user.image}
                                                                name={participant.user.name}
                                                                size="sm"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-medium">{participant.user.name}</p>
                                                                <p className="text-xs text-gray-500">{participant.user.role?.name || 'User'}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Divider />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">Created by</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Avatar
                                                        src={selectedEvent.createdBy.image}
                                                        name={selectedEvent.createdBy.name}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{selectedEvent.createdBy.name}</p>
                                                        <p className="text-xs text-gray-500">{selectedEvent.createdBy.role?.name || 'Recruiter'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isUserJoined(selectedEvent) && (
                                                <Button
                                                    className="bg-brand-teal text-white"
                                                    startContent={<UserPlus className="h-4 w-4" />}
                                                    onPress={() => {
                                                        handleJoinEvent(selectedEvent.id);
                                                        setIsDetailModalOpen(false);
                                                    }}
                                                    isLoading={isLoading}
                                                    isDisabled={
                                                        selectedEvent.maxParticipants ?
                                                            (selectedEvent._count?.participants || selectedEvent.participants.length) >= selectedEvent.maxParticipants
                                                            : false
                                                    }
                                                >
                                                    Join Event
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        variant="light"
                                        onPress={() => setIsDetailModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

// Demo component showing how to use the EventsPage
const EventsListPage = () => {
    const [events, setEvents] = useState<Event[]>([
        // Mock data - replace with real data from your API
        {
            id: '1',
            name: 'Tech Recruitment Fair 2024',
            description: 'Connect with top tech companies and discover exciting career opportunities in software development, AI, and more.',
            date: new Date('2024-03-15'),
            time: new Date('2024-03-15T10:00:00'),
            requirements: 'Bachelor degree in Computer Science or related field, portfolio required',
            status: 'approved',
            maxParticipants: 50,
            industry: 'technology',
            level: 'intermediate',
            imgUrl: '',
            createdBy: {
                id: '1',
                name: 'John Recruiter',
                email: 'john@company.com',
                role: { id: '1', name: 'Recruiter' }
            },
            participants: [
                {
                    userId: '2',
                    eventId: '1',
                    user: {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: { id: '2', name: 'User' }
                    },
                    event: {} as Event
                },
                {
                    userId: '3',
                    eventId: '1',
                    user: {
                        id: '3',
                        name: 'Bob Johnson',
                        email: 'bob@example.com',
                        role: { id: '1', name: 'Recruiter' }
                    },
                    event: {} as Event
                }
            ],
            _count: { participants: 2 }
        },
        {
            id: '2',
            name: 'Healthcare Professionals Meetup',
            description: 'Networking event for healthcare professionals and recent graduates.',
            date: new Date('2024-03-20'),
            time: new Date('2024-03-20T14:00:00'),
            requirements: 'Medical background preferred',
            status: 'pending',
            maxParticipants: 30,
            industry: 'healthcare',
            level: 'beginner',
            imgUrl: '',
            createdBy: {
                id: '4',
                name: 'Sarah Healthcare',
                email: 'sarah@hospital.com',
                role: { id: '1', name: 'Recruiter' }
            },
            participants: [
                {
                    userId: '5',
                    eventId: '2',
                    user: {
                        id: '5',
                        name: 'Mike Recruiter',
                        email: 'mike@company.com',
                        role: { id: '1', name: 'Recruiter' }
                    },
                    event: {} as Event
                }
            ],
            _count: { participants: 1 }
        }
    ]);

    const currentUser: User = {
        id: '6',
        name: 'Demo User',
        email: 'demo@example.com',
        role: { id: '2', name: 'Recruiter' } // Change to 'Recruiter' to test recruiter features
    };

    const handleJoinEvent = async (eventId: string) => {
        // Simulate API call
        console.log(`Joining event ${eventId}`);

        // Update local state
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId
                    ? {
                        ...event,
                        participants: [
                            ...event.participants,
                            {
                                userId: currentUser.id,
                                eventId: event.id,
                                user: currentUser,
                                event: event
                            }
                        ],
                        _count: {
                            ...event._count,
                            participants: (event._count?.participants || event.participants.length) + 1
                        }
                    }
                    : event
            )
        );
    };

    const handleCreateEvent = async (eventData: any) => {
        // Simulate API call
        console.log('Creating event:', eventData);

        const newEvent: Event = {
            id: Date.now().toString(),
            name: eventData.name,
            description: eventData.description,
            date: eventData.date ? new Date(eventData.date) : undefined,
            time: eventData.time ? new Date(`2024-01-01T${eventData.time}:00`) : undefined,
            requirements: eventData.requirements,
            status: 'pending',
            maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : undefined,
            industry: eventData.industry,
            level: eventData.level,
            imgUrl: eventData.imgUrl,
            createdBy: currentUser,
            participants: [],
            _count: { participants: 0 }
        };

        try {
            const response = await fetch('http://localhost:8000/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Important for JSON data
                },
                body: JSON.stringify(eventData)
            })

            const data = await response.json()

            setEvents(prevEvents => [...prevEvents, data]);

        } catch (err) {
            console.log(err)
        }

    };

    const handleEditEvent = async (eventId: string, eventData: any) => {
        // Simulate API call
        console.log(`Editing event ${eventId}:`, eventData);

        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId
                    ? {
                        ...event,
                        name: eventData.name,
                        description: eventData.description,
                        date: eventData.date ? new Date(eventData.date) : event.date,
                        time: eventData.time ? new Date(`2024-01-01T${eventData.time}:00`) : event.time,
                        requirements: eventData.requirements,
                        maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : event.maxParticipants,
                        industry: eventData.industry,
                        level: eventData.level,
                        imgUrl: eventData.imgUrl
                    }
                    : event
            )
        );
    };

    return (
        <EventsPage
            currentUser={currentUser}
            events={events}
            onJoinEvent={handleJoinEvent}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
        />
    );
};

export default EventsListPage;
