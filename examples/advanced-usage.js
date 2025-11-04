/**
 * Advanced Usage Example
 *
 * This example shows advanced features:
 * - Custom detector selection
 * - Custom weights
 * - Cache management
 * - Detailed analysis
 */

const check4ai = require('../index.js')({
    cache: true,
    cacheTTL: 1800000, // 30 minutes
    cacheMaxSize: 500
});

const CONSTANTS = require('../lib/util/constant');

// AI-looking text (high AI indicators)
const aiText = `It's important to note that when it comes to artificial intelligence,
there are several key considerations to keep in mind. First and foremost, machine learning
algorithms can analyze vast datasets. Moreover, deep learning networks leverage neural
architectures. Furthermore, it's worth mentioning that AI systems require substantial
computational resources. Therefore, one should consider the implications carefully.`;

// Human-looking text (varied, natural)
const humanText = `I've been thinking about AI lately. My friend works on neural networks,
and she told me some crazy stories! Like, they trained this model on cat pictures, but it
kept thinking dogs were cats. Hilarious! Anyway, I'm not sure if I trust all this AI stuff yet.
What do you think?`;

async function advancedExample() {
    console.log('=== Advanced Usage Example ===\n');

    // Example 1: Use only offline detectors for fast analysis
    console.log('1. Fast offline analysis (AI-like text):');
    const result1 = await check4ai.checkText({
        text: aiText,
        useDetectors: [
            CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR,
            CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR
        ]
    });

    console.log('  Author:', result1.author);
    console.log('  Confidence:', result1.confidence);
    console.log('  Score:', result1.percent + '%');
    console.log('  Working detectors:', result1.analysis.workingDetectors);
    console.log('  AI votes:', result1.analysis.aiVotes);
    console.log('  Human votes:', result1.analysis.humanVotes);

    // Example 2: Use custom weights
    console.log('\n2. Custom weights (human-like text):');
    const result2 = await check4ai.checkText({
        text: humanText,
        weights: {
            [CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR]: 0.50,
            [CONSTANTS.DETECTOR_TYPE.PATTERN_DETECTOR]: 0.50
        }
    });

    console.log('  Author:', result2.author);
    console.log('  Confidence:', result2.confidence);
    console.log('  Score:', result2.percent + '%');

    // Example 3: Detailed detector analysis
    console.log('\n3. Detailed detector breakdown:');
    result1.detailedResults.forEach(detector => {
        console.log(`\n  ${detector.detectorName}:`);
        console.log(`    Author: ${detector.author}`);
        console.log(`    Score: ${detector.score.toFixed(1)}%`);
        console.log(`    Confidence: ${detector.confidence || 'N/A'}`);
    });

    // Example 4: Cache statistics
    console.log('\n4. Cache statistics:');
    const cacheStats = check4ai.getCacheStats();
    console.log('  Size:', cacheStats.size);
    console.log('  Max Size:', cacheStats.maxSize);
    console.log('  Enabled:', cacheStats.enabled);
    console.log('  TTL:', (cacheStats.ttl / 60000) + ' minutes');

    // Test cache hit
    console.log('\n5. Testing cache (analyzing same text again):');
    const startTime = Date.now();
    const cachedResult = await check4ai.checkText({ text: aiText });
    const duration = Date.now() - startTime;
    console.log('  From cache:', cachedResult.fromCache || false);
    console.log('  Duration:', duration + 'ms');

    // Example 6: Individual detector usage
    console.log('\n6. Using individual detector:');
    const statDetector = await check4ai.getDetector(CONSTANTS.DETECTOR_TYPE.STATISTICAL_DETECTOR);
    const statResult = await statDetector.detect({ text: aiText });
    console.log('  Detector:', statResult.detectorName);
    console.log('  Result:', statResult.author);
    console.log('  Score:', statResult.score.toFixed(1) + '%');
}

advancedExample().catch(console.error);
