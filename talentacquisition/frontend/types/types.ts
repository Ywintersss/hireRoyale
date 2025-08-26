export interface RegistrationFormSchema {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    agreeToTerms: boolean,
    subscribeNewsletter: boolean
    role: 'user' | 'recruiter';
}

export interface RegistrationErrorSchema {
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    password?: string,
    confirmPassword?: string,
    country?: string,
    agreeToTerms?: string,
    subscribeNewsletter?: string
    role?: string;
}


// Types based on your Prisma schema
export interface User { id: string; email: string; emailVerified: boolean; name: string; createdAt: Date; updatedAt: Date; image?: string | null | undefined; }

export interface Role {
    id: string;
    name: string;
}

export interface Event {
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

export interface UserEvent {
    userId: string;
    eventId: string;
    user: User;
    event: Event;
}

export interface EventsPageProps {
    currentUser: any;
    events: Event[];
    onJoinEvent: (eventId: string) => Promise<void>;
    onCreateEvent: (eventData: any) => Promise<void>;
    onEditEvent: (eventId: string, eventData: any) => Promise<void>;
}

export interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    currentPath?: string;
    user?: User;
}

export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    color?: 'primary' | 'secondary' | 'default';
}
