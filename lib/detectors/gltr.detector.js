/*!
 * check4ai.gltrDetector
 * Copyright(c) 2023 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const http = require('axios');
const CONSTANTS = require('../util/constant');

const detector = {
    name: "GLTR Detector",
    detectorCode: CONSTANTS.DETECTOR_TYPE.GLTR_DETECTOR,
    detect: async function ({
                                text,
                                highPossibilityRankThreshold = 10,
                                middlePossibilityRankThreshold = 100,
                                lessPossibilityRankThreshold = 1000,
                                language = "english",
                                aiScorePercentageThreshold = 40
                            } = {}) {

        if (!text) {
            return;
        }

        const result = await http.post("http://gltr.io/api/analyze", {project: 'gpt-2-small', text})

        if (result.status !== 200) {
            return {
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: -1,
                report: 'Failed to connect GLTR'
            }
        }

        const realTopkArray = result.data.result.real_topk;

        const evaluatedResult = await realTopkArray.reduce((acc, curr) => {

            const rank = curr[0];
            let type = 'unknown';

            if((rank > 0 && rank <= highPossibilityRankThreshold)) {
                type = 'high';
            } else if(rank > highPossibilityRankThreshold && rank <= middlePossibilityRankThreshold) {
                type = 'midd';
            } else if(rank > middlePossibilityRankThreshold && rank <= lessPossibilityRankThreshold) {
                type = 'less';
            } else if((rank > lessPossibilityRankThreshold)) {
                type = 'never';
            }

            acc[type] = acc[type] ? acc[type] + 1 : 1;

            return acc;
        }, {});

        const detectedAiTrackScore = (evaluatedResult.high / (evaluatedResult.high + evaluatedResult.midd + evaluatedResult.less + evaluatedResult.never)) * 100

        return {
            detectorName: this.name,
            detectorCode: this.detectorCode,
            author: detectedAiTrackScore > aiScorePercentageThreshold ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
            score: detectedAiTrackScore,
            details: {
                plain: undefined,
                result: result.data.result
            }
        }
    }
};

exports = module.exports = detector;

