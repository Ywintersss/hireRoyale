'use client'
import React, { useState } from 'react';
import {
    Button,
    Avatar,
    Divider,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import {
    Home,
    Calendar,
    Users,
    Settings,
    Bell,
    FileText,
    BarChart3,
    HelpCircle,
    LogOut,
    User,
    ChevronLeft,
    Menu,
    ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    currentPath?: string;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    color?: 'primary' | 'secondary' | 'default';
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onToggle,
    currentPath = '/',
    user = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: undefined
    }
}) => {
    const router = useRouter()
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const mainNavItems: NavItem[] = [
        {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-5 w-5" />,
            href: '/',
            color: 'primary'
        },
        {
            id: 'events',
            label: 'Events',
            icon: <Calendar className="h-5 w-5" />,
            href: '/events',
            badge: 3,
            color: 'secondary'
        },
        {
            id: 'community',
            label: 'Community',
            icon: <Users className="h-5 w-5" />,
            href: '/community'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-5 w-5" />,
            href: '/analytics'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="h-5 w-5" />,
            href: '/notifications',
            badge: 12
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: <FileText className="h-5 w-5" />,
            href: '/documents'
        },
    ];

    const bottomNavItems: NavItem[] = [
        {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-5 w-5" />,
            href: '/settings'
        },
        {
            id: 'help',
            label: 'Help & Support',
            icon: <HelpCircle className="h-5 w-5" />,
            href: '/help'
        },
    ];

    const handleLogout = async () => {
        // Replace with your Better Auth logout logic
        console.log('Logout clicked');
        // Example: await authClient.signOut({ ... });
    };

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    const isActiveItem = (href: string) => {
        return currentPath === href || (href !== '/' && currentPath.startsWith(href));
    };

    const getItemStyles = (item: NavItem, isActive: boolean) => {
        if (isActive) {
            return {
                backgroundColor: '#0EA5E9',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: '600'
            };
        }

        if (hoveredItem === item.id) {
            return {
                backgroundColor: '#F0F9FF',
                color: '#0EA5E9',
                borderRadius: '8px'
            };
        }

        return {
            color: '#374151',
            borderRadius: '8px'
        };
    };

    const getBadgeColor = (color?: string) => {
        switch (color) {
            case 'primary':
                return { backgroundColor: '#0EA5E9', color: '#ffffff' };
            case 'secondary':
                return { backgroundColor: '#F97316', color: '#ffffff' };
            default:
                return { backgroundColor: '#1E3A8A', color: '#ffffff' };
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-64' : 'w-16'}
                    ${isOpen ? 'translate-x-0' : '-translate-x-0'}
                    lg:relative lg:translate-x-0
                    border-r-2
                `}
                style={{ borderRightColor: '#1E3A8A' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2" style={{ borderBottomColor: '#1E3A8A' }}>
                    {isOpen && (
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: '#1E3A8A' }}
                            >
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <h1 className="text-xl font-bold" style={{ color: '#1E3A8A' }}>
                                Platform
                            </h1>
                        </div>
                    )}
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={onToggle}
                        className="hover:bg-gray-100"
                    >
                        {isOpen ? (
                            <ChevronLeft className="h-5 w-5" style={{ color: '#1E3A8A' }} />
                        ) : (
                            <Menu className="h-5 w-5" style={{ color: '#1E3A8A' }} />
                        )}
                    </Button>
                </div>

                {/* User Profile Section */}
                {isOpen && (
                    <div className="p-4 border-b border-gray-200">
                        <Dropdown>
                            <DropdownTrigger>
                                <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Avatar
                                        src={user.avatar}
                                        name={user.name}
                                        size="md"
                                        className="flex-shrink-0"
                                        style={{
                                            backgroundColor: '#0EA5E9'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key="profile"
                                    startContent={<User className="h-4 w-4" />}
                                    onPress={() => handleNavigation('/profile')}
                                >
                                    View Profile
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    startContent={<Settings className="h-4 w-4" />}
                                    onPress={() => handleNavigation('/settings')}
                                >
                                    Account Settings
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    startContent={<LogOut className="h-4 w-4" />}
                                    color="danger"
                                    onPress={handleLogout}
                                >
                                    Sign Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto">
                    {/* Main Navigation */}
                    <nav className="p-3 space-y-1">
                        {isOpen && (
                            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Main Menu
                            </p>
                        )}
                        {mainNavItems.map((item) => {
                            const isActive = isActiveItem(item.href);
                            return (
                                <div
                                    key={item.id}
                                    className="relative flex justify-center items-center px-3 py-2 cursor-pointer transition-all duration-200"
                                    style={getItemStyles(item, isActive)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={() => handleNavigation(item.href)}
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        {item.icon}
                                        {isOpen && (
                                            <span className="text-sm font-medium">
                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                    {isOpen && item.badge && (
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            style={getBadgeColor(item.color)}
                                            className="text-xs"
                                        >
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </Chip>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <Divider className="my-4" />

                    {/* Bottom Navigation */}
                    <nav className="p-3 space-y-1">
                        {isOpen && (
                            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Account
                            </p>
                        )}
                        {bottomNavItems.map((item) => {
                            const isActive = isActiveItem(item.href);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center px-3 py-2 cursor-pointer transition-all duration-200"
                                    style={getItemStyles(item, isActive)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={() => handleNavigation(item.href)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {item.icon}
                                        {isOpen && (
                                            <span className="text-sm font-medium">
                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Logout Button */}
                        {isOpen && (
                            <Button
                                variant="light"
                                startContent={<LogOut className="h-4 w-4" />}
                                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                onPress={handleLogout}
                            >
                                Sign Out
                            </Button>
                        )}
                    </nav>
                </div>

                {/* Footer */}
                {isOpen && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2">
                            <Chip
                                size="sm"
                                variant="flat"
                                style={{ backgroundColor: '#EEF2FF', color: '#1E3A8A' }}
                            >
                                Pro Plan
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                style={{ backgroundColor: '#F0F9FF', color: '#0EA5E9' }}
                            >
                                v2.1.0
                            </Chip>
                        </div>
                    </div>
                )}

                {/* Collapsed User Avatar */}
                {!isOpen && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Avatar
                                    src={user.avatar}
                                    name={user.name}
                                    size="sm"
                                    className="cursor-pointer"
                                    style={{
                                        backgroundColor: '#0EA5E9'
                                    }}
                                />
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key="profile"
                                    startContent={<User className="h-4 w-4" />}
                                    onPress={() => handleNavigation('/profile')}
                                >
                                    View Profile
                                </DropdownItem>
                                <DropdownItem
                                    key="settings"
                                    startContent={<Settings className="h-4 w-4" />}
                                    onPress={() => handleNavigation('/settings')}
                                >
                                    Account Settings
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    startContent={<LogOut className="h-4 w-4" />}
                                    color="danger"
                                    onPress={handleLogout}
                                >
                                    Sign Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}
            </div>
        </>
    );
};

// Example usage component
const SidebarDemo = () => {

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Main Content Area */}
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6" style={{ color: '#1E3A8A' }}>
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Welcome to your dashboard. Use the sidebar to navigate between different sections.
                    </p>

                    {/* Demo Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="bg-white rounded-lg p-6 shadow-md border-l-4"
                                style={{ borderLeftColor: item % 3 === 0 ? '#F97316' : item % 2 === 0 ? '#0EA5E9' : '#1E3A8A' }}
                            >
                                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3A8A' }}>
                                    Card Title {item}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    This is a sample card to demonstrate the layout with the sidebar.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
