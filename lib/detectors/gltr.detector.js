/*!
 * check4ai.gltrDetector
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const httpHelper = require('../util/http.helper');
const CONSTANTS = require('../util/constant');

/**
 * GLTR (Giant Language Model Test Room) Detector
 *
 * NOTE: The GLTR API may be unreliable or unavailable.
 * This detector now includes graceful error handling and retry logic.
 * If the API is unavailable, it will return UNKNOWN status instead of failing.
 *
 * GLTR analyzes text by checking token predictability using GPT-2.
 * While GPT-2 is older, high predictability can still indicate AI generation.
 */

const detector = {
    name: "GLTR Detector",
    detectorCode: CONSTANTS.DETECTOR_TYPE.GLTR_DETECTOR,

    detect: async function ({
                                text,
                                highPossibilityRankThreshold = 10,
                                middlePossibilityRankThreshold = 100,
                                lessPossibilityRankThreshold = 1000,
                                language = "english",
                                aiScorePercentageThreshold = 40,
                                retries = 2, // Reduced retries since API often unavailable
                                timeout = 15000 // 15 second timeout
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

        try {
            // Try to call GLTR API with retry logic
            const result = await httpHelper.post(
                "http://gltr.io/api/analyze",
                { project: 'gpt-2-small', text },
                { retries, timeout }
            );

            // Check if request failed
            if (httpHelper.isError(result)) {
                console.warn(`GLTR API unavailable (status: ${result.status}): ${result.message}`);

                return {
                    detectorName: this.name,
                    detectorCode: this.detectorCode,
                    author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                    score: 0,
                    details: {
                        error: `GLTR API unavailable (${result.status})`,
                        plain: `GLTR service is currently unavailable. The API returned status ${result.status}. ` +
                               `This detector cannot provide results at this time. ` +
                               `Consider using the Statistical or Pattern detectors instead.`,
                        apiStatus: result.status,
                        apiMessage: result.message
                    }
                };
            }

            // Parse GLTR response
            const realTopkArray = result.data?.result?.real_topk;

            if (!realTopkArray || !Array.isArray(realTopkArray)) {
                return {
                    detectorName: this.name,
                    detectorCode: this.detectorCode,
                    author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                    score: 0,
                    details: {
                        error: 'Invalid GLTR response format',
                        plain: 'GLTR returned an invalid response format'
                    }
                };
            }

            // Analyze token rankings
            const evaluatedResult = realTopkArray.reduce((acc, curr) => {
                const rank = curr[0];
                let type = 'unknown';

                if (rank > 0 && rank <= highPossibilityRankThreshold) {
                    type = 'high';
                } else if (rank > highPossibilityRankThreshold && rank <= middlePossibilityRankThreshold) {
                    type = 'midd';
                } else if (rank > middlePossibilityRankThreshold && rank <= lessPossibilityRankThreshold) {
                    type = 'less';
                } else if (rank > lessPossibilityRankThreshold) {
                    type = 'never';
                }

                acc[type] = acc[type] ? acc[type] + 1 : 1;

                return acc;
            }, {});

            const totalTokens = evaluatedResult.high + evaluatedResult.midd +
                               evaluatedResult.less + evaluatedResult.never;
            const detectedAiTrackScore = (evaluatedResult.high / totalTokens) * 100;

            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: detectedAiTrackScore > aiScorePercentageThreshold
                    ? CONSTANTS.AUTHOR_TYPE.AI
                    : CONSTANTS.AUTHOR_TYPE.HUMAN,
                score: detectedAiTrackScore,
                confidence: detectedAiTrackScore > 60 || detectedAiTrackScore < 30 ? 'HIGH' : 'MEDIUM',
                details: {
                    tokenDistribution: evaluatedResult,
                    highPredictabilityPercentage: ((evaluatedResult.high / totalTokens) * 100).toFixed(1),
                    plain: `GLTR Analysis: ${detectedAiTrackScore.toFixed(1)}% of tokens were highly predictable. ` +
                           `Distribution: ${evaluatedResult.high} high, ${evaluatedResult.midd} medium, ` +
                           `${evaluatedResult.less} low, ${evaluatedResult.never} very low predictability. ` +
                           `Note: GLTR uses GPT-2 (2019) and may not detect modern AI models accurately.`,
                    result: result.data.result,
                    note: 'GLTR is based on GPT-2 and may not accurately detect modern LLMs like GPT-4, Claude, or Gemini'
                }
            };

        } catch (error) {
            console.error('GLTR detector error:', error.message);

            return {
                detectorName: this.name,
                detectorCode: this.detectorCode,
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: 0,
                details: {
                    error: error.message,
                    plain: `GLTR analysis failed: ${error.message}. ` +
                           `The GLTR service may be unavailable. ` +
                           `Please try using the Statistical or Pattern detectors instead.`
                }
            };
        }
    }
};

exports = module.exports = detector;

