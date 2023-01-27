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

const check4ai = function () {
    return {
        detectors: libraryLoader.loadCheckers(),
        checkText: function (text) {
            if (!text) {
                return;
            }

            const result = [];

            for (const detector of this.detectors) {
                result.push(detector.detect({text}));
            }

            return result;
        }
    }
}


/**
 * Expose `check4ai()`.
 */

exports = module.exports = check4ai;
