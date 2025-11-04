/*!
 * check4ai
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */
const libraryLoader = require('./util/library.loader');
const CONSTANTS = require("./util/constant");
const Cache = require('./util/cache');
const franc = require('franc');

/**
 * Check4AI - Modern AI Content Detection Library
 *
 * Detects AI-generated content using multiple detection methods:
 * - Statistical Analysis (burstiness, vocabulary, complexity)
 * - Pattern Detection (common AI phrases and structures)
 * - GLTR (token predictability, may be unavailable)
 * - Plagiarism Detection (online content matching)
 */

const check4ai = function (options = {}) {
    // Initialize cache
    const cache = new Cache({
        enabled: options.cache !== false,
        ttl: options.cacheTTL || 3600000, // 1 hour
        maxSize: options.cacheMaxSize || 1000
    });

    return {
        detectors: libraryLoader.loadCheckers(),
        cache: cache,

        /**
         * Get a specific detector by code
         */
        getDetector: async function (code) {
            return this.detectors.find(value => value.detectorCode === code);
        },

        /**
         * Detect language of the text
         */
        detectLanguage: function(text) {
            try {
                const langCode = franc(text, { minLength: 10 });
                const langMap = {
                    'eng': 'english',
                    'spa': 'spanish',
                    'fra': 'french',
                    'deu': 'german',
                    'ita': 'italian',
                    'por': 'portuguese',
                    'rus': 'russian',
                    'jpn': 'japanese',
                    'kor': 'korean',
                    'chi': 'chinese',
                    'ara': 'arabic'
                };

                return {
                    code: langCode,
                    name: langMap[langCode] || 'unknown',
                    confidence: langCode !== 'und' ? 'high' : 'low'
                };
            } catch (error) {
                return {
                    code: 'und',
                    name: 'unknown',
                    confidence: 'low'
                };
            }
        },

        /**
         * Main text checking function
         *
         * @param {Object} options
         * @param {string} options.text - Text to analyze
         * @param {Array} options.useDetectors - Detector codes to use (default: all available)
         * @param {boolean} options.skipCache - Skip cache for this request
         * @param {boolean} options.detectLanguage - Detect text language
         * @param {number} options.confidenceThreshold - Minimum confidence for definitive results
         * @param {Object} options.weights - Custom weights for each detector
         */
        checkText: async function ({
            text,
            useDetectors = [
                CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR,
                CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR,
                CONSTANTS.DETECTOR_TYPE.GLTR_DETECTOR,
                CONSTANTS.DETECTOR_TYPE.PLAGIARISM_DETECTOR,
            ],
            skipCache = false,
            detectLanguage = true,
            confidenceThreshold = 60,
            weights = null
        } = {}) {

            if (!text || typeof text !== 'string') {
                throw new Error('Text parameter is required and must be a string');
            }

            if (text.trim().length < 50) {
                return {
                    author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                    confidence: 'LOW',
                    percent: 0,
                    error: 'Text too short for reliable analysis (minimum 50 characters)',
                    detailedResults: []
                };
            }

            // Check cache
            if (!skipCache) {
                const cacheKey = cache.generateKey(text, useDetectors.join(','));
                const cached = cache.get(cacheKey);
                if (cached) {
                    cached.fromCache = true;
                    return cached;
                }
            }

            // Detect language if requested
            let language = null;
            if (detectLanguage) {
                language = this.detectLanguage(text);
            }

            // Run detectors
            const detectorsResult = [];
            const validResults = [];

            for (const detector of this.detectors) {
                if (useDetectors.indexOf(detector.detectorCode) > -1) {
                    try {
                        const result = await detector.detect({ text });
                        detectorsResult.push(result);

                        // Only use results that are not UNKNOWN for final decision
                        if (result.author !== CONSTANTS.AUTHOR_TYPE.UNKNOWN) {
                            validResults.push(result);
                        }
                    } catch (error) {
                        console.error(`Detector ${detector.detectorCode} failed:`, error.message);
                        detectorsResult.push({
                            detectorName: detector.name,
                            detectorCode: detector.detectorCode,
                            author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                            score: 0,
                            details: {
                                error: error.message
                            }
                        });
                    }
                }
            }

            if (validResults.length === 0) {
                const result = {
                    author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                    confidence: 'NONE',
                    percent: 0,
                    error: 'No detectors were able to analyze the text',
                    language: language,
                    detailedResults: detectorsResult,
                    analysis: {
                        totalDetectors: detectorsResult.length,
                        workingDetectors: 0,
                        aiVotes: 0,
                        humanVotes: 0,
                        unknownVotes: detectorsResult.length
                    }
                };

                return result;
            }

            // Calculate weighted scores
            const defaultWeights = {
                [CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR]: 0.30,
                [CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR]: 0.30,
                [CONSTANTS.DETECTOR_TYPE.GLTR_DETECTOR]: 0.25,
                [CONSTANTS.DETECTOR_TYPE.PLAGIARISM_DETECTOR]: 0.15
            };

            const actualWeights = weights || defaultWeights;

            // Calculate votes and weighted score
            let aiVotes = 0;
            let humanVotes = 0;
            let unknownVotes = 0;
            let weightedScore = 0;
            let totalWeight = 0;

            for (const result of detectorsResult) {
                if (result.author === CONSTANTS.AUTHOR_TYPE.AI) {
                    aiVotes++;
                    const weight = actualWeights[result.detectorCode] || 0.25;
                    weightedScore += result.score * weight;
                    totalWeight += weight;
                } else if (result.author === CONSTANTS.AUTHOR_TYPE.HUMAN) {
                    humanVotes++;
                    const weight = actualWeights[result.detectorCode] || 0.25;
                    weightedScore += (100 - result.score) * weight;
                    totalWeight += weight;
                } else {
                    unknownVotes++;
                }
            }

            // Normalize weighted score
            if (totalWeight > 0) {
                weightedScore = weightedScore / totalWeight;
            }

            // Determine final author
            let finalAuthor;
            let finalPercent;
            let confidence;

            if (validResults.length === 0) {
                finalAuthor = CONSTANTS.AUTHOR_TYPE.UNKNOWN;
                finalPercent = 0;
                confidence = 'NONE';
            } else if (aiVotes > humanVotes) {
                finalAuthor = CONSTANTS.AUTHOR_TYPE.AI;
                finalPercent = weightedScore;
                confidence = weightedScore >= 70 ? 'HIGH' : weightedScore >= 55 ? 'MEDIUM' : 'LOW';
            } else if (humanVotes > aiVotes) {
                finalAuthor = CONSTANTS.AUTHOR_TYPE.HUMAN;
                finalPercent = 100 - weightedScore;
                confidence = (100 - weightedScore) >= 70 ? 'HIGH' : (100 - weightedScore) >= 55 ? 'MEDIUM' : 'LOW';
            } else {
                // Tie - use weighted score to decide
                finalAuthor = weightedScore >= 50 ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN;
                finalPercent = weightedScore >= 50 ? weightedScore : 100 - weightedScore;
                confidence = 'LOW'; // Ties indicate uncertainty
            }

            const result = {
                author: finalAuthor,
                confidence: confidence,
                percent: Math.round(finalPercent * 10) / 10,
                language: language,
                detailedResults: detectorsResult,
                analysis: {
                    totalDetectors: detectorsResult.length,
                    workingDetectors: validResults.length,
                    aiVotes: aiVotes,
                    humanVotes: humanVotes,
                    unknownVotes: unknownVotes,
                    weightedScore: Math.round(weightedScore * 10) / 10,
                    recommendation: this.getRecommendation(finalAuthor, confidence, validResults.length)
                }
            };

            // Cache the result
            if (!skipCache) {
                const cacheKey = cache.generateKey(text, useDetectors.join(','));
                cache.set(cacheKey, result);
            }

            return result;
        },

        /**
         * Get recommendation based on results
         */
        getRecommendation: function(author, confidence, workingDetectors) {
            if (workingDetectors === 0) {
                return 'Unable to analyze text. Please check your internet connection and try again.';
            }

            if (confidence === 'HIGH') {
                if (author === CONSTANTS.AUTHOR_TYPE.AI) {
                    return 'Text appears to be AI-generated with high confidence.';
                } else {
                    return 'Text appears to be human-written with high confidence.';
                }
            } else if (confidence === 'MEDIUM') {
                if (author === CONSTANTS.AUTHOR_TYPE.AI) {
                    return 'Text likely AI-generated, but consider manual review.';
                } else {
                    return 'Text likely human-written, but consider manual review.';
                }
            } else {
                return 'Uncertain results. Manual review recommended. Consider providing more text for better analysis.';
            }
        },

        /**
         * Get cache statistics
         */
        getCacheStats: function() {
            return this.cache.getStats();
        },

        /**
         * Clear cache
         */
        clearCache: function() {
            this.cache.clear();
        }
    }
}


/**
 * Expose `check4ai()`.
 */

exports = module.exports = check4ai;
