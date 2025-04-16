# BismarckCoreNLP

A TypeScript-based Natural Language Processing (NLP) toolkit specifically designed for German language analysis. This analyzer was built by Emre Dayangaç- me.)- when he was when preparing for the B1 german language certificate. The API was named after great Deutsch statesman Otto von Bismarck.

## Features

- Tokenization with German compound word handling
- Part-of-Speech (POS) Tagging for German grammar
- Named Entity Recognition (NER)
- Syntactic Parsing
- Coreference Resolution
- Basic Sentiment Analysis

## Installation

```bash
npm install bismarck-core-nlp
```

## Quick Start

```typescript
import { BismarckCoreNLP } from 'bismarck-core-nlp';

async function analyze() {
  const nlp = new BismarckCoreNLP({
    stages: ['tokenize', 'pos', 'ner'],
    language: 'de'
  });

  const text = "Angela Merkel war Bundeskanzlerin. Sie führte Deutschland viele Jahre.";
  const result = await nlp.process(text);
  console.log(result);
}
```

Example Output:
```json
{
  "language": "de",
  "raw": "Angela Merkel war Bundeskanzlerin. Sie führte Deutschland viele Jahre.",
  "tokens": [
    { "value": "Angela", "start": 0, "end": 6, "index": 0 },
    { "value": "Merkel", "start": 7, "end": 13, "index": 1 },
    { "value": "war", "start": 14, "end": 17, "index": 2 },
    { "value": "Bundeskanzlerin", "start": 18, "end": 32, "index": 3 },
    { "value": ".", "start": 32, "end": 33, "index": 4 },
    { "value": "Sie", "start": 34, "end": 37, "index": 5 },
    { "value": "führte", "start": 38, "end": 44, "index": 6 },
    { "value": "Deutschland", "start": 45, "end": 56, "index": 7 },
    { "value": "viele", "start": 57, "end": 62, "index": 8 },
    { "value": "Jahre", "start": 63, "end": 68, "index": 9 },
    { "value": ".", "start": 68, "end": 69, "index": 10 }
  ],
  "entities": [
    {
      "entity": "Angela Merkel",
      "type": "PERSON",
      "start": 0,
      "end": 13
    },
    {
      "entity": "Deutschland",
      "type": "LOCATION",
      "start": 45,
      "end": 56
    }
  ],
  "coreferences": [
    {
      "original": {
        "text": "Angela Merkel",
        "position": { "start": 0, "end": 13 }
      },
      "references": [
        {
          "text": "Sie",
          "position": { "start": 34, "end": 37 }
        }
      ]
    }
  ]
}
```

## Examples

### Basic Analysis

```typescript
const text = "Der große schwarze Hund läuft schnell.";
const result = await nlp.process(text, {
  tokenize: true,
  pos: true
});
```

Output:
```json
{
  "language": "de",
  "tokens": [
    { "value": "Der", "start": 0, "end": 3, "index": 0 },
    { "value": "große", "start": 4, "end": 9, "index": 1 },
    { "value": "schwarze", "start": 10, "end": 18, "index": 2 },
    { "value": "Hund", "start": 19, "end": 23, "index": 3 },
    { "value": "läuft", "start": 24, "end": 29, "index": 4 },
    { "value": "schnell", "start": 30, "end": 37, "index": 5 },
    { "value": ".", "start": 37, "end": 38, "index": 6 }
  ],
  "pos": [
    { "token": { "value": "Der" }, "tag": "ART", "description": "Article" },
    { "token": { "value": "große" }, "tag": "ADJ", "description": "Adjective" },
    { "token": { "value": "schwarze" }, "tag": "ADJ", "description": "Adjective" },
    { "token": { "value": "Hund" }, "tag": "NOUN", "description": "Noun" },
    { "token": { "value": "läuft" }, "tag": "VERB", "description": "Verb" },
    { "token": { "value": "schnell" }, "tag": "ADV", "description": "Adverb" },
    { "token": { "value": "." }, "tag": "PUNCT", "description": "Punctuation" }
  ]
}
```

### Compound Word Analysis

```typescript
const text = "Der Bundesfinanzminister spricht über Wirtschaftswachstum.";
const result = await nlp.process(text);
```

Output:
```json
{
  "language": "de",
  "entities": [
    {
      "entity": "Bundesfinanzminister",
      "type": "COMPOUND",
      "components": ["Bundes", "finanz", "minister"],
      "start": 4,
      "end": 23
    },
    {
      "entity": "Wirtschaftswachstum",
      "type": "COMPOUND",
      "components": ["Wirtschaft", "wachstum"],
      "start": 35,
      "end": 53
    }
  ],
  "pos": [
    { "token": { "value": "Bundesfinanzminister" }, "tag": "NOUN", "description": "Compound Noun" },
    { "token": { "value": "Wirtschaftswachstum" }, "tag": "NOUN", "description": "Compound Noun" }
  ]
}
```

### Named Entity Recognition

```typescript
const text = "Die BMW AG hat ihren Hauptsitz in München.";
const result = await nlp.process(text, { ner: true });
```

Output:
```json
{
  "language": "de",
  "entities": [
    {
      "entity": "BMW AG",
      "type": "ORGANIZATION",
      "start": 4,
      "end": 10,
      "confidence": 0.95
    },
    {
      "entity": "München",
      "type": "LOCATION",
      "start": 31,
      "end": 38,
      "confidence": 0.98
    }
  ]
}
```

## Configuration Options

```typescript
const nlp = new BismarckCoreNLP({
  stages: ['tokenize', 'pos', 'ner', 'parse', 'coref'],
  language: 'de',
  options: {
    caseSensitive: true,
    keepPunctuation: true,
    customDictionary: ['spezifischeWörter', 'Fachbegriffe']
  }
});
```

## API Reference

### BismarckCoreNLP Class

#### Constructor Options
- `stages`: Array of processing stages to enable
- `language`: Target language (currently only 'de' supported)
- `options`: Additional configuration options

#### Methods
- `process(text: string, options?: ProcessingOptions)`: Main processing method
- `getPipelineConfig()`: Get current configuration
- `setPipelineConfig(config: Partial<PipelineConfig>)`: Update configuration

## License

MIT License - see [LICENSE](LICENSE) for details.
