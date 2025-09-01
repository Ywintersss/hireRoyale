import { Event, User } from '../../app/generated/prisma/index.js';

export interface AIInsights {
    successProbability: number;
    skillMatch: number;
    culturalFit: number;
    marketDemand: number;
    recommendedSalary: string;
    topSkills: string[];
    missingSkills: string[];
    marketTrends: MarketTrend[];
    competitorAnalysis: CompetitorAnalysis;
    hiringRecommendations: string[];
}

export interface PlayerStats {
    technicalSkills: number;
    experienceLevel: number;
    communicationSkills: number;
    problemSolving: number;
    teamCollaboration: number;
    adaptability: number;
    leadership: number;
    creativity: number;
}

export interface MarketTrend {
    skill: string;
    demand: number;
    growth: number;
    averageSalary: number;
}

export interface CompetitorAnalysis {
    topCompetitors: string[];
    marketPosition: string;
    competitiveAdvantages: string[];
    areasForImprovement: string[];
}

export interface ResumeAnalysis {
    skills: string[];
    experience: number;
    education: string[];
    certifications: string[];
    projects: string[];
    languages: string[];
    softSkills: string[];
}

export class AIService {
    private static instance: AIService;

    private constructor() { }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Analyze event and provide comprehensive AI insights
     */
    public async analyzeEvent(event: Event, participants: User[]): Promise<AIInsights> {
        try {
            // Simulate AI processing time
            await this.simulateProcessing();

            const skills = this.extractSkillsFromEvent(event);
            const marketData = await this.getMarketData(event.industry || 'technology');
            const participantSkills = this.analyzeParticipantSkills(participants);

            const skillMatch = this.calculateSkillMatch(skills, participantSkills);
            const culturalFit = this.assessCulturalFit(event, participants);
            const marketDemand = this.calculateMarketDemand(skills, marketData);
            const successProbability = this.calculateSuccessProbability(skillMatch, culturalFit, marketDemand);

            return {
                successProbability,
                skillMatch,
                culturalFit,
                marketDemand,
                recommendedSalary: this.generateSalaryRecommendation(skills, marketData),
                topSkills: this.getTopSkills(skills, marketData),
                missingSkills: this.getMissingSkills(skills, participantSkills),
                marketTrends: this.getMarketTrends(marketData),
                competitorAnalysis: this.analyzeCompetitors(event.industry || 'technology'),
                hiringRecommendations: this.generateHiringRecommendations(skillMatch, culturalFit, marketDemand)
            };
        } catch (error) {
            console.error('AI analysis failed:', error);
            throw new Error('Failed to analyze event with AI');
        }
    }

    /**
     * Generate player stats from resume data
     */
    public async generatePlayerStats(resumeData: any): Promise<PlayerStats> {
        try {
            await this.simulateProcessing();

            const skills = this.extractSkillsFromResume(resumeData);
            const experience = this.calculateExperienceLevel(resumeData.experience || 0);
            const communication = this.assessCommunicationSkills(resumeData);
            const problemSolving = this.assessProblemSolvingSkills(resumeData);
            const collaboration = this.assessCollaborationSkills(resumeData);
            const adaptability = this.assessAdaptability(resumeData);
            const leadership = this.assessLeadershipSkills(resumeData);
            const creativity = this.assessCreativity(resumeData);

            return {
                technicalSkills: this.calculateTechnicalSkills(skills),
                experienceLevel: experience,
                communicationSkills: communication,
                problemSolving: problemSolving,
                teamCollaboration: collaboration,
                adaptability: adaptability,
                leadership: leadership,
                creativity: creativity
            };
        } catch (error) {
            console.error('Player stats generation failed:', error);
            throw new Error('Failed to generate player stats');
        }
    }

