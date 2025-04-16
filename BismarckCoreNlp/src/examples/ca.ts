import { BismarckCoreNLP } from '../processor/BismarckCoreNLP';

async function analyzeGermanCompounds() {
  const nlp = new BismarckCoreNLP({
    stages: ['tokenize', 'pos'],
    language: 'de',
    options: { caseSensitive: true }
  });

  // Example German compound words in sentences
  const sentences = [
    "Der Bundesfinanzminister spricht über Wirtschaftswachstum.",
    "Die Klimaschutzmaßnahmen sind wichtig für die Umweltpolitik.",
    "Im Hauptbahnhof gibt es einen Informationsschalter.",
    "Die Krankenversicherungskarte liegt auf dem Schreibtisch."
  ];

  for (const sentence of sentences) {
    console.log('\nAnalyzing sentence:', sentence);
    console.log('------------------------');

    try {
      const result = await nlp.process(sentence, {
        tokenize: true,
        pos: true
      });

      if (result.tokens && result.pos) {
        // Identify and analyze compound words
        result.tokens.forEach((token, i) => {
          const pos = result.pos![i];
          if (isCompoundWord(token.value)) {
            console.log(`\nCompound word found: ${token.value}`);
            console.log('Components:', splitCompoundWord(token.value));
            console.log('Part of Speech:', pos.tag);
            console.log('Position:', `${token.start}-${token.end}`);
          }
        });
      }
    } catch (error) {
      console.error('Error analyzing sentence:', error);
    }
  }
}

// Helper function to identify compound words
function isCompoundWord(word: string): boolean {
  // Check for typical German compound word patterns
  return /^[A-ZÄÖÜ][a-zäöüß]+([A-ZÄÖÜ][a-zäöüß]+)+$/.test(word);
}

// Helper function to split compound words
function splitCompoundWord(word: string): string[] {
  // Split on capital letters, keeping the capital letter with the following word
  return word.split(/(?=[A-ZÄÖÜ])/).filter(Boolean);
}

// Run the compound analysis
analyzeGermanCompounds().catch(console.error);