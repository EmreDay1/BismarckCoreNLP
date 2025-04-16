import { Token } from '../types';

export class Tokenizer {
  private readonly germanCompoundRegex = /^[a-zäöüß]+([A-ZÄÖÜ][a-zäöüß]+)+$/;
  private readonly punctuation = /[.,!?(){}[\]]/;

  constructor(private options: { keepPunctuation?: boolean } = {}) {}

  public tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    let currentToken = '';
    let start = 0;
    let index = 0;

    const addToken = (end: number) => {
      if (currentToken) {
        // Handle German compound words
        if (this.germanCompoundRegex.test(currentToken)) {
          const compoundParts = this.splitCompoundWord(currentToken);
          compoundParts.forEach((part, i) => {
            tokens.push({
              value: part,
              start: start + (i > 0 ? currentToken.indexOf(part) : 0),
              end: start + (i > 0 ? currentToken.indexOf(part) + part.length : part.length),
              index: index++
            });
          });
        } else {
          tokens.push({
            value: currentToken,
            start,
            end,
            index: index++
          });
        }
      }
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === ' ' || (this.punctuation.test(char) && !this.options.keepPunctuation)) {
        addToken(i);
        currentToken = '';
        start = i + 1;
      } else if (this.punctuation.test(char) && this.options.keepPunctuation) {
        addToken(i);
        tokens.push({
          value: char,
          start: i,
          end: i + 1,
          index: index++
        });
        currentToken = '';
        start = i + 1;
      } else {
        currentToken += char;
      }
    }

    // Add final token
    if (currentToken) {
      addToken(text.length);
    }

    return tokens;
  }

  private splitCompoundWord(word: string): string[] {
    // Simple compound word splitting based on capitalization
    return word.split(/(?=[A-ZÄÖÜ])/).filter(Boolean);
  }
}