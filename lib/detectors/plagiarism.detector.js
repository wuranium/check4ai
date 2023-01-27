/*!
 * check4ai.plagiarismDetector
 * Copyright(c) 2023 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const hooke = require('hookejs');

const CONSTANTS = require('../util/constant');

const detector = {
    name: "Plagiarism Detector",
    detect: async function ({
                                text,
                                minScore = 5,
                                language = "english",
                                shingleSize = 2,
                                apikey = process.env.G_API_KEY,
                                engineid = process.env.G_ENGINE_ID,
                                maximumGap = 3,
                                minimumClusterSize = 5
                            } = {}) {

        if(!text) {
            return;
        }

        const results = await hooke.match({text, replace: true})

        let report = "";
        let score = 0;

        for (const result of results) {
            for (const singleMatch of result.matches) {
                if (singleMatch.score >= minScore) {
                    score = singleMatch.score;
                    report += `\nFROM ${result.source} ORIGINAL: ${text.slice(
                            singleMatch.inputStart,
                            singleMatch.inputEnd
                        )} COMPARED: ${result.text.slice(
                            singleMatch.comparedStart,
                            singleMatch.comparedEnd
                        )} SCORE: ${singleMatch.score}\n`;
                }
            }
        }

        return {
            author: score > minScore ? CONSTANTS.AUTHOR_TYPE.AI : CONSTANTS.AUTHOR_TYPE.HUMAN,
            score,
            report
        }
    }
};

exports = module.exports = detector;

