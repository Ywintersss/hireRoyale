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

    const updateMutation = useMutation({
        mutationFn: async ({ eventId, eventData }: { eventId: string, eventData: EventRegistration }) => {
            return fetch(`http://localhost:8000/events/update/${eventId}`, {
                method: 'PUT',
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

    const deleteMutation = useMutation({
        mutationFn: async (eventId: string) => {
            return fetch(`http://localhost:8000/events/delete/${eventId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
        },
        onSuccess: () => {
            //Refetch
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    })

    const leaveMutation = useMutation({
        mutationFn: async (eventId: string) => {
            return fetch(`http://localhost:8000/events/leave/${eventId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
        },
        onSuccess: () => {
            //Refetch
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    })

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

    const handleEditEvent = async (eventId: string, eventData: EventRegistration) => {
        // Simulate API call
        console.log(`Editing event ${eventId}:`, eventData);

        updateMutation.mutate({ eventId: eventId, eventData: eventData })
    };

    const handleDeleteEvent = async (eventId: string) => {
        console.log(`Deleting event ${eventId}`)

        deleteMutation.mutate(eventId)
    }

    const handleLeaveEvent = async (eventId: string) => {
        console.log(`Leaving event ${eventId}`)

        leaveMutation.mutate(eventId)
    }

    return (
        <>
            {!isLoading &&
                <EventsPage
                    currentUser={currentUser?.user}
                    events={events.events}
                    onJoinEvent={handleJoinEvent}
                    onCreateEvent={handleCreateEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onLeaveEvent={handleLeaveEvent}
                />
            }
        </>
    );
};

export default EventsListPage;
