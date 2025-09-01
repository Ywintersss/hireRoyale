'use client'
import { authClient } from '@/lib/auth-client';
import { normalizeCommaSeparated, normalizeNulls } from '@/lib/utils';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Input,
    Progress,
    Select,
    SelectItem,
    Textarea
} from "@heroui/react";
import {
    Award,
    Briefcase,
    Building,
    Calendar,
    CheckCircle,
    Edit3,
    FileText,
    Github,
    Globe,
    GraduationCap,
    Linkedin,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
    Upload,
    User,
    X
} from 'lucide-react';
import { WorkerMessageHandler } from "pdfjs-dist/build/pdf.worker.min.mjs";
import React, { useEffect, useState } from 'react';
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [isProcessingResume, setIsProcessingResume] = useState(false);
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

    const { data: currentUser, error, isPending } = authClient.useSession();
    const isRecruiter = currentUser?.user?.role?.name === 'Recruiter'
    const [editData, setEditData] = useState(profileData);

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // PDF parsing function - dynamically import pdfjs to avoid SSR issues
    const parsePDF = async (file: File): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const fileReader = new FileReader();

                fileReader.onload = async function () {
                    try {
                        const typedarray = new Uint8Array(this.result as ArrayBuffer);

                        // Use pdfjs directly (same as react-pdf uses internally)
                        const loadingTask = pdfjs.getDocument({
                            data: typedarray,
                            verbosity: 0,
                        });

                        const pdf = await loadingTask.promise;
                        let fullText = '';

                        // Extract text from each page
                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items
                                .map((item: any) => item.str)
                                .join(' ');
                            fullText += pageText + '\n';
                        }

                        resolve(fullText);
                    } catch (error) {
                        console.error('PDF parsing error:', error);
                        reject(new Error(`Failed to parse PDF: ${error.message}`));
                    }
                };

                fileReader.onerror = () => reject(new Error('Failed to read PDF file'));
                fileReader.readAsArrayBuffer(file);
            } catch (error) {
                console.error('PDF setup error:', error);
                reject(new Error('Failed to set up PDF parser: ' + error.message));
            }
        });
    };

    // Enhanced Gemini parsing with better prompt
    const parseResume = async (resumeText: string) => {
        const prompt = `
        Extract structured profile information from this resume text and return it as a JSON object with the following structure:

        {
            "firstName": "string",
            "lastName": "string", 
            "email": "string",
            "phone": "string",
            "location": "string (city, state/country)",
            "title": "string (current or desired job title)",
            "bio": "string (professional summary, 2-3 sentences)",
            "experience": "string (e.g., '5+ years', '2-3 years', 'Entry level')",
            "website": "string (personal website URL if available)",
            "linkedin": "string (LinkedIn profile URL if available)", 
            "github": "string (GitHub profile URL if available)",
            "skills": ["array of technical skills as strings"]
        }

        Resume text:
        ${resumeText}

        Important: 
        - Return only valid JSON, no additional text or formatting
        - If information is not available, use empty string "" for strings and empty array [] for skills
        - Extract skills as an array of individual skill strings
        - For experience, estimate based on work history if exact years not stated
        - Make the bio a concise professional summary based on the resume content
        `;

        try {
            const result = await model.generateContent(prompt);
            const output = result.response.text();

            // Clean the output to ensure it's valid JSON
            const cleanOutput = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanOutput);
        } catch (error) {
            console.error('Error parsing resume with Gemini:', error);
            throw new Error('Failed to parse resume content');
        }
    };

    // Process resume: parse PDF + extract data + update profile
    const processResumeAndUpdateProfile = async (file: File) => {
        setIsProcessingResume(true);

        try {
            // Step 1: Parse PDF to text
            console.log('Extracting text from PDF...');
            const resumeText = await parsePDF(file);

            if (!resumeText.trim()) {
                throw new Error('No text could be extracted from the PDF');
            }

            console.log('PDF text extracted successfully');

            // Step 2: Parse with Gemini
            console.log('Parsing resume with Gemini...');
            const extractedData = await parseResume(resumeText);

            console.log('Extracted profile data:', extractedData);

            // Step 3: Merge with existing profile data (keep existing data if extracted is empty)
            const updatedProfileData = {
                ...profileData,
                firstName: extractedData.firstName || profileData.firstName,
                lastName: extractedData.lastName || profileData.lastName,
                email: extractedData.email || profileData.email,
                phone: extractedData.phone || profileData.phone,
                location: extractedData.location || profileData.location,
                title: extractedData.title || profileData.title,
                bio: extractedData.bio || profileData.bio,
                experience: extractedData.experience || profileData.experience,
                website: extractedData.website || profileData.website,
                linkedin: extractedData.linkedin || profileData.linkedin,
                github: extractedData.github || profileData.github,
                skills: extractedData.skills && extractedData.skills.length > 0
                    ? extractedData.skills
                    : profileData.skills
            };

            // Step 4: Update profile data in state and backend
            setProfileData(updatedProfileData);
            setEditData(updatedProfileData);

            // Update profile in backend
            await updateUserProfileData(updatedProfileData);

            console.log('Profile updated successfully with resume data');

        } catch (error) {
            console.error('Error processing resume:', error);
            alert('Error processing resume: ' + error.message);
        } finally {
            setIsProcessingResume(false);
        }
    };

    // Separate function to update profile data
    const updateUserProfileData = async (dataToUpdate = editData) => {
        const updatedData = {
            ...dataToUpdate,
            skills: dataToUpdate.skills.join(',')
        }
        try {
            const response = await fetch('http://localhost:8000/profile/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            console.log('Profile updated:', result);
            return result;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

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

                const normalizedData = normalizeNulls(data);

                const [firstName, ...lastParts] = normalizedData.name.split(" ");
                const lastName = lastParts.length > 0 ? lastParts.join(" ") : "";

                const skills = isRecruiter ? "" : normalizedData.skills.split(",")

                const profile = {
                    ...normalizedData,
                    firstName,
                    lastName,
                    skills
                };

                if (isRecruiter) {
                    profile.company = normalizedData.company
                    profile.industry = normalizedData.industry
                }

                console.log('Profile data:', profile);

                setProfileData(profile);
                setEditData(profile);

                if (data.resume) {
                    setResumeUploaded(true);
                    getResume(data.resume.resumeUrl);
                }
            })
            .catch(error => console.error('Error fetching profile data:', error));
    };


    const handleRemoveSkill = (index: number) => {
        const updatedSkills = [...(profileData?.skills || [])];
        updatedSkills.splice(index, 1);

        setProfileData((prev) => ({
            ...prev,
            skills: updatedSkills,
        }));
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
        console.log('Edit data:', editData);
        updateUserProfileData(editData)
            .then(() => {
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
    }, [isRecruiter]);

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only');
            return;
        }

        setResumeFile(file);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("resume", file);

        try {
            // Process resume in parallel with upload
            const uploadPromise = !resumeUploaded
                ? uploadResume(formData)
                : updateResume(formData);

            // Process PDF and update profile data
            await processResumeAndUpdateProfile(file);

            // Wait for upload to complete
            await uploadPromise;

        } catch (error) {
            console.error('Error handling resume upload:', error);
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
                            isDisabled={isProcessingResume}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                        {isEditing && (
                            <Button
                                onClick={handleCancel}
                                variant="bordered"
                                className="ml-2 border-gray-300 text-gray-600"
                                startContent={<X className="h-4 w-4" />}
                                isDisabled={isProcessingResume}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>

                    {/* Processing Indicator */}
                    {isProcessingResume && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
                                    <div>
                                        <p className="font-medium text-brand-blue">Processing Resume</p>
                                        <p className="text-sm text-blue-600">
                                            Extracting information and updating your profile...
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

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
                                        {isRecruiter ? 'Company Information' : 'Skills & Expertise'}
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-wrap gap-2">
                                        {!isRecruiter ? profileData?.skills?.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                variant="flat"
                                                className="bg-[#F0F9FF] text-brand-teal"
                                            >
                                                <span className='flex items-center'>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSkill(index)}
                                                            className="flex items-center mr-2 cursor-pointer text-red-500 hover:text-red-700 focus:outline-none"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {skill}
                                                </span>
                                            </Chip>
                                        ))
                                            :
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                <Input
                                                    label="Currently Working At"
                                                    value={isEditing ? editData?.company : profileData?.company}
                                                    onChange={(e) => handleInputChange('company', e.target.value)}
                                                    startContent={<Building className="h-4 w-4 text-brand-blue" />}
                                                    isReadOnly={!isEditing}
                                                    classNames={{
                                                        label: 'text-brand-blue font-medium',
                                                        input: 'text-gray-900',
                                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                                    }}
                                                />
                                                <Select
                                                    label="Industry"
                                                    placeholder="Select industry"
                                                    value={profileData?.industry}
                                                    onChange={(e) => handleInputChange('industry', e.target.value)}
                                                    classNames={{
                                                        label: 'text-brand-blue font-medium',
                                                        trigger: 'border-gray-300 focus:border-brand-teal',
                                                    }}
                                                >
                                                    <SelectItem key="technology" >Technology</SelectItem>
                                                    <SelectItem key="finance">Finance</SelectItem>
                                                    <SelectItem key="healthcare">Healthcare</SelectItem>
                                                    <SelectItem key="education">Education</SelectItem>
                                                    <SelectItem key="retail">Retail</SelectItem>
                                                </Select>
                                            </div>
                                        }
                                    </div>
                                    {isEditing && !isRecruiter && (
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
                                        disabled={isProcessingResume}
                                    />
                                    <label htmlFor="resume-upload">
                                        <Button
                                            as="span"
                                            className="w-full bg-brand-teal text-white"
                                            startContent={
                                                isProcessingResume ?
                                                    <Loader2 className="h-4 w-4 animate-spin" /> :
                                                    <Upload className="h-4 w-4" />
                                            }
                                            isDisabled={isProcessingResume}
                                        >
                                            {isProcessingResume ? 'Processing...' :
                                                resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
                                        </Button>
                                    </label>

                                    {isProcessingResume && (
                                        <p className="text-xs text-center text-gray-600">
                                            This may take a few moments while we extract your information
                                        </p>
                                    )}
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
