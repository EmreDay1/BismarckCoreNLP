// Basic Usage
const nlp = new BismarckCoreNLP();
const text = "Der schnelle braune Fuchs springt über den faulen Hund.";
const result = await nlp.process(text);

// Handling Compound Words
const compoundText = "Der Bundesfinanzminister besucht die Automobilindustrie.";
const compounds = await nlp.process(compoundText, { tokenize: true });
// Bundesfinanzminister -> [Bundes, finanz, minister]

// Named Entity Recognition
const nerText = "Die BMW AG in München stellt neue Elektroautos her.";
const entities = await nlp.process(nerText, { ner: true });
// Returns: [{ entity: "BMW AG", type: "ORG" }, { entity: "München", type: "LOC" }]

// Part of Speech Tagging
const posText = "Das neue Buch ist interessant.";
const pos = await nlp.process(posText, { pos: true });
// Returns tagged words: [{ word: "Das", tag: "ART" }, { word: "neue", tag: "ADJ" }...]

// Working with Multiple Sentences
const multiText = `
  Angela Merkel war Bundeskanzlerin.
  Sie führte Deutschland viele Jahre.
  Die Politikerin erreichte viel.
`;
const multiResult = await nlp.process(multiText, {
  tokenize: true,
  ner: true,
  coref: true
});

// Custom Configuration
const customNlp = new BismarckCoreNLP({
  stages: ['tokenize', 'pos', 'ner'],
  language: 'de',
  options: {
    caseSensitive: true,
    keepPunctuation: false
  }
});

// Batch Processing
const texts = [
  "Berlin ist die Hauptstadt.",
  "Hamburg ist ein Stadtstaat.",
  "München liegt in Bayern."
];

const results = await Promise.all(
  texts.map(text => nlp.process(text, { ner: true }))
);


// Advanced Usage with All Features
const advancedText = "Der Software-Entwickler bei der Deutschen Bank AG entwickelt neue Programme. Er arbeitet in Frankfurt.";
const fullAnalysis = await nlp.process(advancedText, {
  tokenize: true,
  pos: true,
  ner: true,
  parse: true,
  coref: true
});

// Working with Dates and Numbers
const dateText = "Am 15. März 2024 findet die Konferenz statt.";
const dateResult = await nlp.process(dateText, { 
  tokenize: true,
  ner: true
});
