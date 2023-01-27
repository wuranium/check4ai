'use strict'

const check4ai = require('../')();
const chai = require('chai');
const {expect, assert} = chai;
const should = chai.should();

const CONSTANT = require('../lib/util/constant');

const AI_TEXT = 'Sherlock Holmes (/ˈʃɜːrlɒk ˈhoʊmz/ or /-ˈhoʊlmz/) is a fictional private detective created by British author Sir Arthur Conan Doyle. Referring to himself as a "consulting detective" in the stories, Holmes is known for his proficiency with observation, deduction, forensic science, and logical reasoning that borders on the fantastic, which he employs when investigating cases for a wide variety of clients, including Scotland Yard.';

describe('checkers.plagiarism.detector()', function () {

    it('should have filled checker list', function () {
        expect(check4ai).to.have.property('detectors').with.property('length').gte(1, 'Checker must be an object which has detect property at least 1 item.');
    });

    it('should not create any report', function () {
        const result = check4ai.checkText();
        assert.equal(result, undefined, 'Should not create any report');
    });

    it('should create a report', function () {
        const result = check4ai.checkText(AI_TEXT);
        result.should.be.a('Array', 'Result should be an array').with.property('length').gte(1, "Result should have at least 1 meaningfull report");
    });

});

