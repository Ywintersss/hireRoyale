export interface RegistrationFormSchema {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    company: string,
    agreeToTerms: boolean,
    subscribeNewsletter: boolean,
    role: 'user' | 'recruiter'
}

export interface RegistrationErrorSchema {
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    password?: string,
    confirmPassword?: string,
    company?: string,
    agreeToTerms?: string,
    subscribeNewsletter?: string,
    role?: string,
    general?: string
}

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    contact: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
    location?: string;
    experience?: string;
    skills?: string[];
    company?: string;
    position?: string;
    industry?: string;
    rating?: number;
    role: Role
    isOnline?: boolean
}

export interface Role {
    id: string;
    name: string;
}

export interface EventRegistration {
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
    participants: UserEvent[];
    _count?: {
        participants: number;
    };
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
    onDeleteEvent: (eventId: string) => Promise<void>;
    onLeaveEvent: (eventId: string) => Promise<void>
    onCreateJobRequirement: (eventId: string, data: JobRequirementRegistrationData) => Promise<void>
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
    description?: string;
}

export interface JobRequirementData {
    id: string,
    title: string;
    description: string;
    experienceLevel: string;
    requiredSkills: string;
    location: string;
    employmentType: string;
    salaryRange: string;
    department: string;
    isRemoteOk: boolean;
    userId: string;
    eventId: string;
}


export interface JobRequirementRegistrationData {
    title: string;
    description: string;
    experienceLevel: string;
    requiredSkills: string[];
    location: string;
    employmentType: string;
    salaryRange: string;
    department: string;
    isRemoteOk: boolean;
}
