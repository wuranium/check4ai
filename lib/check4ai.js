/*!
 * check4ai
 * Copyright(c) 2023 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */
const libraryLoader = require('./util/library.loader');
const CONSTANTS = require("./util/constant");

const check4ai = function () {
    return {
        detectors: libraryLoader.loadCheckers(),
        getDetector: async function (code) {
            return this.detectors.find(value => value.detectorCode === code);
        },
        checkText: async function ({
                                 text,
                                 useDetectors = [
                                     CONSTANTS.DETECTOR_TYPE.GLTR_DETECTOR,
                                     CONSTANTS.DETECTOR_TYPE.PLAGIARISM_DETECTOR,
                                 ]
                             } = {}) {

            if (!text) {
                return;
            }

            const detectorsResult = [];

            for (const detector of this.detectors) {
                if(useDetectors.indexOf(detector.detectorCode) > -1) {
                    detectorsResult.push(await detector.detect({text}));
                }
            }

            const summarizedResult = await detectorsResult.reduce((acc, curr) => {

                acc[curr.author] = acc[curr.author] ? acc[curr.author] + 1 : 1;
                acc.total = acc.total ? acc.total + 1 : 1;

                if(acc[curr.author] > (acc.winnerAuthorResultCount ? acc.winnerAuthorResultCount : 0)) {
                    acc.winnerAuthorResultCount = acc[curr.author];
                    acc.winnerAuthorPercent = (acc[curr.author] / acc.total) * 100
                    acc.winnerAuthor = curr.author;
                }

                return acc;

            }, {});

            return {
                author: summarizedResult.winnerAuthor,
                percent: summarizedResult.winnerAuthorPercent,
                detailedResults: detectorsResult
            }
        }
    }
}


/**
 * Expose `check4ai()`.
 */

exports = module.exports = check4ai;
