import type { ProcessingOptions, ProcessingResult, PipelineConfig } from '../types/index';
import { Tokenizer } from './Tokenizer';
import { POSTagger } from './POSTagger';
import { NamedEntityRecognizer } from './NER';
import { Parser } from './Parser';
import { CoreferenceResolver } from './Coreference';

class BismarckCoreNLP {
  private tokenizer: Tokenizer;
  private posTagger: POSTagger;
  private ner: NamedEntityRecognizer;
  private parser: Parser;
  private coref: CoreferenceResolver;
  private config: PipelineConfig;

  constructor(config?: Partial<PipelineConfig>) {
    this.config = {
      stages: ['tokenize', 'pos', 'ner', 'parse', 'coref'],
      language: 'de',
      options: {
        caseSensitive: true,
        keepPunctuation: true,
        ...config?.options
      },
      ...config
    };

    this.initializePipeline();
  }

  private initializePipeline(): void {
    this.tokenizer = new Tokenizer(this.config.options);
    this.posTagger = new POSTagger();
    this.ner = new NamedEntityRecognizer();
    this.parser = new Parser();
    this.coref = new CoreferenceResolver();
  }

  public async process(text: string, options?: ProcessingOptions): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      language: this.config.language,
      raw: text
    };

    try {
      // Always tokenize first
      const tokens = this.tokenizer.tokenize(text);
      result.tokens = tokens;

      // POS Tagging
      if (this.shouldRunStage('pos', options)) {
        const posTags = this.posTagger.tag(tokens);
        result.pos = posTags;

        // Named Entity Recognition
        if (this.shouldRunStage('ner', options)) {
          result.entities = this.ner.recognize(tokens);
        }

        // Parsing
        if (this.shouldRunStage('parse', options)) {
          result.parseTree = this.parser.parse(tokens, posTags);
        }

        // Coreference Resolution
        if (this.shouldRunStage('coref', options)) {
          result.coreferences = this.coref.resolve(tokens, posTags);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  private shouldRunStage(stage: string, options?: ProcessingOptions): boolean {
    if (!options) {
      return this.config.stages.includes(stage as any);
    }
    return options[stage] !== false;
  }

  public getPipelineConfig(): PipelineConfig {
    return { ...this.config };
  }

  public setPipelineConfig(config: Partial<PipelineConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      options: {
        ...this.config.options,
        ...config.options
      }
    };
    this.initializePipeline();
  }
}

// Export both as default and named export
export { BismarckCoreNLP };
export default BismarckCoreNLP;