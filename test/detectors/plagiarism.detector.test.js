'use strict'
const chai = require('chai');
const { expect, assert } = chai;
const should = chai.should();
const dotenv = require('dotenv');

const plagiarismDetector = require('../../lib/detectors/plagiarism.detector');
const CONSTANT = require('../../lib/util/constant');

const HUMAN_TEXT = 'I like human beings but as a machine learning dumb I dont know how can I express myself to a person. Yes. I\'m a human.';
const AI_TEXT = 'Sherlock Holmes (/ˈʃɜːrlɒk ˈhoʊmz/ or /-ˈhoʊlmz/) is a fictional private detective created by British author Sir Arthur Conan Doyle. Referring to himself as a "consulting detective" in the stories, Holmes is known for his proficiency with observation, deduction, forensic science, and logical reasoning that borders on the fantastic, which he employs when investigating cases for a wide variety of clients, including Scotland Yard.';

describe('checkers.plagiarism.detector()', function(){

    dotenv.config();

    it('should be an object', function(){
        expect(plagiarismDetector).to.be.a('Object', 'Detector should be an object.');
    });

    it('should have a name "Plagiarism Checker" ', function(){
        plagiarismDetector.should.have.property('name', 'Plagiarism Detector', 'Value of name should be "Plagiarism Detector"');
    });

    it('should be able to detect text from an "AI"', async function(){

        this.timeout(0);

        const result = await plagiarismDetector.detect({text: AI_TEXT});

        result.should.have.property('author', CONSTANT.AUTHOR_TYPE.AI, 'Author should be "AI"');
        console.log(result);

    });

    it('should be able to detect text from an "HUMAN"', async function(){

        this.timeout(0);

        const result = await plagiarismDetector.detect({text: HUMAN_TEXT});

        result.should.have.property('author', CONSTANT.AUTHOR_TYPE.HUMAN, 'Author should be "HUMAN"');
        console.log(result.report);

    });

});
