/*!
 * check4ai.plagiarismDetector
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const hooke = require('hookejs');
const CONSTANTS = require('../util/constant');

/**
 * Plagiarism Detector
 *
 * Searches for duplicate content online to detect copy-pasted AI-generated text.
 * Uses HookeJS for web searching.
 *
 * NOTE: This detector requires internet access and may have rate limits.
 * High plagiarism scores can indicate:
 * 1. AI-generated content copied from training data
 * 2. Text copied from other sources
 * 3. Common phrases that appear in many places
 */

const detector = {
    name: "Plagiarism Detector",
    detectorCode: CONSTANTS.DETECTOR_TYPE.PLAGIARISM_DETECTOR,

    detect: async function ({
                                text,
                                minScore = 5,
                                language = "english",
                                shingleSize = 2,
                                apikey = process.env.G_API_KEY,
                                engineid = process.env.G_ENGINE_ID,
                                maximumGap = 3,
                                minimumClusterSize = 5,
                                timeout = 30000
                            } = {}) {

        if (!text) {
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: 'No text provided',
                    plain: 'No text provided for analysis'
                }
            };
        }

        if (text.length < 50) {
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: 'Text too short',
                    plain: 'Text must be at least 50 characters for plagiarism detection'
                }
            };
        }

        try {
            // Use HookeJS to search for matches
            const results = await Promise.race([
                hooke.match({ text, replace: true }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Plagiarism check timeout')), timeout)
                )
            ]);

            let report = "";
            let maxScore = 0;
            let totalMatches = 0;
            const sources = new Set();

            for (const result of results) {
                if (result.matches && result.matches.length > 0) {
                    for (const singleMatch of result.matches) {
                        if (singleMatch.score >= minScore) {
                            totalMatches++;
                            maxScore = Math.max(maxScore, singleMatch.score);
                            sources.add(result.source);

                            report += `\nSource: ${result.source}\n` +
                                     `Original: "${text.slice(singleMatch.inputStart, singleMatch.inputEnd)}"\n` +
                                     `Match: "${result.text.slice(singleMatch.comparedStart, singleMatch.comparedEnd)}"\n` +
                                     `Similarity Score: ${singleMatch.score}\n`;
                        }
                    }
                }
            }

            // Calculate normalized score (0-100)
            const normalizedScore = Math.min((maxScore / 20) * 100, 100);

            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: maxScore > minScore ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
                score: normalizedScore,
                confidence: maxScore > 15 ? 'HIGH' : maxScore > 8 ? 'MEDIUM' : 'LOW',
                details: {
                    maxMatchScore: maxScore,
                    totalMatches: totalMatches,
                    uniqueSources: sources.size,
                    sources: Array.from(sources),
                    plain: totalMatches > 0
                        ? `Found ${totalMatches} plagiarism match(es) from ${sources.size} source(s):\n${report}`
                        : 'No significant plagiarism detected. Text appears to be original.',
                    result: results,
                    note: 'High similarity can indicate AI-generated content copied from training data or human plagiarism'
                }
            };

        } catch (error) {
            console.warn('Plagiarism detector error:', error.message);

            // Graceful degradation - return unknown instead of failing
            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: error.message,
                    plain: `Plagiarism check failed: ${error.message}. ` +
                           `This may be due to network issues, rate limiting, or service unavailability. ` +
                           `The detector will be skipped for this analysis.`,
                    note: 'Consider using the Statistical or Pattern detectors for offline analysis'
                }
            };
        }
    }
};

exports = module.exports = detector;

