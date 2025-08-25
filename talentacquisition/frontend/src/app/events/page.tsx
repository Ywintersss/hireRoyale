'use client'
import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { Event } from '../../../types/types';
import EventsPage from '@/components/EventsPage';

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

    const router = useRouter()
    const { data: currentUser, error, isPending } = authClient.useSession();

    const handleJoinEvent = async (eventId: string) => {
        // Simulate API call
        console.log(`Joining event ${eventId}`);

        // Update local state
        // setEvents(prevEvents =>
        //     prevEvents.map(event =>
        //         event.id === eventId
        //             ? {
        //                 ...event,
        //                 participants: [
        //                     ...event.participants,
        //                     {
        //                         userId: currentUser.user.id,
        //                         eventId: event.id,
        //                         user: currentUser.user,
        //                         event: event
        //                     }
        //                 ],
        //                 _count: {
        //                     ...event._count,
        //                     participants: (event._count?.participants || event.participants.length) + 1
        //                 }
        //             }
        //             : event
        //     )
        // );
    };

    const handleCreateEvent = async (eventData: any) => {
        if (!currentUser?.user) {
            router.push('/auth/login')
            return;
        }

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
            createdBy: currentUser.user.id,
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
