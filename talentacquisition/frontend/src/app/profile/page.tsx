'use client'
import React, { useEffect, useState } from 'react';
import { upload } from '../../../../backend/src/middleware/uploads';
import { updateResume } from '../../../../backend/src/controllers/ProfileController';
import {
    Button,
    Input,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Textarea,
    Chip,
    Avatar,
    Progress,
    Badge,
} from "@heroui/react";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    Upload, 
    FileText, 
    Edit3,
    Calendar,
    Globe,
    Linkedin,
    Github,
    Award,
    GraduationCap,
    Save,
    X,
    CheckCircle
} from 'lucide-react';
import { normalizeCommaSeparated, normalizeNulls } from '@/lib/utils';

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+60 12-345 6789',
        location: 'Kuala Lumpur, Malaysia',
        title: 'Senior Full Stack Developer',
        bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
        experience: '5+ years',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'Python']
    });

    const [editData, setEditData] = useState(profileData);

    const getUserProfile = () => {
        fetch('http://localhost:8000/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Profile data:', data);

            const normalizedData = normalizeNulls(data);

            const [firstName, ...lastParts] = normalizedData.name.split(" ");
            const lastName = lastParts.length > 0 ? lastParts.join(" ") : "";

            const skills = normalizedData.skills.split(",")

            const profile = {
                ...normalizedData,
                firstName,
                lastName,
                skills
            };

            setProfileData(profile);
            setEditData(profile);

            if (data.resume) {
                setResumeUploaded(true);
                getResume(data.resume.resumeUrl);
            }
        })
        .catch(error => console.error('Error fetching profile data:', error));
    };

    const getResume = (resumeUrl: string) => {
        fetch(`http://localhost:8000/resume/${resumeUrl}`)
        .then(response => response.blob())
        .then(blob => {
            console.log('Resume data:', blob);
            const newFile = new File([blob], resumeUrl, { type: blob.type });

            setResumeFile(newFile);
        })
        .catch(error => console.error('Error fetching resume data:', error));
    }

    const updateUserProfile = () => {
        fetch('http://localhost:8000/profile/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(editData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Profile updated:', data);
            getUserProfile();
        })
        .catch(error => console.error('Error updating profile:', error));
    }

    const uploadResume = (formData: FormData) => {
        fetch('http://localhost:8000/profile/upload-resume', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resume uploaded:', data.user.resume);
            getUserProfile();
        })
        .catch(error => console.error('Error updating resume:', error));
    }

    const updateResume = (formData: FormData) => {
        fetch('http://localhost:8000/profile/update-resume', {
            method: 'PUT',
            credentials: 'include',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resume updated:', data);
            getUserProfile();
        })
        .catch(error => console.error('Error updating resume:', error));
    }

    useEffect(() => {
        getUserProfile();
    }, []);

    const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only');
        }

        setResumeFile(file);

        const formData = new FormData();
        formData.append("resume", file);
        
        if (!resumeUploaded) {
            uploadResume(formData);
        } else {
            updateResume(formData);
        }
    };

    

    const handleEdit = () => {
        setIsEditing(true);
        setEditData(profileData);
    };

    const handleSave = () => {
        setProfileData(editData);
        setIsEditing(false);
        updateUserProfile();
    };

    const handleCancel = () => {
        setEditData(profileData);
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const profileCompleteness = () => {
        const fields = Object.values(profileData).filter((value) => {
            if (typeof value === "string") {
                return value.trim() !== "";
            }
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== null && value !== undefined;
        });

        return Math.round((fields.length / Object.keys(profileData).length) * 100);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Account for sidebar - left padding */}
            <div className="pl-64 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-deep-blue)' }}>
                                My Profile
                            </h1>
                            <p className="text-secondary mt-1">
                                Manage your profile information and resume
                            </p>
                        </div>
                        <Button
                            onClick={isEditing ? handleSave : handleEdit}
                            className={isEditing ? "bg-brand-teal text-white" : "border-brand-blue text-brand-blue"}
                            variant={isEditing ? "solid" : "bordered"}
                            startContent={isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                        {isEditing && (
                            <Button
                                onClick={handleCancel}
                                variant="bordered"
                                className="ml-2 border-gray-300 text-gray-600"
                                startContent={<X className="h-4 w-4" />}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>

                    {/* Profile Completeness */}
                    <Card className="bg-white border-gray-200 shadow-sm">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium" style={{ color: 'var(--brand-deep-blue)' }}>
                                            Profile Completeness
                                        </span>
                                        <span className="text-sm text-secondary">
                                            {profileCompleteness()}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={profileCompleteness()} 
                                        className="h-2"
                                        classNames={{
                                            indicator: "bg-brand-teal"
                                        }}
                                    />
                                </div>
                                <Badge content={resumeUploaded ? "✓" : "!"} color={resumeUploaded ? "success" : "warning"}>
                                    <Avatar
                                        size="lg"
                                        src="/api/placeholder/80/80"
                                        fallback={
                                            <User className="h-8 w-8" style={{ color: 'var(--brand-deep-blue)' }} />
                                        }
                                        className="border-2 border-brand-teal"
                                    />
                                </Badge>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xl font-semibold section-header">
                                        Basic Information
                                    </h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            value={isEditing ? editData.firstName : profileData?.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            isReadOnly={!isEditing}
                                            startContent={<User className="h-4 w-4 text-brand-blue" />}
                                            classNames={{
                                                label: 'text-brand-blue font-medium',
                                                input: 'text-gray-900',
                                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                            }}
                                        />
                                        <Input
                                            label="Last Name"
                                            value={isEditing ? editData.lastName : profileData?.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            isReadOnly={!isEditing}
                                            classNames={{
                                                label: 'text-brand-blue font-medium',
                                                input: 'text-gray-900',
                                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                            }}
                                        />
                                    </div>
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        value={isEditing ? editData.email : profileData?.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        isReadOnly={!isEditing}
                                        startContent={<Mail className="h-4 w-4 text-brand-blue" />}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            input: 'text-gray-900',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                        }}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Phone Number"
                                            value={isEditing ? editData.phone : profileData?.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            isReadOnly={!isEditing}
                                            startContent={<Phone className="h-4 w-4 text-brand-blue" />}
                                            classNames={{
                                                label: 'text-brand-blue font-medium',
                                                input: 'text-gray-900',
                                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                            }}
                                        />
                                        <Input
                                            label="Location"
                                            value={isEditing ? editData.location : profileData?.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            isReadOnly={!isEditing}
                                            startContent={<MapPin className="h-4 w-4 text-brand-blue" />}
                                            classNames={{
                                                label: 'text-brand-blue font-medium',
                                                input: 'text-gray-900',
                                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                            }}
                                        />
                                    </div>
                                    <Input
                                        label="Professional Title"
                                        value={isEditing ? editData.title : profileData?.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        isReadOnly={!isEditing}
                                        startContent={<Briefcase className="h-4 w-4 text-brand-blue" />}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            input: 'text-gray-900',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                        }}
                                    />
                                </CardBody>
                            </Card>

                            {/* Professional Summary */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xl font-semibold section-header">
                                        Professional Summary
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <Textarea
                                        label="Bio"
                                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                        value={isEditing ? editData.bio : profileData?.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        isReadOnly={!isEditing}
                                        minRows={4}
                                        classNames={{
                                            label: 'text-brand-blue font-medium',
                                            input: 'text-gray-900',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                        }}
                                    />
                                </CardBody>
                            </Card>

                            {/* Skills */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xl font-semibold section-header">
                                        Skills & Expertise
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-wrap gap-2">
                                        {profileData?.skills?.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                variant="flat"
                                                className="bg-[#F0F9FF] text-brand-teal"
                                            >
                                                {skill}
                                            </Chip>
                                        ))}
                                    </div>
                                    {isEditing && (
                                        <div className="mt-4">
                                            <Input
                                                label="Add Skills"
                                                placeholder="Type skills separated by commas..."
                                                classNames={{
                                                    label: 'text-brand-blue font-medium',
                                                    input: 'text-gray-900',
                                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                                }}
                                                onChange={(e) => handleInputChange('skills', normalizeCommaSeparated(e.target.value))}
                                            />
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Sidebar Content */}
                        <div className="space-y-6">
                            {/* Resume Upload */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-lg font-semibold section-header">
                                        Resume
                                    </h3>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    {resumeUploaded ? (
                                        <div className="text-center space-y-3">
                                            <div className="mx-auto w-16 h-16 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-8 w-8 text-brand-teal" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-brand-blue">Resume Uploaded</p>
                                                <p className="text-sm text-secondary">
                                                    {resumeFile?.name || 'resume.pdf'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="bordered"
                                                size="sm"
                                                className="border-brand-teal text-brand-teal"
                                                startContent={<FileText className="h-4 w-4" />}
                                                as="a"
                                                href={resumeFile?.name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Resume
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <div className="mx-auto w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                                                <Upload className="h-8 w-8 text-brand-blue" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-brand-blue">Upload Your Resume</p>
                                                <p className="text-sm text-secondary">
                                                    PDF format recommended
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        className="hidden"
                                        id="resume-upload"
                                    />
                                    <label htmlFor="resume-upload">
                                        <Button
                                            as="span"
                                            className="w-full bg-brand-teal text-white"
                                            startContent={<Upload className="h-4 w-4" />}
                                        >
                                            {resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
                                        </Button>
                                    </label>
                                </CardBody>
                            </Card>

                            {/* Social Links */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-lg font-semibold section-header">
                                        Professional Links
                                    </h3>
                                </CardHeader>
                                <CardBody className="space-y-3">
                                    <Input
                                        label="Website"
                                        value={isEditing ? editData.website : profileData?.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        isReadOnly={!isEditing}
                                        startContent={<Globe className="h-4 w-4 text-brand-blue" />}
                                        classNames={{
                                            label: 'text-brand-blue font-medium text-sm',
                                            input: 'text-gray-900 text-sm',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal h-10',
                                        }}
                                    />
                                    <Input
                                        label="Linkedin"
                                        value={isEditing ? editData.linkedin : profileData?.linkedin}
                                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                        isReadOnly={!isEditing}
                                        startContent={<Linkedin className="h-4 w-4 text-brand-blue" />}
                                        classNames={{
                                            label: 'text-brand-blue font-medium text-sm',
                                            input: 'text-gray-900 text-sm',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal h-10',
                                        }}
                                    />
                                    <Input
                                        label="GitHub"
                                        value={isEditing ? editData.github : profileData?.github}
                                        onChange={(e) => handleInputChange('github', e.target.value)}
                                        isReadOnly={!isEditing}
                                        startContent={<Github className="h-4 w-4 text-brand-blue" />}
                                        classNames={{
                                            label: 'text-brand-blue font-medium text-sm',
                                            input: 'text-gray-900 text-sm',
                                            inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal h-10',
                                        }}
                                    />
                                </CardBody>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <h3 className="text-lg font-semibold section-header">
                                        Quick Stats
                                    </h3>
                                </CardHeader>
                                <CardBody className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-brand-blue" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-brand-blue">Experience</p>
                                            <p className="text-sm text-secondary">{profileData?.experience}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                                            <Award className="h-5 w-5 text-brand-teal" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-brand-teal">Skills</p>
                                            <p className="text-sm text-secondary">{profileData?.skills?.length} skills listed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#FFF7ED] rounded-full flex items-center justify-center">
                                            <GraduationCap className="h-5 w-5 text-brand-orange" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-brand-orange">Profile</p>
                                            <p className="text-sm text-secondary">{profileCompleteness()}% complete</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;