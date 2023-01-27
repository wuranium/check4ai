'use strict'

const {expect, assert} = require('chai');
const libraryLoader = require('../lib/util/library.loader');

const CHECKERS_FOLDER = "../lib/checkers";

describe('util.library.loader.loadLibraries()', function(){

    it('should have be an array.', function(){

        const libraries = libraryLoader.loadCheckers();

        expect(libraries).to.be.a('Array', 'Libraries should be an array.');
    });

})
