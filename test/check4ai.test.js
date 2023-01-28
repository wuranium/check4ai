'use strict'

const check4ai = require('../')();
const chai = require('chai');
const {expect, assert} = chai;
const should = chai.should();

const CONSTANT = require('../lib/util/constant');

const AI_TEXT = 'Sherlock Holmes (/ˈʃɜːrlɒk ˈhoʊmz/ or /-ˈhoʊlmz/) is a fictional private detective created by British author Sir Arthur Conan Doyle. Referring to himself as a "consulting detective" in the stories, Holmes is known for his proficiency with observation, deduction, forensic science, and logical reasoning that borders on the fantastic, which he employs when investigating cases for a wide variety of clients, including Scotland Yard.';

describe('check4ai()', function () {

    describe('check4ai().detectors()', function () {

        it('should have filled detector list', function () {
            expect(check4ai).to.have.property('detectors').with.property('length').gte(1, 'Checker must be an object which has detect property at least 1 item.');
        });

    });

    describe('check4ai().getDetector()', async function () {

        it('should be able to get proper detector with code', async function () {
            const detector = await check4ai.getDetector(CONSTANT.DETECTOR_TYPE.GLTR_DETECTOR);
            assert.equal(detector.detectorCode, CONSTANT.DETECTOR_TYPE.GLTR_DETECTOR, `It should be ${CONSTANT.DETECTOR_TYPE.GLTR_DETECTOR}`) ;
        });

    });

    describe('check4ai().checkText()', async function () {

        it('should not create any report', async function () {
            const result = await check4ai.checkText();
            assert.equal(result, undefined, 'Should not create any report');
        });

        it('should create a report', async function () {
            this.timeout(20000);

            const result = await check4ai.checkText({text: AI_TEXT});
            result.should.be.a('Object', 'Result should be an object').with.property('author', CONSTANT.AUTHOR_TYPE.AI, "Result should have at least 1 meaningfull report");
        });

    });

});
