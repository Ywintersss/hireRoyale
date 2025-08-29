import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Chip
} from "@heroui/react";
import { Users, X, Plus } from "lucide-react";
import { useState } from "react";
import { JobRequirementData, JobRequirementRegistrationData } from "../../types/types";

interface JobRequirementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateJobRequirement: (eventId: string, data: JobRequirementRegistrationData) => Promise<void>;
    isLoading?: boolean;
    selectedEvent?: string;
    setJobCreationStatus: (bool: boolean) => void
}

const JobRequirementsModal: React.FC<JobRequirementsModalProps> = ({
    isOpen,
    onClose,
    onCreateJobRequirement,
    isLoading = false,
    selectedEvent,
    setJobCreationStatus
}) => {
    const [formData, setFormData] = useState<JobRequirementRegistrationData>({
        title: '',
        description: '',
        experienceLevel: '',
        requiredSkills: [],
        location: '',
        employmentType: '',
        salaryRange: '',
        department: '',
        isRemoteOk: false,
    });

    const [skillInput, setSkillInput] = useState('');

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                requiredSkills: [...formData.requiredSkills, skillInput.trim()]
            });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleSubmit = async () => {
        try {
            await onCreateJobRequirement(selectedEvent as string, formData);
            resetForm();
            onClose();

            setJobCreationStatus(true);
        } catch (error) {
            console.error('Error creating job requirement:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            experienceLevel: '',
            requiredSkills: [],
            location: '',
            employmentType: '',
            salaryRange: '',
            department: '',
            isRemoteOk: false,
        });
        setSkillInput('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="3xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex items-center gap-2" style={{ color: '#1E3A8A' }}>
                    <Users className="h-5 w-5" />
                    Create Job Requirement
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-6">
                        {/* Job Title */}
                        <Input
                            label="Job Title"
                            placeholder="e.g., Senior Frontend Developer"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            classNames={{
                                label: 'text-brand-blue font-medium',
                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                            }}
                            isRequired
                        />

                        {/* Job Description */}
                        <Textarea
                            label="Job Description"
                            placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            minRows={4}
                            classNames={{
                                label: 'text-brand-blue font-medium',
                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                            }}
                            isRequired
                        />

                        {/* Experience Level and Employment Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Experience Level"
                                placeholder="Select experience level"
                                value={formData.experienceLevel}
                                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    trigger: 'border-gray-300 focus:border-brand-teal',
                                }}
                                isRequired
                            >
                                <SelectItem key="entry">Entry Level (0-2 years)</SelectItem>
                                <SelectItem key="mid">Mid Level (2-5 years)</SelectItem>
                                <SelectItem key="senior">Senior Level (5-8 years)</SelectItem>
                                <SelectItem key="lead">Lead Level (8+ years)</SelectItem>
                                <SelectItem key="executive">Executive Level</SelectItem>
                            </Select>

                            <Select
                                label="Employment Type"
                                placeholder="Select employment type"
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    trigger: 'border-gray-300 focus:border-brand-teal',
                                }}
                                isRequired
                            >
                                <SelectItem key="full-time">Full Time</SelectItem>
                                <SelectItem key="part-time">Part Time</SelectItem>
                                <SelectItem key="contract">Contract</SelectItem>
                                <SelectItem key="freelance">Freelance</SelectItem>
                                <SelectItem key="internship">Internship</SelectItem>
                            </Select>
                        </div>

                        {/* Department and Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Department"
                                placeholder="Select department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    trigger: 'border-gray-300 focus:border-brand-teal',
                                }}
                            >
                                <SelectItem key="engineering">Engineering</SelectItem>
                                <SelectItem key="product">Product</SelectItem>
                                <SelectItem key="design">Design</SelectItem>
                                <SelectItem key="marketing">Marketing</SelectItem>
                                <SelectItem key="sales">Sales</SelectItem>
                                <SelectItem key="hr">Human Resources</SelectItem>
                                <SelectItem key="finance">Finance</SelectItem>
                                <SelectItem key="operations">Operations</SelectItem>
                            </Select>

                            <Input
                                label="Location"
                                placeholder="e.g., San Francisco, CA or Remote"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                                }}
                            />
                        </div>

                        {/* Salary Range */}
                        <Input
                            label="Salary Range (Optional)"
                            placeholder="e.g., $80,000 - $120,000 or Competitive"
                            value={formData.salaryRange}
                            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                            classNames={{
                                label: 'text-brand-blue font-medium',
                                inputWrapper: 'border-gray-300 focus-within:border-brand-teal',
                            }}
                        />

                        {/* Required Skills */}
                        <div>
                            <label className="block text-sm font-medium text-brand-blue mb-2">
                                Required Skills *
                            </label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    placeholder="Add a skill (e.g., React, TypeScript, Node.js)"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    classNames={{
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal flex-1',
                                    }}
                                />
                                <Button
                                    size="md"
                                    className="bg-brand-teal text-white"
                                    onPress={handleAddSkill}
                                    isDisabled={!skillInput.trim()}
                                    startContent={<Plus className="h-4 w-4" />}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Skills Display */}
                            {formData.requiredSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.requiredSkills.map((skill, index) => (
                                        <Chip
                                            key={index}
                                            size="sm"
                                            className="bg-[#F0F9FF] text-brand-teal"
                                            endContent={
                                                <button
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-1 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            }
                                        >
                                            {skill}
                                        </Chip>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Remote Work Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="remote-ok"
                                checked={formData.isRemoteOk}
                                onChange={(e) => setFormData({ ...formData, isRemoteOk: e.target.checked })}
                                className="h-4 w-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal focus:ring-2"
                            />
                            <label htmlFor="remote-ok" className="text-sm font-medium text-gray-700">
                                Remote work is acceptable for this position
                            </label>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="light"
                        onPress={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-brand-teal text-white"
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        isDisabled={
                            !formData.title.trim() ||
                            !formData.description.trim() ||
                            !formData.experienceLevel ||
                            !formData.employmentType ||
                            formData.requiredSkills.length === 0
                        }
                    >
                        Create Job Requirement
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default JobRequirementsModal;
