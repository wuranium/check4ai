/**
 * Basic Usage Example
 *
 * This example shows the simplest way to use check4ai
 */

const check4ai = require('../index.js')();

const text = `Artificial intelligence has revolutionized many aspects of modern technology.
Machine learning algorithms can process vast amounts of data and identify patterns that would
be impossible for humans to detect manually. Deep learning, a subset of machine learning,
uses neural networks with multiple layers to learn hierarchical representations of data.`;

async function basicExample() {
    console.log('=== Basic Usage Example ===\n');

    try {
        const result = await check4ai.checkText({ text });

        console.log('Result:');
        console.log('  Author:', result.author);
        console.log('  Confidence:', result.confidence);
        console.log('  Probability:', result.percent + '%');
        console.log('  Language:', result.language.name);
        console.log('\nRecommendation:');
        console.log(' ', result.analysis.recommendation);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

basicExample();
