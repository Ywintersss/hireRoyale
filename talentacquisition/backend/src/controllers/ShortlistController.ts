import type { Request, Response } from 'express'

type CandidateInput = {
    id: string
    name?: string
    resumeText: string
}

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s+#.]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
}

function scoreCandidate(jdTokens: string[], resumeTokens: string[]) {
    const jdSet = new Set(jdTokens)
    const resumeSet = new Set(resumeTokens)
    let overlap = 0
    jdSet.forEach((t) => {
        if (resumeSet.has(t)) overlap += 1
    })
    const precision = overlap / Math.max(1, resumeSet.size)
    const recall = overlap / Math.max(1, jdSet.size)
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0
    return { overlap, precision, recall, f1 }
}

export const scoreResumes = async (req: Request, res: Response) => {
    try {
        const { jobDescription, candidates } = req.body as { jobDescription: string; candidates: CandidateInput[] }
        if (!jobDescription || !Array.isArray(candidates)) {
            return res.status(400).json({ error: 'jobDescription and candidates[] are required' })
        }
        const jdTokens = tokenize(jobDescription)
        const results = candidates.map((c) => {
            const resumeTokens = tokenize(c.resumeText)
            const metrics = scoreCandidate(jdTokens, resumeTokens)
            return {
                id: c.id,
                name: c.name || c.id,
                score: Number((metrics.f1 * 100).toFixed(2)),
                metrics,
                topKeywords: jdTokens.filter((t) => resumeTokens.includes(t)).slice(0, 20),
            }
        })
        results.sort((a, b) => b.score - a.score)
        return res.json({ rankings: results })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: 'Failed to score resumes' })
    }
}




