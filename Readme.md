# check4ai
[![NPM Version][npm-version-image]][npm-url]
![](https://github.com/wuranium/check4ai/workflows/Node.js%20CI/badge.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![Codecov Coverage Status][code-coverage-url]][code-coverage-url]

You deserve to know who is the actual author a text! A human or a machine? Check4Ai is a javascript library which helps you to figure out whether a text written by a human or an AI like ChatGPT.

## Disclaimer: 
This library has beta version for now. Some functions may not be able to not work properly.

## Getting Started

Make sure you have [Node.js](https://nodejs.org) installed. To run this locally, you first need to install the dependencies. Run the following:

```bash
npm install check4ai
```

## Usage

If you have to use plagiarism detector, it is default used by check4ai, you have to get ```G_API_KEY```. Then you have to add an ```.env``` file in your project root. So that you can add following to:

```bash
G_API_KEY=<YOUR-API-KEY-FROM-GOOGLE-CONSOLE>
G_ENGINE_ID=<YOUR-ENGINE-ID-FROM-GOOGLE-CONSOLE>
```

You can use default checker methor with check4ai.checkText()
```javascript
const check4ai = require("check4ai")()
const targetText = `In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English.\n' +
    'The scientist named the population, after their distinctive horn, Ovid\'s Unicorn. These four-horned, silver-white unicorns were previously unknown to science.\n' +
    'Now, after almost two centuries, the mystery of what sparked this odd phenomenon is finally solved.\n' +
    'Dr. Jorge Pérez, an evolutionary biologist from the University of La Paz, and several companions, were exploring the Andes Mountains when they found a small valley, with no other animals or humans. Pérez noticed that the valley had what appeared to be a natural fountain, surrounded by two peaks of rock and silver snow.\n' +
    'Pérez and the others then ventured further into the valley. "By the time we reached the top of one peak, the water looked blue, with some crystals on top," said Pérez.\n' +
    'Pérez and his friends were astonished to see the unicorn herd. These creatures could be seen from the air without having to move too much to see them – they were so close they could touch their horns.\n' +
    'While examining these bizarre creatures the scientists discovered that the creatures also spoke some fairly regular English. Pérez stated, "We can see, for example, that they have a common \'language,\' something like a dialect or dialectic."\n' +
    'Dr. Pérez believes that the unicorns may have originated in Argentina, where the animals were believed to be descendants of a lost race of people who lived there before the arrival of humans in those parts of South America.\n' +
    'While their origins are still unclear, some believe that perhaps the creatures were created when a human and a unicorn met each other in a time before human civilization. According to Pérez, "In South America, such incidents seem to be quite common."\n' 
    'However, Pérez also pointed out that it is likely that the only way of knowing for sure if unicorns are indeed the descendants of a lost alien race is through DNA. "But they seem to be able to communicate in English quite well, which I believe is a sign of evolution, or at least a change in social organization," said the scientist.`
const result = check4ai.checkText({text: targetText})
console.log(result)
```

Or if you want to detect something with specific detector, you can pick particular detectors in check4ai.detectors list

```javascript
const detectors = require("check4ai")()
const targetText = `In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English.\n' +
    'The scientist named the population, after their distinctive horn, Ovid\'s Unicorn. These four-horned, silver-white unicorns were previously unknown to science.\n' +
    'Now, after almost two centuries, the mystery of what sparked this odd phenomenon is finally solved.\n' +
    'Dr. Jorge Pérez, an evolutionary biologist from the University of La Paz, and several companions, were exploring the Andes Mountains when they found a small valley, with no other animals or humans. Pérez noticed that the valley had what appeared to be a natural fountain, surrounded by two peaks of rock and silver snow.\n' +
    'Pérez and the others then ventured further into the valley. "By the time we reached the top of one peak, the water looked blue, with some crystals on top," said Pérez.\n' +
    'Pérez and his friends were astonished to see the unicorn herd. These creatures could be seen from the air without having to move too much to see them – they were so close they could touch their horns.\n' +
    'While examining these bizarre creatures the scientists discovered that the creatures also spoke some fairly regular English. Pérez stated, "We can see, for example, that they have a common \'language,\' something like a dialect or dialectic."\n' +
    'Dr. Pérez believes that the unicorns may have originated in Argentina, where the animals were believed to be descendants of a lost race of people who lived there before the arrival of humans in those parts of South America.\n' +
    'While their origins are still unclear, some believe that perhaps the creatures were created when a human and a unicorn met each other in a time before human civilization. According to Pérez, "In South America, such incidents seem to be quite common."\n' 
    'However, Pérez also pointed out that it is likely that the only way of knowing for sure if unicorns are indeed the descendants of a lost alien race is through DNA. "But they seem to be able to communicate in English quite well, which I believe is a sign of evolution, or at least a change in social organization," said the scientist.`
const result = check4ai.checkText({text: targetText})
console.log(result)
```

Tests:

```bash
npm run test
```

## Credits

Thanks to Hendrik Strobelt, Sebastian Gehrmann, and Alexander Rush from the MIT-IBM Watson AI lab and Harvard NLP for creating an awesome Giant Language Model [GLTR](https://github.com/HendrikStrobelt/detecting-fake-text)!

Thanks to hhhhhhhhhn for [HookeJS](https://github.com/hhhhhhhhhn/hookejs) for creating an awesome Giant Language Model)!

## Note

This package can a google custom search api key and engine id, which can be accesed through function parameters or the G_API_KEY and G_ENGINE_ID enviroment variables. If not provided, it will scrape the results (use at your own risk)

[npm-downloads-image]: https://badgen.net/npm/dm/check4ai
[npm-downloads-url]: https://npmcharts.com/compare/check4ai?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/check4ai
[npm-url]: https://npmjs.org/package/check4ai
[npm-version-image]: https://badgen.net/npm/v/check4ai
[code-coverage-url]: https://img.shields.io/codecov/c/github/wuranium/check4ai.svg?style=flat-square
