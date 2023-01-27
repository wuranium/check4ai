/*!
 * check4ai.libraryLoader
 * Copyright(c) 2023 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

/**
 * Constant parameters.
 */
const CONST_LIBRARIES_FOLDER = __dirname + "/../detectors/";

/**
 * Expose `libraryLoader()`.
 */

exports = module.exports = {
    loadCheckers:loadCheckers
};
function loadCheckers() {

    const isFolderExist = fs.existsSync(CONST_LIBRARIES_FOLDER);

    if(!isFolderExist) {
        return;
    }

    const files = fs.readdirSync(CONST_LIBRARIES_FOLDER);
    const libraries = [];

    for (const file of files) {
        libraries.push(require(CONST_LIBRARIES_FOLDER + file));
    }

    return libraries;

}

