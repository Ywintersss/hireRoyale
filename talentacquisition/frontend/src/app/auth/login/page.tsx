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
import { Eye, EyeOff, Mail, Lock, Github, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { redirect, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 25%, #0EA5E9 50%, #F97316 75%, #DC2626 100%)',
            }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white text-lg font-semibold">HireRoyale</span>
                    </motion.div>
                    
                    <motion.h1
                        className="text-white text-3xl sm:text-4xl font-bold mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Welcome Back
                    </motion.h1>
                    
                    <motion.p
                        className="text-white/80 text-lg sm:text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Sign in to your account
                    </motion.p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                >
                    <Card className="bg-white/95 backdrop-blur-xl w-full shadow-2xl border-0 overflow-hidden">
                        <CardHeader className="flex flex-col gap-3 pb-0 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Shield className="h-8 w-8 text-white" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-center">
                                    Sign In
                                </h2>
                                <p className="text-gray-600 text-center mt-2 text-sm sm:text-base">
                                    Enter your credentials to continue
                                </p>
                            </div>
                        </CardHeader>

                        <Divider className="bg-gradient-to-r from-blue-500 to-cyan-500 h-[2px]" />

                        <CardBody className="gap-4 pt-6 px-6 sm:px-8">
                            <div className="flex flex-col gap-4">
                                {/* General Error Message */}
                                <AnimatePresence>
                                    {errors.general && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm backdrop-blur-sm"
                                        >
                                            {errors.general}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.0, duration: 0.6 }}
                                >
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        isInvalid={!!errors.email}
                                        errorMessage={errors.email}
                                        startContent={<Mail className="h-4 w-4 text-blue-500" />}
                                        classNames={{
                                            label: 'text-blue-600 font-semibold',
                                            input: 'text-gray-900 placeholder:text-gray-400',
                                            inputWrapper: 'border-gray-300 focus-within:border-blue-500 hover:border-blue-400 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300',
                                            errorMessage: 'text-red-600 text-sm'
                                        }}
                                    />
                                </motion.div>

                                {/* Password */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.1, duration: 0.6 }}
                                >
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password}
                                        startContent={<Lock className="h-4 w-4 text-blue-500" />}
                                        endContent={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="focus:outline-none hover:text-blue-500 transition-colors duration-200"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        }
                                        classNames={{
                                            label: 'text-blue-600 font-semibold',
                                            input: 'text-gray-900 placeholder:text-gray-400',
                                            inputWrapper: 'border-gray-300 focus-within:border-blue-500 hover:border-blue-400 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300',
                                            errorMessage: 'text-red-600 text-sm'
                                        }}
                                    />
                                </motion.div>

                                {/* Remember Me and Forgot Password */}
                                <motion.div 
                                    className="flex items-center justify-between"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.6 }}
                                >
                                    <Checkbox
                                        isSelected={formData.rememberMe}
                                        onValueChange={(checked) => handleInputChange('rememberMe', checked)}
                                        classNames={{
                                            wrapper: "before:border-blue-500 before:bg-blue-500",
                                        }}
                                    >
                                        <span className="text-gray-700 text-sm font-medium">
                                            Remember me
                                        </span>
                                    </Checkbox>

                                    <Link
                                        href="#"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                </motion.div>

                                {/* Email Login Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3, duration: 0.6 }}
                                >
                                    <Button
                                        type="button"
                                        size="lg"
                                        isLoading={isLoading}
                                        onPress={handleEmailLogin}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 w-full font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-[1.02] rounded-xl py-6"
                                        isDisabled={isGoogleLoading || isGithubLoading}
                                    >
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </Button>
                                </motion.div>

                                {/* Divider with OR */}
                                <motion.div 
                                    className="relative flex items-center justify-center my-6"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.4, duration: 0.6 }}
                                >
                                    <Divider className="flex-1" />
                                    <span className="px-4 text-sm text-gray-500 bg-white font-medium">OR</span>
                                    <Divider className="flex-1" />
                                </motion.div>

                                {/* Social Login Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* Google Login */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.5, duration: 0.6 }}
                                    >
                                        <Button
                                            variant="bordered"
                                            size="lg"
                                            isLoading={isGoogleLoading}
                                            onPress={handleGoogleLogin}
                                            className="border-gray-300 text-gray-700 w-full font-medium transition-all duration-300 hover:shadow-lg hover:border-gray-400 bg-white/80 backdrop-blur-sm rounded-xl py-6"
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
                                    </motion.div>

                                    {/* GitHub Login */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.6, duration: 0.6 }}
                                    >
                                        <Button
                                            variant="bordered"
                                            size="lg"
                                            isLoading={isGithubLoading}
                                            onPress={handleGithubLogin}
                                            className="border-gray-800 text-gray-800 w-full font-medium transition-all duration-300 hover:shadow-lg hover:bg-gray-50 bg-white/80 backdrop-blur-sm rounded-xl py-6"
                                            isDisabled={isLoading || isGoogleLoading}
                                            startContent={
                                                !isGithubLoading && <Github className="h-5 w-5" />
                                            }
                                        >
                                            {isGithubLoading ? 'Connecting...' : 'Continue with GitHub'}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Footer */}
                            <Divider className="my-6" />

                            <motion.div 
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.7, duration: 0.6 }}
                            >
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/auth/register"
                                        size="sm"
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                                    >
                                        Sign up here
                                    </Link>
                                </p>
                            </motion.div>

                            {/* Features */}
                            <motion.div 
                                className="flex flex-wrap gap-2 justify-center mt-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.6 }}
                            >
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className='text-blue-600 bg-blue-50 border border-blue-100'
                                    startContent={<Shield className="h-3 w-3" />}
                                >
                                    Secure Login
                                </Chip>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className='text-cyan-600 bg-cyan-50 border border-cyan-100'
                                    startContent={<Zap className="h-3 w-3" />}
                                >
                                    Quick Access
                                </Chip>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className='text-green-600 bg-green-50 border border-green-100'
                                    startContent={<Shield className="h-3 w-3" />}
                                >
                                    Protected
                                </Chip>
                            </motion.div>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Bottom Text */}
                <motion.p
                    className="text-white/80 text-center text-sm mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.6 }}
                >
                    Secure access to your account and data
                </motion.p>
            </div>
        </div>
    );
};

export default LoginPage;
