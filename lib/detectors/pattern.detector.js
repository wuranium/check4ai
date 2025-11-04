/*!
 * check4ai.patternDetector
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const CONSTANTS = require('../util/constant');

/**
 * Pattern Detector for Modern LLMs
 * Detects specific patterns common in GPT-4, Claude, Gemini, and other modern LLMs
 *
 * Detection Patterns:
 * 1. Common AI phrases and structures
 * 2. Hedging language patterns
 * 3. List formatting tendencies
 * 4. Meta-commentary patterns
 * 5. Overly formal or structured responses
 */

const detector = {
    name: "Pattern Detector",
    detectorCode: CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR,

    // Common phrases used by modern AI models
    aiPhrases: [
        "it's important to note",
        "it's worth noting",
        "keep in mind",
        "it's crucial to",
        "it's essential to",
        "bear in mind",
        "take into consideration",
        "take into account",
        "it should be noted",
        "one should consider",
        "delve into",
        "dive into",
        "explore the nuances",
        "multifaceted",
        "comprehensive understanding",
        "holistic approach",
        "it's worth mentioning",
        "pivotal role",
        "integral part",
        "paramount importance",
        "foster collaboration",
        "leverage",
        "utilize",
        "in today's digital age",
        "in today's world",
        "in this day and age",
        "at the end of the day",
        "when it comes to",
        "plays a vital role",
        "serves as a testament",
        "underscores the importance"
    ],

    // Hedging patterns common in AI
    hedgingPatterns: [
        /\b(may|might|could|possibly|perhaps|potentially)\s+(be|have|suggest|indicate|imply)/gi,
        /\bit('s| is) (possible|likely|probable) that\b/gi,
        /\b(generally|typically|usually|often|sometimes)\s+(considered|regarded|seen as)\b/gi,
        /\btends? to\b/gi,
        /\bcan be (seen|viewed|considered) as\b/gi
    ],

    // Structure patterns
    structurePatterns: {
        numberedLists: /^\s*\d+[\.)]\s+/gm,
        bulletPoints: /^\s*[-•*]\s+/gm,
        headers: /^#+\s+/gm,
        colonIntros: /:\s*$/gm
    },

    // Meta-commentary patterns (AI explaining its own output)
    metaPatterns: [
        /\b(let me|let's|I'll|I will)\s+(explain|discuss|explore|analyze|break down|walk through)\b/gi,
        /\bhere('s| is|are)\s+(some|a few|several|why|how|what)\b/gi,
        /\bin (this|the following) (section|paragraph|discussion|analysis)\b/gi,
        /\b(firstly|secondly|thirdly|finally|in conclusion|to summarize)\b/gi
    ],

    /**
     * Detect common AI phrases
     */
    detectAIPhrases: function(text) {
        const lowerText = text.toLowerCase();
        const found = this.aiPhrases.filter(phrase =>
            lowerText.includes(phrase)
        );

        const phraseRate = found.length / (text.split(/\s+/).length / 100); // per 100 words
        const score = Math.min(phraseRate * 20, 100); // Scale to 0-100

        return {
            found: found,
            count: found.length,
            score: score,
            isAI: found.length >= 2,
            explanation: found.length >= 2
                ? `Found ${found.length} common AI phrases: "${found.slice(0, 3).join('", "')}"${found.length > 3 ? '...' : ''}`
                : 'No significant AI phrase patterns detected'
        };
    },

    /**
     * Detect hedging language
     */
    detectHedging: function(text) {
        let hedgeCount = 0;
        const matches = [];

        this.hedgingPatterns.forEach(pattern => {
            const found = text.match(pattern) || [];
            hedgeCount += found.length;
            matches.push(...found);
        });

        const words = text.split(/\s+/).length;
        const hedgeRate = (hedgeCount / words) * 100;
        const score = Math.min(hedgeRate * 50, 100);

        return {
            count: hedgeCount,
            rate: hedgeRate,
            score: score,
            isAI: hedgeRate > 2, // More than 2% hedging
            explanation: hedgeRate > 2
                ? `High hedging rate (${hedgeRate.toFixed(1)}%) suggests cautious AI writing`
                : 'Normal hedging patterns'
        };
    },

    /**
     * Detect structured formatting (lists, headers)
     */
    detectStructure: function(text) {
        const counts = {
            numberedLists: (text.match(this.structurePatterns.numberedLists) || []).length,
            bulletPoints: (text.match(this.structurePatterns.bulletPoints) || []).length,
            headers: (text.match(this.structurePatterns.headers) || []).length,
            colonIntros: (text.match(this.structurePatterns.colonIntros) || []).length
        };

        const lines = text.split('\n').length;
        const structureRate = Object.values(counts).reduce((a, b) => a + b, 0) / lines;
        const score = Math.min(structureRate * 100, 100);

        const hasMultipleTypes = Object.values(counts).filter(c => c > 0).length;

        return {
            counts: counts,
            rate: structureRate,
            score: score,
            isAI: structureRate > 0.2 && hasMultipleTypes >= 2,
            explanation: structureRate > 0.2 && hasMultipleTypes >= 2
                ? `High structured formatting (${(structureRate * 100).toFixed(1)}%) typical of AI`
                : 'Normal text structure'
        };
    },

    /**
     * Detect meta-commentary
     */
    detectMetaCommentary: function(text) {
        let metaCount = 0;
        const matches = [];

        this.metaPatterns.forEach(pattern => {
            const found = text.match(pattern) || [];
            metaCount += found.length;
            matches.push(...found);
        });

        const sentences = text.split(/[.!?]+/).length;
        const metaRate = metaCount / sentences;
        const score = Math.min(metaRate * 100, 100);

        return {
            count: metaCount,
            rate: metaRate,
            score: score,
            isAI: metaCount >= 2,
            explanation: metaCount >= 2
                ? `Found ${metaCount} meta-commentary phrases typical of AI explanations`
                : 'No significant meta-commentary detected'
        };
    },

    /**
     * Detect specific LLM signatures
     */
    detectLLMSignatures: function(text) {
        const signatures = {
            gpt4: [
                'comprehensive',
                'multifaceted',
                'nuanced',
                'delve',
                'intricacies'
            ],
            claude: [
                "i'd be happy to",
                "i apologize",
                "let me explain",
                "it's important to understand"
            ],
            gemini: [
                'holistic',
                'synergy',
                'paradigm',
                'leverage',
                'optimize'
            ]
        };

        const lowerText = text.toLowerCase();
        const detected = {};

        for (const [model, words] of Object.entries(signatures)) {
            const found = words.filter(word => lowerText.includes(word.toLowerCase()));
            if (found.length > 0) {
                detected[model] = found;
            }
        }

        const totalMatches = Object.values(detected).flat().length;
        const score = Math.min(totalMatches * 15, 100);

        return {
            signatures: detected,
            count: totalMatches,
            score: score,
            isAI: totalMatches >= 3,
            explanation: totalMatches >= 3
                ? `Detected ${totalMatches} signature words from: ${Object.keys(detected).join(', ')}`
                : 'No specific LLM signatures detected'
        };
    },

    /**
     * Main detection function
     */
    detect: async function({
        text,
        aiScoreThreshold = 55
    } = {}) {
        if (!text || text.trim().length < 50) {
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: 'Text too short for pattern analysis (minimum 50 characters)',
                    plain: 'Text must be at least 50 characters for pattern analysis'
                }
            };
        }

        try {
            // Run all pattern analyses
            const phrases = this.detectAIPhrases(text);
            const hedging = this.detectHedging(text);
            const structure = this.detectStructure(text);
            const metaCommentary = this.detectMetaCommentary(text);
            const signatures = this.detectLLMSignatures(text);

            // Calculate weighted score
            const weights = {
                phrases: 0.30,
                hedging: 0.20,
                structure: 0.15,
                metaCommentary: 0.20,
                signatures: 0.15
            };

            const weightedScore =
                phrases.score * weights.phrases +
                hedging.score * weights.hedging +
                structure.score * weights.structure +
                metaCommentary.score * weights.metaCommentary +
                signatures.score * weights.signatures;

            // Count pattern indicators
            const patternIndicators = [
                phrases.isAI,
                hedging.isAI,
                structure.isAI,
                metaCommentary.isAI,
                signatures.isAI
            ].filter(Boolean).length;

            const isAI = weightedScore >= aiScoreThreshold;

            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: isAI ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
                score: weightedScore,
                confidence: patternIndicators >= 3 ? 'HIGH' : patternIndicators >= 2 ? 'MEDIUM' : 'LOW',
                details: {
                    patterns: {
                        phrases,
                        hedging,
                        structure,
                        metaCommentary,
                        signatures
                    },
                    patternIndicators: `${patternIndicators}/5 pattern indicators suggest AI`,
                    plain: `Pattern Analysis Results:\n\n` +
                           `Overall AI Score: ${weightedScore.toFixed(1)}%\n` +
                           `Confidence: ${patternIndicators >= 3 ? 'HIGH' : patternIndicators >= 2 ? 'MEDIUM' : 'LOW'}\n\n` +
                           `${phrases.explanation}\n` +
                           `${hedging.explanation}\n` +
                           `${structure.explanation}\n` +
                           `${metaCommentary.explanation}\n` +
                           `${signatures.explanation}\n\n` +
                           `${patternIndicators}/5 pattern indicators suggest AI-generated content.`
                }
            };
        } catch (error) {
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: error.message,
                    plain: `Error during pattern analysis: ${error.message}`
                }
            };
        }
    }
};

exports = module.exports = detector;
