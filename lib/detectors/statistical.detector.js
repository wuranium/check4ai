/*!
 * check4ai.statisticalDetector
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const natural = require('natural');
const CONSTANTS = require('../util/constant');

/**
 * Statistical AI Detector
 * Analyzes text using statistical methods to detect AI-generated content.
 * This detector works locally without external API calls.
 *
 * Detection Methods:
 * 1. Burstiness Analysis - AI text tends to have uniform sentence lengths
 * 2. Vocabulary Richness - AI often uses more varied vocabulary
 * 3. Sentence Complexity - AI tends to have consistent complexity
 * 4. Repetition Patterns - AI may have specific repetition patterns
 * 5. Word Frequency Distribution - AI follows predictable patterns
 */

const detector = {
    name: "Statistical Detector",
    detectorCode: CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR,

    /**
     * Analyze text burstiness (variation in sentence lengths)
     * AI-generated text tends to have more uniform sentence lengths
     * Human text has more variation (burstiness)
     */
    analyzeBurstiness: function(sentences) {
        if (sentences.length < 3) return { score: 0.5, isAI: false };

        const lengths = sentences.map(s => s.split(/\s+/).length);
        const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Coefficient of variation (CV) - higher means more human-like
        const cv = stdDev / mean;

        // AI typically has CV < 0.4, humans have CV > 0.6
        const aiScore = cv < 0.4 ? 0.8 : cv > 0.6 ? 0.2 : 0.5;

        return {
            score: cv,
            isAI: cv < 0.5,
            aiConfidence: aiScore,
            explanation: `Sentence length variation coefficient: ${cv.toFixed(2)}. ${cv < 0.4 ? 'Low variation suggests AI' : cv > 0.6 ? 'High variation suggests human' : 'Moderate variation is inconclusive'}.`
        };
    },

    /**
     * Analyze vocabulary richness using Type-Token Ratio (TTR)
     * AI often uses more varied vocabulary
     */
    analyzeVocabularyRichness: function(text) {
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(text.toLowerCase());

        if (tokens.length < 50) return { score: 0.5, isAI: false };

        const uniqueTokens = new Set(tokens);
        const ttr = uniqueTokens.size / tokens.length;

        // Higher TTR can indicate AI (more varied vocabulary)
        // But very low TTR also indicates possible AI (repetitive)
        const aiScore = ttr > 0.7 ? 0.7 : ttr < 0.3 ? 0.6 : 0.4;

        return {
            score: ttr,
            isAI: ttr > 0.7 || ttr < 0.3,
            aiConfidence: aiScore,
            explanation: `Type-Token Ratio: ${ttr.toFixed(2)}. ${ttr > 0.7 ? 'High vocabulary variety may suggest AI' : ttr < 0.3 ? 'Very low variety may suggest AI' : 'Normal vocabulary variation'}.`
        };
    },

    /**
     * Analyze sentence complexity patterns
     * AI tends to have more consistent complexity
     */
    analyzeSentenceComplexity: function(sentences) {
        if (sentences.length < 3) return { score: 0.5, isAI: false };

        const complexities = sentences.map(sentence => {
            const words = sentence.split(/\s+/);
            const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
            const commas = (sentence.match(/,/g) || []).length;
            const subordinate = (sentence.match(/\b(although|because|since|unless|while|whereas|if|when)\b/gi) || []).length;

            return avgWordLength + (commas * 2) + (subordinate * 3);
        });

        const mean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
        const variance = complexities.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / complexities.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;

        // Low variation in complexity suggests AI
        const aiScore = cv < 0.3 ? 0.75 : cv > 0.5 ? 0.25 : 0.5;

        return {
            score: cv,
            isAI: cv < 0.35,
            aiConfidence: aiScore,
            explanation: `Complexity variation: ${cv.toFixed(2)}. ${cv < 0.3 ? 'Uniform complexity suggests AI' : cv > 0.5 ? 'Varied complexity suggests human' : 'Moderate complexity variation'}.`
        };
    },

    /**
     * Analyze repetition patterns
     * Detect n-gram repetitions that might indicate AI
     */
    analyzeRepetition: function(text) {
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(text.toLowerCase());

        if (tokens.length < 20) return { score: 0, isAI: false };

        // Analyze 3-gram repetitions
        const trigrams = {};
        for (let i = 0; i < tokens.length - 2; i++) {
            const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
            trigrams[trigram] = (trigrams[trigram] || 0) + 1;
        }

        const repeated = Object.values(trigrams).filter(count => count > 1).length;
        const repetitionRate = repeated / Object.keys(trigrams).length;

        // High repetition can indicate AI
        const aiScore = repetitionRate > 0.15 ? 0.7 : repetitionRate < 0.05 ? 0.3 : 0.5;

        return {
            score: repetitionRate,
            isAI: repetitionRate > 0.15,
            aiConfidence: aiScore,
            explanation: `Phrase repetition rate: ${(repetitionRate * 100).toFixed(1)}%. ${repetitionRate > 0.15 ? 'High repetition may suggest AI' : 'Normal repetition patterns'}.`
        };
    },

    /**
     * Analyze transition words usage
     * AI often uses more transition words and in predictable patterns
     */
    analyzeTransitions: function(text) {
        const transitions = [
            'however', 'moreover', 'furthermore', 'therefore', 'consequently',
            'nevertheless', 'additionally', 'subsequently', 'meanwhile',
            'accordingly', 'hence', 'thus', 'indeed', 'likewise'
        ];

        const words = text.toLowerCase().split(/\s+/);
        const transitionCount = words.filter(word =>
            transitions.includes(word.replace(/[.,;:!?]/, ''))
        ).length;

        const transitionRate = transitionCount / words.length;

        // AI tends to use more formal transitions
        const aiScore = transitionRate > 0.02 ? 0.65 : transitionRate < 0.005 ? 0.35 : 0.5;

        return {
            score: transitionRate,
            isAI: transitionRate > 0.02,
            aiConfidence: aiScore,
            explanation: `Transition word rate: ${(transitionRate * 100).toFixed(2)}%. ${transitionRate > 0.02 ? 'High transition word usage may suggest AI' : 'Normal transition word usage'}.`
        };
    },

    /**
     * Main detection function
     */
    detect: async function({
        text,
        aiScoreThreshold = 60
    } = {}) {
        if (!text || text.trim().length < 100) {
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: 'Text too short for statistical analysis (minimum 100 characters)',
                    plain: 'Text must be at least 100 characters for reliable analysis'
                }
            };
        }

        try {
            // Split into sentences
            const tokenizer = new natural.SentenceTokenizer();
            const sentences = tokenizer.tokenize(text).filter(s => s.trim().length > 0);

            if (sentences.length < 3) {
                return {
                    detectorName: this.name,
                    detectorCode: this.detectorCode,
                    author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                    score: 0,
                    details: {
                        error: 'Too few sentences for analysis (minimum 3)',
                        plain: 'Text must contain at least 3 sentences for reliable analysis'
                    }
                };
            }

            // Run all analyses
            const burstiness = this.analyzeBurstiness(sentences);
            const vocabulary = this.analyzeVocabularyRichness(text);
            const complexity = this.analyzeSentenceComplexity(sentences);
            const repetition = this.analyzeRepetition(text);
            const transitions = this.analyzeTransitions(text);

            // Calculate weighted score
            const weights = {
                burstiness: 0.30,
                vocabulary: 0.20,
                complexity: 0.25,
                repetition: 0.15,
                transitions: 0.10
            };

            const weightedScore = (
                burstiness.aiConfidence * weights.burstiness +
                vocabulary.aiConfidence * weights.vocabulary +
                complexity.aiConfidence * weights.complexity +
                repetition.aiConfidence * weights.repetition +
                transitions.aiConfidence * weights.transitions
            ) * 100;

            // Count how many indicators suggest AI
            const aiIndicators = [
                burstiness.isAI,
                vocabulary.isAI,
                complexity.isAI,
                repetition.isAI,
                transitions.isAI
            ].filter(Boolean).length;

            const isAI = weightedScore >= aiScoreThreshold;

            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: isAI ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
                score: weightedScore,
                confidence: aiIndicators >= 3 ? 'HIGH' : aiIndicators >= 2 ? 'MEDIUM' : 'LOW',
                details: {
                    analyses: {
                        burstiness,
                        vocabulary,
                        complexity,
                        repetition,
                        transitions
                    },
                    aiIndicators: `${aiIndicators}/5 indicators suggest AI`,
                    plain: `Statistical Analysis Results:\n\n` +
                           `Overall AI Score: ${weightedScore.toFixed(1)}%\n` +
                           `Confidence: ${aiIndicators >= 3 ? 'HIGH' : aiIndicators >= 2 ? 'MEDIUM' : 'LOW'}\n\n` +
                           `${burstiness.explanation}\n` +
                           `${vocabulary.explanation}\n` +
                           `${complexity.explanation}\n` +
                           `${repetition.explanation}\n` +
                           `${transitions.explanation}\n\n` +
                           `${aiIndicators}/5 statistical indicators suggest AI-generated content.`
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
                    plain: `Error during statistical analysis: ${error.message}`
                }
            };
        }
    }
};

exports = module.exports = detector;