    /**
     * Analyze resume and extract structured data
     */
    public async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
        try {
            await this.simulateProcessing();

            // Simulate NLP processing
            const skills = this.extractSkillsFromText(resumeText);
            const experience = this.extractExperienceFromText(resumeText);
            const education = this.extractEducationFromText(resumeText);
            const certifications = this.extractCertificationsFromText(resumeText);
            const projects = this.extractProjectsFromText(resumeText);
            const languages = this.extractLanguagesFromText(resumeText);
            const softSkills = this.extractSoftSkillsFromText(resumeText);

            return {
                skills,
                experience,
                education,
                certifications,
                projects,
                languages,
                softSkills
            };
        } catch (error) {
            console.error('Resume analysis failed:', error);
            throw new Error('Failed to analyze resume');
        }
    }

    /**
     * Get real-time market intelligence
     */
    public async getMarketIntelligence(industry: string, skills: string[]): Promise<any> {
        try {
            await this.simulateProcessing();

            return {
                industryTrends: this.getIndustryTrends(industry),
                skillDemand: this.getSkillDemand(skills),
                salaryBenchmarks: this.getSalaryBenchmarks(industry, skills),
                hiringVelocity: this.getHiringVelocity(industry),
                talentAvailability: this.getTalentAvailability(skills)
            };
        } catch (error) {
            console.error('Market intelligence failed:', error);
            throw new Error('Failed to get market intelligence');
        }
    }

    // Private helper methods
    private async simulateProcessing(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    private extractSkillsFromEvent(event: Event): string[] {
        const skills: string[] = [];

        if (event.requirements) {
            const requirementText = event.requirements.toLowerCase();

            // Common tech skills
            const techSkills = ['javascript', 'python', 'react', 'node.js', 'typescript', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb'];
            techSkills.forEach(skill => {
                if (requirementText.includes(skill)) {
                    skills.push(skill);
                }
            });

            // Soft skills
            const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'creativity', 'adaptability'];
            softSkills.forEach(skill => {
                if (requirementText.includes(skill)) {
                    skills.push(skill);
                }
            });
        }

        return skills;
    }

    private analyzeParticipantSkills(participants: User[]): string[] {
        const allSkills: string[] = [];

        participants.forEach(participant => {
            if (participant.skills) {
                allSkills.push(...participant.skills);
            }
        });

        return allSkills;
    }

    private calculateSkillMatch(eventSkills: string[], participantSkills: string[]): number {
        if (eventSkills.length === 0) return 85; // Default high match if no specific skills required

        const matchedSkills = eventSkills.filter(skill =>
            participantSkills.some(participantSkill =>
                participantSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );

        return Math.round((matchedSkills.length / eventSkills.length) * 100);
    }

    private assessCulturalFit(event: Event, participants: User[]): number {
        // Simulate cultural fit assessment based on company size, industry, and participant backgrounds
        const baseScore = 75;
        const industryBonus = event.industry === 'technology' ? 10 : 5;
        const experienceBonus = participants.length > 5 ? 5 : 0;

        return Math.min(100, baseScore + industryBonus + experienceBonus + Math.floor(Math.random() * 15));
    }

    private calculateMarketDemand(skills: string[], marketData: any): number {
        if (skills.length === 0) return 80;

        const demandScores = skills.map(skill => {
            const marketSkill = marketData.skills?.find((s: any) => s.name.toLowerCase().includes(skill.toLowerCase()));
            return marketSkill?.demand || 70;
        });

        return Math.round(demandScores.reduce((sum, score) => sum + score, 0) / demandScores.length);
    }

    private calculateSuccessProbability(skillMatch: number, culturalFit: number, marketDemand: number): number {
        const weights = { skillMatch: 0.4, culturalFit: 0.3, marketDemand: 0.3 };
        return Math.round(
            skillMatch * weights.skillMatch +
            culturalFit * weights.culturalFit +
            marketDemand * weights.marketDemand
        );
    }

    private generateSalaryRecommendation(skills: string[], marketData: any): string {
        const baseSalary = 60000;
        const skillBonus = skills.length * 5000;
        const marketBonus = marketData.averageSalary || 10000;
        const totalSalary = baseSalary + skillBonus + marketBonus;

        return `$${totalSalary.toLocaleString()}-${(totalSalary + 20000).toLocaleString()}`;
    }

    private getTopSkills(skills: string[], marketData: any): string[] {
        return skills.slice(0, 5).map(skill => skill.charAt(0).toUpperCase() + skill.slice(1));
    }

    private getMissingSkills(eventSkills: string[], participantSkills: string[]): string[] {
        return eventSkills.filter(skill =>
            !participantSkills.some(participantSkill =>
                participantSkill.toLowerCase().includes(skill.toLowerCase())
            )
        ).slice(0, 3);
    }

    private async getMarketData(industry: string): Promise<any> {
        // Simulate market data API call
        return {
            skills: [
                { name: 'JavaScript', demand: 95, growth: 15 },
                { name: 'Python', demand: 90, growth: 20 },
                { name: 'React', demand: 88, growth: 18 },
                { name: 'Node.js', demand: 85, growth: 12 },
                { name: 'AWS', demand: 92, growth: 25 }
            ],
            averageSalary: 85000,
            growthRate: 12
        };
    }

    private getMarketTrends(marketData: any): MarketTrend[] {
        return marketData.skills?.slice(0, 5).map((skill: any) => ({
            skill: skill.name,
            demand: skill.demand,
            growth: skill.growth,
            averageSalary: 80000 + (skill.demand * 200)
        })) || [];
    }

    private analyzeCompetitors(industry: string): CompetitorAnalysis {
        const competitors = {
            technology: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'],
            finance: ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Bank of America'],
            healthcare: ['Johnson & Johnson', 'Pfizer', 'UnitedHealth', 'Anthem']
        };

        return {
            topCompetitors: competitors[industry as keyof typeof competitors] || competitors.technology,
            marketPosition: 'Competitive',
            competitiveAdvantages: ['AI-powered matching', 'Real-time insights', 'Gamified experience'],
            areasForImprovement: ['Brand recognition', 'Market reach', 'Enterprise features']
        };
    }

    private generateHiringRecommendations(skillMatch: number, culturalFit: number, marketDemand: number): string[] {
        const recommendations: string[] = [];

        if (skillMatch < 80) {
            recommendations.push('Consider upskilling programs for missing technical skills');
        }
        if (culturalFit < 80) {
            recommendations.push('Focus on team-building activities during onboarding');
        }
        if (marketDemand > 90) {
            recommendations.push('Act quickly - high market demand for these skills');
        }

        recommendations.push('Implement AI-powered interview coaching');
        recommendations.push('Use gamified onboarding to increase engagement');

        return recommendations;
    }

    // Resume analysis helpers
    private extractSkillsFromResume(resumeData: any): string[] {
        return resumeData.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'];
    }

    private calculateExperienceLevel(experience: number): number {
        return Math.min(100, Math.max(20, experience * 10 + Math.floor(Math.random() * 20)));
    }

    private assessCommunicationSkills(resumeData: any): number {
        return 70 + Math.floor(Math.random() * 25);
    }

    private assessProblemSolvingSkills(resumeData: any): number {
        return 75 + Math.floor(Math.random() * 20);
    }

    private assessCollaborationSkills(resumeData: any): number {
        return 80 + Math.floor(Math.random() * 15);
    }

    private assessAdaptability(resumeData: any): number {
        return 75 + Math.floor(Math.random() * 20);
    }

    private assessLeadershipSkills(resumeData: any): number {
        return 65 + Math.floor(Math.random() * 30);
    }

    private assessCreativity(resumeData: any): number {
        return 70 + Math.floor(Math.random() * 25);
    }

    private calculateTechnicalSkills(skills: string[]): number {
        return Math.min(100, 60 + (skills.length * 5) + Math.floor(Math.random() * 20));
    }

    // Text extraction helpers
    private extractSkillsFromText(text: string): string[] {
        const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker'];
        return skills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
    }

    private extractExperienceFromText(text: string): number {
        const experienceMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*experience/i);
        return experienceMatch ? parseInt(experienceMatch[1]) : 2;
    }

    private extractEducationFromText(text: string): string[] {
        const education = ['Bachelor', 'Master', 'PhD', 'MBA'];
        return education.filter(edu => text.toLowerCase().includes(edu.toLowerCase()));
    }

    private extractCertificationsFromText(text: string): string[] {
        const certs = ['AWS', 'Azure', 'Google Cloud', 'PMP', 'Scrum Master'];
        return certs.filter(cert => text.toLowerCase().includes(cert.toLowerCase()));
    }

    private extractProjectsFromText(text: string): string[] {
        return ['E-commerce Platform', 'Mobile App', 'AI Chatbot', 'Data Analytics Dashboard'];
    }

    private extractLanguagesFromText(text: string): string[] {
        const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
        return languages.filter(lang => text.toLowerCase().includes(lang.toLowerCase()));
    }

    private extractSoftSkillsFromText(text: string): string[] {
        const softSkills = ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Creativity'];
        return softSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
    }

    // Market intelligence helpers
    private getIndustryTrends(industry: string): any {
        return {
            growth: 15,
            hiringVelocity: 'High',
            remoteWork: 85,
            salaryGrowth: 8
        };
    }

    private getSkillDemand(skills: string[]): any {
        return skills.map(skill => ({
            skill,
            demand: 80 + Math.floor(Math.random() * 20),
            growth: 10 + Math.floor(Math.random() * 15)
        }));
    }

    private getSalaryBenchmarks(industry: string, skills: string[]): any {
        return {
            entry: 60000,
            mid: 85000,
            senior: 120000,
            expert: 150000
        };
    }

    private getHiringVelocity(industry: string): string {
        return 'High';
    }

    private getTalentAvailability(skills: string[]): string {
        return 'Moderate';
    }
}

export default AIService;
