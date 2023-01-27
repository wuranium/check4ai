'use strict'
const chai = require('chai');
const {expect, assert} = chai;
const should = chai.should();
const dotenv = require('dotenv');

const gtlrDetector = require('../../lib/detectors/gtlr.detector');
const CONSTANT = require('../../lib/util/constant');

const AI_TEXT_1 = 'In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English.\n' +
    'The scientist named the population, after their distinctive horn, Ovid\'s Unicorn. These four-horned, silver-white unicorns were previously unknown to science.\n' +
    'Now, after almost two centuries, the mystery of what sparked this odd phenomenon is finally solved.\n' +
    'Dr. Jorge Pérez, an evolutionary biologist from the University of La Paz, and several companions, were exploring the Andes Mountains when they found a small valley, with no other animals or humans. Pérez noticed that the valley had what appeared to be a natural fountain, surrounded by two peaks of rock and silver snow.\n' +
    'Pérez and the others then ventured further into the valley. "By the time we reached the top of one peak, the water looked blue, with some crystals on top," said Pérez.\n' +
    'Pérez and his friends were astonished to see the unicorn herd. These creatures could be seen from the air without having to move too much to see them – they were so close they could touch their horns.\n' +
    'While examining these bizarre creatures the scientists discovered that the creatures also spoke some fairly regular English. Pérez stated, "We can see, for example, that they have a common \'language,\' something like a dialect or dialectic."\n' +
    'Dr. Pérez believes that the unicorns may have originated in Argentina, where the animals were believed to be descendants of a lost race of people who lived there before the arrival of humans in those parts of South America.\n' +
    'While their origins are still unclear, some believe that perhaps the creatures were created when a human and a unicorn met each other in a time before human civilization. According to Pérez, "In South America, such incidents seem to be quite common."\n' +
    'However, Pérez also pointed out that it is likely that the only way of knowing for sure if unicorns are indeed the descendants of a lost alien race is through DNA. "But they seem to be able to communicate in English quite well, which I believe is a sign of evolution, or at least a change in social organization," said the scientist.';

const AI_TEXT_2 = 'My responses can be identified as coming from ChatGPT because they will be generated using the patterns and information that the model was trained on. Additionally, the responses will be generated using the same language and style as what the model was trained on. Also, if you have any doubts you could check the source of the information you are receiving.'

const HUMAN_TEXT = 'LinkedIn Sales Navigator taps into the power of LinkedIn\'s 800M+ member network to help Sales professionals find and build relationships with prospects and customers through modern selling.\n' +
    'With Sales Navigator you can:\n' +
    'Target the right people and companies faster.\n' +
    'Understand key insights and keep track of real-time company changes.\n' +
    'Reach and engage with prospecting leads using tools like InMail, Smart Links, and TeamLink.\n' +
    'and much more.\n' +
    'Interested in Sales Navigator? Request a demo today.';

describe('checkers.gtlr.detector()', function () {

    dotenv.config();

    it('should be an object', function () {
        expect(gtlrDetector).to.be.a('Object', 'Detector should be an object.');
    });

    it('should have a name "GTLR Detector" ', function () {
        gtlrDetector.should.have.property('name', 'GTLR Detector', 'Value of name should be "GTLR Detector"');
    });

    it('should be able to detect text from an "AI"', async function () {

        this.timeout(0);

        const result1 = await gtlrDetector.detect({text: AI_TEXT_1});
        const result2 = await gtlrDetector.detect({text: AI_TEXT_2});

        console.log(result1);
        console.log(result2);

        result1.should.have.property('author', CONSTANT.AUTHOR_TYPE.AI, 'Author for AI_TEXT_1 should be "AI"');
        result2.should.have.property('author', CONSTANT.AUTHOR_TYPE.AI, 'Author for AI_TEXT_2 should be "AI"');

        console.log(result1);
        console.log(result2);

    });

    it('should be able to detect text from an "HUMAN"', async function () {

        this.timeout(0);

        const result = await gtlrDetector.detect({text: HUMAN_TEXT});

        result.should.have.property('author', CONSTANT.AUTHOR_TYPE.HUMAN, 'Author should be "HUMAN"');
        console.log(result);

    });

});
