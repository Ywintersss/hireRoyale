'use client'
import { Inter } from 'next/font/google'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

const inter = Inter({ subsets: ['latin'] })

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = usePathname()
    const { data: session, error } = authClient.useSession()
    console.log(session)
    return (
        <html lang="en">
            <body
                className={`${inter.className} antialiased`}
            >
                <Providers>
                    {(currentPath !== '/auth/login' && currentPath !== '/auth/register') ?
                        <div className='flex w-full min-h-screen bg-gray-50'>
                            <Sidebar
                                isOpen={sidebarOpen}
                                onToggle={() => setSidebarOpen(!sidebarOpen)}
                                currentPath={currentPath}
                                user={session?.user} />
                            {children}
                        </div> :
                        <div>
                            {children}
                        </div>
                    }
                </Providers>
            </body>
        </html>
    );
}
