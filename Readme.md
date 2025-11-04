# check4ai

[![NPM Version][npm-version-image]][npm-url]
![](https://github.com/wuranium/check4ai/workflows/Node.js%20CI/badge.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![Codecov Coverage Status][code-coverage-url]][code-coverage-url]

**A modern, powerful JavaScript library for detecting AI-generated content.**

Check4AI helps you identify whether text was written by a human or an AI like ChatGPT, Claude, Gemini, or other modern language models. Using multiple detection methods and advanced statistical analysis, it provides reliable AI detection with confidence scoring.

## ✨ Features

- 🎯 **Multiple Detection Methods**: Statistical analysis, pattern detection, GLTR, and plagiarism checking
- 🚀 **Local Analysis**: Statistical and pattern detectors work offline without API calls
- 🧠 **Modern AI Detection**: Optimized for GPT-4, Claude, Gemini, and other contemporary LLMs
- 📊 **Confidence Scoring**: Get HIGH/MEDIUM/LOW confidence ratings with detailed explanations
- 🌍 **Language Detection**: Automatic language identification for 11+ languages
- 💾 **Smart Caching**: Built-in caching reduces redundant analysis
- ⚡ **Fast & Reliable**: Retry logic with exponential backoff for API calls
- 🛡️ **Graceful Degradation**: Works even when external APIs are unavailable

## 🆕 What's New in v0.0.3-beta

- ✅ **New Statistical Detector**: Analyzes burstiness, vocabulary richness, sentence complexity
- ✅ **New Pattern Detector**: Identifies common AI phrases and writing patterns
- ✅ **Improved GLTR Detector**: Better error handling and retry logic
- ✅ **Enhanced Plagiarism Detection**: Timeout handling and detailed reporting
- ✅ **Built-in Caching**: Automatic result caching with LRU eviction
- ✅ **Language Detection**: Supports 11+ languages with automatic detection
- ✅ **Confidence Scoring**: HIGH/MEDIUM/LOW confidence with recommendations
- ✅ **Security Updates**: All dependencies updated to fix vulnerabilities

## ⚠️ Important Notes

- This library is in **beta**. Some external APIs (GLTR, plagiarism) may be unavailable
- Statistical and Pattern detectors work completely offline
- Minimum text length: 50 characters (100+ recommended for best results)
- Detection accuracy improves with longer text samples

## 📦 Installation

```bash
npm install check4ai
```

## 🚀 Quick Start

### Basic Usage

```javascript
const check4ai = require("check4ai")();

const text = `Your text to analyze goes here...`;

async function detectAI() {
  const result = await check4ai.checkText({ text });

  console.log('Author:', result.author);           // 'AI' or 'HUMAN'
  console.log('Confidence:', result.confidence);   // 'HIGH', 'MEDIUM', or 'LOW'
  console.log('Probability:', result.percent + '%');
  console.log('Recommendation:', result.analysis.recommendation);
}

detectAI();
```

### Expected Output

```javascript
{
  author: 'AI',
  confidence: 'HIGH',
  percent: 78.5,
  language: {
    code: 'eng',
    name: 'english',
    confidence: 'high'
  },
  analysis: {
    totalDetectors: 4,
    workingDetectors: 3,
    aiVotes: 2,
    humanVotes: 1,
    unknownVotes: 1,
    weightedScore: 78.5,
    recommendation: 'Text appears to be AI-generated with high confidence.'
  },
  detailedResults: [
    {
      detectorName: 'Statistical Detector',
      detectorCode: 'STATISTICAL_DETECTOR',
      author: 'AI',
      score: 72.3,
      confidence: 'HIGH',
      details: { ... }
    },
    // ... more detector results
  ]
}
```

## 📚 Advanced Usage

### Using Specific Detectors

```javascript
const check4ai = require("check4ai")();
const CONSTANTS = require("check4ai/lib/util/constant");

const result = await check4ai.checkText({
  text: yourText,
  useDetectors: [
    CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR,  // Offline, fast
    CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR       // Offline, fast
  ]
});
```

### Custom Configuration

```javascript
const check4ai = require("check4ai")({
  cache: true,           // Enable caching (default: true)
  cacheTTL: 3600000,    // Cache for 1 hour (default)
  cacheMaxSize: 1000    // Max cache entries (default)
});

const result = await check4ai.checkText({
  text: yourText,
  skipCache: false,          // Use cache (default: false)
  detectLanguage: true,      // Detect language (default: true)
  confidenceThreshold: 60,   // Confidence threshold (default: 60)
  weights: {                 // Custom detector weights
    STATISTICAL_DETECTOR: 0.40,
    PATTERN_DETECTOR: 0.40,
    GLTR_DETECTOR: 0.10,
    PLAGIARISM_DETECTOR: 0.10
  }
});
```

### Using Individual Detectors

```javascript
const check4ai = require("check4ai")();

// Get specific detector
const detector = await check4ai.getDetector('STATISTICAL_DETECTOR');
const result = await detector.detect({ text: yourText });

console.log(result);
```

### Cache Management

```javascript
const check4ai = require("check4ai")();

// Get cache statistics
const stats = check4ai.getCacheStats();
console.log(stats); // { size: 42, maxSize: 1000, enabled: true, ttl: 3600000 }

// Clear cache
check4ai.clearCache();
```

## 🔍 Available Detectors

### 1. Statistical Detector (Recommended, Offline)
Analyzes text using statistical methods:
- **Burstiness Analysis**: Variation in sentence lengths (AI tends to be uniform)
- **Vocabulary Richness**: Type-Token Ratio analysis
- **Sentence Complexity**: Consistency in complexity patterns
- **Repetition Patterns**: N-gram repetition detection
- **Transition Words**: Formal transition word usage

### 2. Pattern Detector (Recommended, Offline)
Detects common AI writing patterns:
- **AI Phrases**: "it's important to note", "delve into", etc.
- **Hedging Language**: Excessive use of "may", "might", "could"
- **Structure Patterns**: Lists, headers, formatted text
- **Meta-commentary**: Self-referential explanations
- **LLM Signatures**: Model-specific word choices

### 3. GLTR Detector (Online, May Be Unavailable)
Uses token predictability analysis via gltr.io API
- Based on GPT-2 (may not detect modern LLMs accurately)
- Includes retry logic and graceful degradation
- Falls back to UNKNOWN if service unavailable

### 4. Plagiarism Detector (Online, May Be Unavailable)
Searches for duplicate content online
- Detects copy-pasted AI content from training data
- Includes timeout handling
- Falls back to UNKNOWN if service unavailable

## 🎯 Best Practices

### Recommended Detector Combinations

**For Offline Analysis (Fastest, Most Reliable):**
```javascript
useDetectors: [
  'STATISTICAL_DETECTOR',
  'PATTERN_DETECTOR'
]
```

**For Maximum Accuracy (Requires Internet):**
```javascript
useDetectors: [
  'STATISTICAL_DETECTOR',
  'PATTERN_DETECTOR',
  'GLTR_DETECTOR',
  'PLAGIARISM_DETECTOR'
]
```

### Text Length Guidelines

- **Minimum**: 50 characters (basic analysis)
- **Recommended**: 200+ characters (reliable results)
- **Optimal**: 500+ characters (high accuracy)
- **Note**: Longer texts provide better detection accuracy

### Interpreting Confidence Levels

- **HIGH**: Strong indicators in multiple detectors, results are reliable
- **MEDIUM**: Some indicators present, consider manual review
- **LOW**: Conflicting or weak signals, manual review recommended
- **NONE**: No detectors available, analysis failed

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🔧 Configuration Options

### API Keys (Optional)

For plagiarism detection, you can optionally provide Google Custom Search credentials:

```bash
# Create .env file in your project root
G_API_KEY=<YOUR-API-KEY-FROM-GOOGLE-CONSOLE>
G_ENGINE_ID=<YOUR-ENGINE-ID-FROM-GOOGLE-CONSOLE>
```

**Note**: Plagiarism detector works without API keys but may have limitations.

## 📊 Performance

- **Statistical Detector**: ~50ms (offline)
- **Pattern Detector**: ~30ms (offline)
- **GLTR Detector**: ~2-5s (online, with retries)
- **Plagiarism Detector**: ~3-10s (online, with timeout)
- **Cache Hit**: <1ms

## 🛡️ Security & Privacy

- All offline detectors (Statistical, Pattern) process text locally
- Online detectors (GLTR, Plagiarism) send text to external APIs
- No data is stored or logged by this library
- Cache is in-memory only and cleared on process exit

## 🤝 Contributing

Contributions are welcome! Please see [Contributing.md](Contributing.md) for guidelines.

## 📄 License

GNU General Public License v3.0 - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Thanks to **Hendrik Strobelt, Sebastian Gehrmann, and Alexander Rush** from the MIT-IBM Watson AI lab and Harvard NLP for creating [GLTR](https://github.com/HendrikStrobelt/detecting-fake-text)
- Thanks to **hhhhhhhhhn** for [HookeJS](https://github.com/hhhhhhhhhn/hookejs)
- Original author: **Ali Murat Bozaci**
- v0.0.3-beta improvements: Enhanced security, modern detectors, and reliability features

## 📝 Changelog

### v0.0.3-beta (2025)
- ✅ Added Statistical Detector with 5 analysis methods
- ✅ Added Pattern Detector for modern LLM detection
- ✅ Implemented caching system with LRU eviction
- ✅ Added language detection for 11+ languages
- ✅ Added confidence scoring system
- ✅ Improved error handling and retry logic
- ✅ Updated all dependencies, fixed security vulnerabilities
- ✅ Enhanced GLTR and Plagiarism detectors with graceful degradation

### v0.0.2-beta
- Initial public beta release

## ⚠️ Disclaimer

This library provides AI detection capabilities but is not 100% accurate. Results should be used as guidance, not definitive proof. Always combine automated detection with human judgment, especially for important decisions.

Detection accuracy varies based on:
- Text length and quality
- AI model used to generate text
- Language and writing style
- Available detector APIs

[npm-downloads-image]: https://badgen.net/npm/dm/check4ai
[npm-downloads-url]: https://npmcharts.com/compare/check4ai?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/check4ai
[npm-url]: https://npmjs.org/package/check4ai
[npm-version-image]: https://badgen.net/npm/v/check4ai
[code-coverage-url]: https://img.shields.io/codecov/c/github/wuranium/check4ai.svg?style=flat-square
