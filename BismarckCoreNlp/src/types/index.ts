// Processing Options and Configuration
export type PipelineStage = 'tokenize' | 'pos' | 'ner' | 'parse' | 'coref' | 'sentiment';

export interface ProcessingOptions {
  tokenize?: boolean;
  pos?: boolean;
  ner?: boolean;
  parse?: boolean;
  coref?: boolean;
  sentiment?: boolean;
}

export interface PipelineConfig {
  stages: PipelineStage[];
  language: string;
  options?: {
    caseSensitive?: boolean;
    keepPunctuation?: boolean;
    customDictionary?: string[];
  };
}

// Token and Text Analysis
export interface Token {
  value: string;
  start: number;
  end: number;
  index: number;
  normalized?: string;
  lemma?: string;
}

export interface POSTag {
  token: Token;
  tag: GermanPOSTag;
  description: string;
}

// German-specific POS tags
export type GermanPOSTag =
  | 'NOUN'    // Substantiv
  | 'VERB'    // Verb
  | 'ART'     // Artikel
  | 'ADJ'     // Adjektiv
  | 'ADV'     // Adverb
  | 'PRON'    // Pronomen
  | 'PREP'    // Präposition
  | 'CONJ'    // Konjunktion
  | 'PART'    // Partikel
  | 'NUM'     // Numeral
  | 'INTJ'    // Interjektion
  | 'PUNCT'   // Interpunktion
  | 'OTHER';  // Sonstiges

// Named Entity Recognition
export interface NamedEntity {
  entity: string;
  type: EntityType;
  start: number;
  end: number;
  confidence?: number;
}

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'DATE'
  | 'TIME'
  | 'MONEY'
  | 'PERCENT'
  | 'EVENT'
  | 'WORK_OF_ART'
  | 'LAW'
  | 'LANGUAGE'
  | 'OTHER';

// Parse Tree
export interface ParseNode {
  type: string;
  value?: string;
  children: ParseNode[];
  features?: {
    case?: GermanCase;
    gender?: GermanGender;
    number?: GermanNumber;
    tense?: GermanTense;
  };
}

// German Grammar Features
export type GermanCase = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type GermanGender = 'MASCULINE' | 'FEMININE' | 'NEUTER';
export type GermanNumber = 'SINGULAR' | 'PLURAL';
export type GermanTense = 'PRESENT' | 'PAST' | 'PERFECT' | 'FUTURE';

// Coreference Resolution
export interface Coreference {
  original: ReferenceSpan;
  references: ReferenceSpan[];
  type: ReferenceType;
}

export interface ReferenceSpan {
  text: string;
  position: {
    start: number;
    end: number;
  };
  features?: {
    gender?: GermanGender;
    number?: GermanNumber;
    case?: GermanCase;
  };
}

export type ReferenceType = 'PRONOUN' | 'NOUN' | 'DEMONSTRATIVE' | 'RELATIVE';

// Sentiment Analysis
export interface SentimentResult {
  score: number;  // -1 to 1
  comparative: number;
  tokens: string[];
  positive: string[];
  negative: string[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
}

// Final Processing Result
export interface ProcessingResult {
  language: string;
  raw: string;
  tokens?: Token[];
  pos?: POSTag[];
  entities?: NamedEntity[];
  parseTree?: ParseNode;
  coreferences?: Coreference[];
  sentiment?: SentimentResult;
  metadata?: {
    processingTime?: number;
    usedStages: PipelineStage[];
    timestamp: string;
    version: string;
  };
}

// Error Types
export class NLPError extends Error {
  constructor(
    message: string,
    public stage: PipelineStage,
    public errorCode: string,
    public details?: any
  ) {
    super(message);
    this.name = 'NLPError';
  }
}