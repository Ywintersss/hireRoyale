'use client'
import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { Event, EventRegistration } from '../../../types/types';
import EventsPage from '@/components/EventsPage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const EventsListPage = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: currentUser, error, isPending } = authClient.useSession();

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'], queryFn: async () => {
            const response = await fetch('http://localhost:8000/events/all')
            return response.json()
        }
    })

    const createMutation = useMutation({
        mutationFn: async (eventData: EventRegistration) => {
            return fetch('http://localhost:8000/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData),
                credentials: 'include'
            })

        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
        }
    })

    const joinMutation = useMutation({
        mutationFn: async (eventData: { eventId: string }) => {
            return fetch('http://localhost:8000/events/join', {
                method: 'POST',
                body: JSON.stringify(eventData),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
        },
        onSuccess: () => {
            //Refetch
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    })

    console.log(events)

    const handleJoinEvent = async (eventId: string) => {
        if (!currentUser?.user) {
            router.push('/auth/login')
            return;
        }

        console.log(`Joining event ${eventId}`);
        joinMutation.mutate({ eventId: eventId })
    };

    const handleCreateEvent = async (eventData: any) => {
        if (!currentUser?.user) {
            router.push('/auth/login')
            return;
        }

        console.log('Creating event:', eventData);

        const newEvent: EventRegistration = {
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
            participants: [],
            _count: { participants: 0 }
        };

        try {
            createMutation.mutate(newEvent)
            // setEvents(prevEvents => [...prevEvents, data]);

        } catch (err) {
            console.log(err)
        }

    };

    const handleEditEvent = async (eventId: string, eventData: any) => {
        // Simulate API call
        console.log(`Editing event ${eventId}:`, eventData);

        // setEvents(prevEvents =>
        //     prevEvents.map(event =>
        //         event.id === eventId
        //             ? {
        //                 ...event,
        //                 name: eventData.name,
        //                 description: eventData.description,
        //                 date: eventData.date ? new Date(eventData.date) : event.date,
        //                 time: eventData.time ? new Date(`2024-01-01T${eventData.time}:00`) : event.time,
        //                 requirements: eventData.requirements,
        //                 maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : event.maxParticipants,
        //                 industry: eventData.industry,
        //                 level: eventData.level,
        //                 imgUrl: eventData.imgUrl
        //             }
        //             : event
        //     )
        // );
    };

    return (
        <>
            {!isLoading &&
                <EventsPage
                    currentUser={currentUser?.user}
                    events={events.events}
                    onJoinEvent={handleJoinEvent}
                    onCreateEvent={handleCreateEvent}
                    onEditEvent={handleEditEvent}
                />
            }
        </>
    );
};

export default EventsListPage;
