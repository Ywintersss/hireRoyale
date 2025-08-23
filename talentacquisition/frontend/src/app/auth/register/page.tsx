'use client'
import React, { useState } from 'react';
import {
    Button,
    Input,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Link,
    Checkbox,
    Chip,
} from "@heroui/react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { RegistrationErrorSchema, RegistrationFormSchema } from '../../../../types/types';
import bcrypt from 'bcrypt'
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

const RegistrationPage = () => {
    const [formData, setFormData] = useState<RegistrationFormSchema>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        subscribeNewsletter: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<RegistrationErrorSchema>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: RegistrationErrorSchema = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API call
        // const hashedPassword = await bcrypt.hash(formData.password, 10)
        const name = `${formData.firstName} ${formData.lastName}`
        const { data, error } = await authClient.signUp.email(
            { email: formData.email, password: formData.password, name: name, callbackURL: "/" },
            {
                onRequest: (ctx) => {

                },
                onSuccess: (ctx) => {
                    setIsLoading(false);
                    redirect('/')
                    alert('Registration successful! (This is a demo)');
                },
                onError: (ctx) => {
                    alert(ctx.error.message)
                }
            }
        )

    };

    const handleInputChange = (field: keyof RegistrationErrorSchema, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 50%, #F97316 100%)',
            }}
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1
                        className="text-white text-3xl font-bold mb-2"
                    >
                        Join Our Platform
                    </h1>
                    <p
                        className="text-white text-lg opacity-90"
                    >
                        Create your account to get started
                    </p>
                </div>

                {/* Registration Card */}
                <Card className="bg-white w-full shadow-2xl">
                    <CardHeader className="flex flex-col gap-3 pb-0">
                        <div className="flex flex-col items-center">
                            <h2
                                className="text-brand-blue text-2xl font-semibold text-center"
                            >
                                Create Account
                            </h2>
                            <p
                                className="text-muted text-sm text-center mt-1"
                            >
                                Fill in your details to register
                            </p>
                        </div>
                    </CardHeader>

                    <Divider className='bg-brand-blue h-[2px]' />

                    <CardBody className="gap-4 pt-6">
                        <div className="flex flex-col gap-4">
                            {/* Name Fields */}
                            <div className="flex gap-2">
                                <Input
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    isInvalid={!!errors.firstName}
                                    errorMessage={errors.firstName}
                                    startContent={<User className="h-4 w-4 text-brand-blue" />}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        input: 'text-gray-900',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                    }}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    isInvalid={!!errors.lastName}
                                    errorMessage={errors.lastName}
                                    classNames={{
                                        label: 'text-brand-blue font-medium',
                                        input: 'text-gray-900',
                                        inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                    }}
                                />
                            </div>

                            {/* Email */}
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                isInvalid={!!errors.email}
                                errorMessage={errors.email}
                                startContent={<Mail className="h-4 w-4 text-brand-blue" />}
                                classNames={{
                                    label: 'text-[#1E3A8A] font-medium',
                                    input: 'text-gray-900',
                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                }}
                            />

                            {/* Phone */}
                            <Input
                                type="tel"
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                isInvalid={!!errors.phone}
                                errorMessage={errors.phone}
                                startContent={<Phone className="h-4 w-4 text-brand-blue" />}
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    input: 'text-gray-900',
                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                }}
                            />

                            {/* Password */}
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                isInvalid={!!errors.password}
                                errorMessage={errors.password}
                                startContent={<Lock className="h-4 w-4 text-brand-blue" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted" />
                                        )}
                                    </button>
                                }
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    input: 'text-gray-900',
                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                }}
                            />

                            {/* Confirm Password */}
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                isInvalid={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword}
                                startContent={<Lock className="h-4 w-4 text-brand-blue" />}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted" />
                                        )}
                                    </button>
                                }
                                classNames={{
                                    label: 'text-brand-blue font-medium',
                                    input: 'text-gray-900',
                                    inputWrapper: 'border-gray-300 focus-within:border-brand-teal hover:border-brand-teal',
                                }}
                            />

                            {/* Checkboxes */}
                            <div className="flex flex-col gap-2">
                                <Checkbox
                                    isSelected={formData.agreeToTerms}
                                    onValueChange={(checked) => handleInputChange('agreeToTerms', checked)}
                                    classNames={{
                                        base: errors.agreeToTerms ? "border-red-500" : "",
                                        wrapper: "before:border-[#0ea5e9]",
                                    }}
                                >
                                    <span style={{ color: '#374151' }}>
                                        I agree to the{' '}
                                        <Link
                                            href="#"
                                            size="sm"
                                            className="hover:underline text-brand-teal"
                                        >
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link
                                            href="#"
                                            size="sm"
                                            className="hover:underline text-brand-teal"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </Checkbox>
                                {errors.agreeToTerms && (
                                    <p className="text-red-500 text-xs ml-6">{errors.agreeToTerms}</p>
                                )}

                                <Checkbox
                                    isSelected={formData.subscribeNewsletter}
                                    onValueChange={(checked) => handleInputChange('subscribeNewsletter', checked)}
                                    classNames={{
                                        wrapper: "before:border-[#f97316]",
                                    }}
                                >
                                    <span style={{ color: '#374151' }}>
                                        Subscribe to our newsletter for updates and offers
                                    </span>
                                </Checkbox>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="button"
                                size="lg"
                                isLoading={isLoading}
                                onPress={handleSubmit}
                                className="bg-brand-teal w-full font-semibold text-white transition-all duration-200 hover:shadow-lg"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            {/* Alternative Action */}
                            <Button
                                variant="bordered"
                                size="lg"
                                className="border-brand-orange text-brand-orange w-full font-medium transition-all duration-200"
                            >
                                Sign up with Google
                            </Button>
                        </div>

                        {/* Footer */}
                        <Divider className="my-4" />

                        <div className="text-center">
                            <p className="text-muted text-sm">
                                Already have an account?{' '}
                                <Link
                                    href="#"
                                    size="sm"
                                    className="text-brand-blue font-semibold hover:underline"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            <Chip
                                size="sm"
                                variant="flat"
                                className='text-brand-blue bg-[#EEF2FF]'
                            >
                                Secure
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                className='text-brand-teal bg-[#F0F9FF]'
                            >
                                Fast Setup
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                className='text-brand-orange bg-[#FFF7ED]'
                            >
                                Free Trial
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                {/* Bottom Text */}
                <p
                    className="text-white text-center text-sm mt-6 opacity-90"
                >
                    By registering, you'll gain access to our full platform features
                </p>
            </div>
        </div>
    );
};

export default RegistrationPage;
