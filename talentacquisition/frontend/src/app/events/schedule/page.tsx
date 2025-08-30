'use client'
import React from 'react'
import { Card, CardBody, Button, Chip } from '@heroui/react'
import { Calendar, Clock, Users, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'

const mockSessions = [
    { id: 'sess-1', name: 'Tech Talent Live (Frontend)', date: 'Friday', time: '19:00–21:00', capacity: 50 },
    { id: 'sess-2', name: 'Data & AI Hiring Hour', date: 'Saturday', time: '10:00–12:00', capacity: 40 },
    { id: 'sess-3', name: 'Backend & DevOps Sprint', date: 'Sunday', time: '14:00–16:00', capacity: 40 },
]

export default function SchedulePage() {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#0EA5E9] to-[#F97316] p-6">
            <div className="max-w-5xl mx-auto">
                <Card className="bg-white/95 backdrop-blur">
                    <CardBody>
                        <h1 className="text-2xl font-bold text-brand-blue mb-4">Weekly Live Sessions</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {mockSessions.map((s) => (
                                <Card key={s.id}>
                                    <CardBody className="space-y-2">
                                        <div className="font-semibold text-brand-blue">{s.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" /> {s.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" /> {s.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="h-4 w-4" /> Capacity: {s.capacity}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="bg-brand-teal text-white" onPress={() => router.push('/events')}>
                                                Explore Events
                                            </Button>
                                            <Button variant="bordered" startContent={<Video className="h-4 w-4" />} onPress={() => router.push('/events')}>
                                                Join Lobby
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}



