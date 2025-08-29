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
import { Eye, EyeOff, Mail, Lock, Github } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { redirect, useRouter } from 'next/navigation';

interface LoginFormSchema {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginErrorSchema {
    email?: string;
    password?: string;
    general?: string;
}

const LoginPage = () => {
    const [formData, setFormData] = useState<LoginFormSchema>({
        email: '',
        password: '',
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginErrorSchema>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isGithubLoading, setIsGithubLoading] = useState(false);
    const router = useRouter()

    const validateForm = () => {
        const newErrors: LoginErrorSchema = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        const { data, error } = await authClient.signIn.email(
            {
                email: formData.email,
                password: formData.password,
                callbackURL: "/"
            },
            {
                onRequest: (ctx) => {
                    // Optional: Handle request start
                },
                onSuccess: (ctx) => {
                    setIsLoading(false);
                    router.push('/')
                },
                onError: (ctx) => {
                    setIsLoading(false);
                    setErrors({ general: ctx.error.message || 'Login failed. Please try again.' });
                }
            }
        );
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setErrors({});

        const { data, error } = await authClient.signIn.social(
            {
                provider: "google",
                callbackURL: "/"
            },
            {
                onRequest: (ctx) => {
                    // Optional: Handle request start
                },
                onSuccess: (ctx) => {
                    setIsGoogleLoading(false);
                    redirect('/');
                },
                onError: (ctx) => {
                    setIsGoogleLoading(false);
                    setErrors({ general: ctx.error.message || 'Google login failed. Please try again.' });
                }
            }
        );
    };

    const handleGithubLogin = async () => {
        setIsGithubLoading(true);
        setErrors({});

        const { data, error } = await authClient.signIn.social(
            {
                provider: "github",
                callbackURL: "/"
            },
            {
                onRequest: (ctx) => {
                    // Optional: Handle request start
                },
                onSuccess: (ctx) => {
                    setIsGithubLoading(false);
                    redirect('/');
                },
                onError: (ctx) => {
                    setIsGithubLoading(false);
                    setErrors({ general: ctx.error.message || 'GitHub login failed. Please try again.' });
                }
            }
        );
    };

    const handleInputChange = (field: keyof LoginFormSchema, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof LoginErrorSchema]) {
            setErrors(prev => ({ ...prev, [field as keyof LoginErrorSchema]: '' }));
        }
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
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
                        Welcome Back
                    </h1>
                    <p
                        className="text-white text-lg opacity-90"
                    >
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <Card className="bg-white w-full shadow-2xl">
                    <CardHeader className="flex flex-col gap-3 pb-0">
                        <div className="flex flex-col items-center">
                            <h2
                                className="text-brand-blue text-2xl font-semibold text-center"
                            >
                                Sign In
                            </h2>
                            <p
                                className="text-muted text-sm text-center mt-1"
                            >
                                Enter your credentials to continue
                            </p>
                        </div>
                    </CardHeader>

                    <Divider className='bg-brand-blue h-[2px]' />

                    <CardBody className="gap-4 pt-6">
                        <div className="flex flex-col gap-4">
                            {/* General Error Message */}
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {errors.general}
                                </div>
                            )}

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

                            {/* Remember Me and Forgot Password */}
                            <div className="flex items-center justify-between">
                                <Checkbox
                                    isSelected={formData.rememberMe}
                                    onValueChange={(checked) => handleInputChange('rememberMe', checked)}
                                    classNames={{
                                        wrapper: "before:border-[#0ea5e9]",
                                    }}
                                >
                                    <span className="text-gray-700 text-sm">
                                        Remember me
                                    </span>
                                </Checkbox>

                                <Link
                                    href="#"
                                    size="sm"
                                    className="text-brand-teal hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Email Login Button */}
                            <Button
                                type="button"
                                size="lg"
                                isLoading={isLoading}
                                onPress={handleEmailLogin}
                                className="bg-brand-teal w-full font-semibold text-white transition-all duration-200 hover:shadow-lg"
                                isDisabled={isGoogleLoading || isGithubLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            {/* Divider with OR */}
                            <div className="relative flex items-center justify-center my-4">
                                <Divider className="flex-1" />
                                <span className="px-4 text-sm text-muted bg-white">OR</span>
                                <Divider className="flex-1" />
                            </div>

                            {/* Social Login Buttons */}
                            <div className="flex flex-col gap-3">
                                {/* Google Login */}
                                <Button
                                    variant="bordered"
                                    size="lg"
                                    isLoading={isGoogleLoading}
                                    onPress={handleGoogleLogin}
                                    className="border-gray-300 text-gray-700 w-full font-medium transition-all duration-200 hover:shadow-md hover:border-gray-400"
                                    isDisabled={isLoading || isGithubLoading}
                                    startContent={
                                        !isGoogleLoading && (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                        )
                                    }
                                >
                                    {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                                </Button>

                                {/* GitHub Login */}
                                <Button
                                    variant="bordered"
                                    size="lg"
                                    isLoading={isGithubLoading}
                                    onPress={handleGithubLogin}
                                    className="border-gray-800 text-gray-800 w-full font-medium transition-all duration-200 hover:shadow-md hover:bg-gray-50"
                                    isDisabled={isLoading || isGoogleLoading}
                                    startContent={
                                        !isGithubLoading && <Github className="h-5 w-5" />
                                    }
                                >
                                    {isGithubLoading ? 'Connecting...' : 'Continue with GitHub'}
                                </Button>
                            </div>
                        </div>

                        {/* Footer */}
                        <Divider className="my-4" />

                        <div className="text-center">
                            <p className="text-muted text-sm">
                                Don't have an account?{' '}
                                <Link
                                    href="/auth/register"
                                    size="sm"
                                    className="text-brand-blue font-semibold hover:underline"
                                >
                                    Sign up here
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
                                Secure Login
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                className='text-brand-teal bg-[#F0F9FF]'
                            >
                                Quick Access
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                className='text-brand-orange bg-[#FFF7ED]'
                            >
                                Protected
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                {/* Bottom Text */}
                <p
                    className="text-white text-center text-sm mt-6 opacity-90"
                >
                    Secure access to your account and data
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
