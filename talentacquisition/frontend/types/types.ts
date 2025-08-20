export interface RegistrationFormSchema {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    country: string,
    agreeToTerms: boolean,
    subscribeNewsletter: boolean
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
}
