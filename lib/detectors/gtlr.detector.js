/*!
 * check4ai.gtlrDetector
 * Copyright(c) 2023 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const http = require('axios');
const CONSTANTS = require('../util/constant');

const detector = {
    name: "GTLR Detector",
    detect: async function ({
                                text,
                                highPossibilityRankTreshold = 10,
                                middlePossibilityRankTreshold = 100,
                                lessPossibilityRankTreshold = 1000,
                                language = "english",
                                aiScorePercentageTreshold = 40
                            } = {}) {

        if (!text) {
            return;
        }

        const result = await http.post("http://gltr.io/api/analyze", {project: 'gpt-2-small', text})

        if (result.status !== 200) {
            return {
                author: CONSTANTS.AUTHOR_TYPE.UNKNOWN,
                score: -1,
                report: 'Failed to connect GTLR'
            }
        }

        const realTopkArray = result.data.result.real_topk;

        const evaluatedResult = await realTopkArray.map((val) => {
            const rank = val[0];

            return {
                high: (rank > 0 && rank <= highPossibilityRankTreshold) ? 1 : 0,
                midd: (rank > highPossibilityRankTreshold && rank <= middlePossibilityRankTreshold) ? 1 : 0,
                less: (rank > middlePossibilityRankTreshold && rank <= lessPossibilityRankTreshold) ? 1 : 0,
                never: (rank > lessPossibilityRankTreshold) ? 1 : 0,
            }
        }).reduce((r, i) => {
            return {
                ...{r}, ...{
                    high: r.high + i.high,
                    midd: r.midd + i.midd,
                    less: r.less + i.less,
                    never: r.never + i.never,
                }
            };
        });

        const detectedAiTrackScore = (evaluatedResult.high / (evaluatedResult.high + evaluatedResult.midd + evaluatedResult.less + evaluatedResult.never)) * 100

        return {
            author: detectedAiTrackScore > aiScorePercentageTreshold ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
            score: detectedAiTrackScore
        }
    }
};

exports = module.exports = detector;

