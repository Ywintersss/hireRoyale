import React, { useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Avatar,
    Badge,
    Chip,
    Divider,
    Card,
    CardBody,
    Link,
} from "@heroui/react";
import {
    Building,
    MapPin,
    Star,
    Mail,
    Phone,
    Clock,
    Calendar,
    Users,
    MessageCircle,
    Video,
    Globe,
    Award,
    Briefcase,
    User
} from 'lucide-react';

// Import your existing UserSchema type
import { JobRequirementData, User as UserSchema } from '../../types/types';

interface RecruiterProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    recruiter: UserSchema;
    jobData: JobRequirementData
    onConnect?: () => void;
    onStartCall?: () => void;
    hasConnection?: boolean;
    hasPendingRequest?: boolean;
}

const RecruiterProfileModal: React.FC<RecruiterProfileModalProps> = ({
    isOpen,
    onClose,
    recruiter,
    jobData,
}) => {
    let skills: string[] = [];
    if (recruiter.skills) {
        try {
            skills = typeof recruiter.skills === 'string'
                ? JSON.parse(recruiter.skills)
                : Array.isArray(recruiter.skills)
                    ? recruiter.skills
                    : [];
        } catch (error) {
            // If parsing fails, treat as empty array
            skills = [];
        }
    }

    let requirements: string[] = []
    if (jobData.requiredSkills) {
        requirements = jobData.requiredSkills.split(',')
    }

    // Format last active time
    const formatLastActive = (date?: Date) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-white",
                header: "border-b border-gray-200",
                footer: "border-t border-gray-200"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 pb-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <Badge
                                content=""
                                color={recruiter.isOnline ? "success" : "default"}
                                shape="circle"
                                placement="bottom-right"
                            >
                                <Avatar
                                    src={recruiter.image as string}
                                    size="lg"
                                    name={recruiter.name}
                                    className="ring-2 ring-brand-blue/20"
                                />
                            </Badge>
                            <div>
                                <h2 className="text-2xl font-bold text-brand-blue">{recruiter.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4 text-brand-teal" />
                                    <span className="text-brand-teal font-medium">{recruiter.position}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-brand-orange fill-current" />
                                <span className="font-semibold text-brand-orange">{recruiter.rating || 0}</span>
                                <span className="text-sm text-gray-500">/5.0</span>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${recruiter.isOnline
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {recruiter.isOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-4">
                    <div className="space-y-6">
                        {/* Company & Basic Info */}
                        <Card className="bg-gradient-to-r from-[#EEF2FF] to-[#F0F9FF] border-none">
                            <CardBody className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-brand-blue" />
                                            <span className="font-medium text-brand-blue">Company</span>
                                        </div>
                                        <p className="text-gray-700 ml-6">{recruiter.company || 'Not specified'}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-brand-teal" />
                                            <span className="font-medium text-brand-teal">Industry</span>
                                        </div>
                                        <p className="text-gray-700 ml-6">{recruiter.industry || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Biography */}
                        {/* {recruiter.bio && ( */}
                        {/*     <div> */}
                        {/*         <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2"> */}
                        {/*             <User className="h-5 w-5" /> */}
                        {/*             About */}
                        {/*         </h3> */}
                        {/*         <Card> */}
                        {/*             <CardBody className="p-4"> */}
                        {/*                 <p className="text-gray-700 leading-relaxed">{recruiter.bio}</p> */}
                        {/*             </CardBody> */}
                        {/*         </Card> */}
                        {/*     </div> */}
                        {/* )} */}

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </h3>
                            <Card>
                                <CardBody className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-brand-teal" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <Link
                                                    href={`mailto:${recruiter.email}`}
                                                    className="text-brand-teal hover:underline"
                                                >
                                                    {recruiter.email}
                                                </Link>
                                            </div>
                                        </div>
                                        {recruiter.contact && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-brand-teal" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <Link
                                                        href={`tel:${recruiter.contact}`}
                                                        className="text-brand-teal hover:underline"
                                                    >
                                                        {recruiter.contact}
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                        {recruiter.location && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-brand-teal" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                    <p className="text-gray-700">{recruiter.location}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-brand-teal" />
                                            <div>
                                                <p className="text-sm text-gray-500">Last Active</p>
                                                <p className="text-gray-700">{formatLastActive(recruiter.lastActive)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Skills/Specializations */}
                        {skills.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Specializations
                                </h3>
                                <Card>
                                    <CardBody className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill: string, index: number) => (
                                                <Chip
                                                    key={index}
                                                    size="sm"
                                                    className="bg-[#F0F9FF] text-brand-teal hover:bg-[#E0F7FA] transition-colors"
                                                >
                                                    {skill}
                                                </Chip>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        )}

                        {/* Job Requirements Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Currently Looking For
                            </h3>
                            <Card className="border border-brand-teal/20">
                                <CardBody className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {requirements.map((req) =>
                                                <Chip size="sm" className="bg-[#F0F9FF] text-brand-teal">{req}</Chip>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {jobData.description}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-brand-blue mb-3 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Account Information
                            </h3>
                            <Card>
                                <CardBody className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Member Since</p>
                                            <p className="text-gray-700 font-medium">
                                                {new Date(recruiter.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Profile Verified</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${recruiter.emailVerified ? 'bg-green-500' : 'bg-red-500'
                                                    }`} />
                                                <p className={`font-medium ${recruiter.emailVerified ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                    {recruiter.emailVerified ? 'Verified' : 'Unverified'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter className="pt-4">
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="bordered"
                            onPress={onClose}
                            className="border-gray-300 text-gray-600"
                        >
                            Close
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RecruiterProfileModal;
