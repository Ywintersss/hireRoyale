'use client'

import { HeroUIProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import React, { useEffect } from 'react'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        try {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'demo-key', {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                capture_pageview: true,
                capture_pageleave: true,
            })
        } catch {}
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <HeroUIProvider>
                {children}
            </HeroUIProvider>
        </QueryClientProvider>
    )
}
