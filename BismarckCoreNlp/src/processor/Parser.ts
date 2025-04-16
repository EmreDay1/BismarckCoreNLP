import type { Token, POSTag, ParseNode } from '../types/index';

export class Parser {
  private readonly verbPatterns = [
    /^(ist|sind|war|waren|hat|haben|wird|werden)$/i,
    /^[a-zäöüß]+(en|t|st|e)$/
  ];

  public parse(tokens: Token[], posTags: POSTag[]): ParseNode {
    return this.parseClause(tokens, posTags, 0).node;
  }

  private createNode(type: string, value?: string): ParseNode {
    return {
      type,
      value,
      children: [] // Always initialize children array
    };
  }

  private parseClause(
    tokens: Token[],
    posTags: POSTag[],
    startIndex: number
  ): { node: ParseNode; endIndex: number } {
    const clause: ParseNode = this.createNode('CLAUSE');
    let i = startIndex;
    let hasSubject = false;
    let hasVerb = false;

    while (i < tokens.length) {
      const token = tokens[i];
      const posTag = posTags[i];

      // Handle subject
      if (!hasSubject && this.isNounPhrase(posTag)) {
        const { node: np, endIndex } = this.parseNounPhrase(tokens, posTags, i);
        clause.children.push(np); // Removed optional chaining
        i = endIndex;
        hasSubject = true;
        continue;
      }

      // Handle verb
      if (hasSubject && !hasVerb && this.isVerb(token, posTag)) {
        const { node: vp, endIndex } = this.parseVerbPhrase(tokens, posTags, i);
        clause.children.push(vp); // Removed optional chaining
        i = endIndex;
        hasVerb = true;
        continue;
      }

      // Handle object or other components after verb
      if (hasVerb) {
        if (this.isNounPhrase(posTag)) {
          const { node: np, endIndex } = this.parseNounPhrase(tokens, posTags, i);
          clause.children.push(np); // Removed optional chaining
          i = endIndex;
        } else if (this.isPrepPhrase(posTag)) {
          const { node: pp, endIndex } = this.parsePrepPhrase(tokens, posTags, i);
          clause.children.push(pp); // Removed optional chaining
          i = endIndex;
        } else {
          i++;
        }
      } else {
        i++;
      }

      // Check for end of clause
      if (i < tokens.length && tokens[i].value === '.') {
        break;
      }
    }

    return { node: clause, endIndex: i };
  }

  private parseNounPhrase(
    tokens: Token[],
    posTags: POSTag[],
    startIndex: number
  ): { node: ParseNode; endIndex: number } {
    const np: ParseNode = this.createNode('NP');
    let i = startIndex;

    // Handle determiners
    if (i < tokens.length && posTags[i].tag === 'ART') {
      np.children.push(this.createNode('DET', tokens[i].value)); // Removed optional chaining
      i++;
    }

    // Handle adjectives
    while (i < tokens.length && posTags[i].tag === 'ADJ') {
      np.children.push(this.createNode('ADJ', tokens[i].value)); // Removed optional chaining
      i++;
    }

    // Handle noun
    if (i < tokens.length && posTags[i].tag === 'NOUN') {
      np.children.push(this.createNode('NOUN', tokens[i].value)); // Removed optional chaining
      i++;
    }

    return { node: np, endIndex: i };
  }

  private parseVerbPhrase(
    tokens: Token[],
    posTags: POSTag[],
    startIndex: number
  ): { node: ParseNode; endIndex: number } {
    const vp: ParseNode = this.createNode('VP');
    let i = startIndex;

    // Handle main verb
    if (i < tokens.length && this.isVerb(tokens[i], posTags[i])) {
      vp.children.push(this.createNode('VERB', tokens[i].value)); // Removed optional chaining
      i++;
    }

    // Handle auxiliary verbs or particles
    while (i < tokens.length && 
           (this.isVerb(tokens[i], posTags[i]) || posTags[i].tag === 'PART')) {
      vp.children.push(
        this.createNode(
          posTags[i].tag === 'PART' ? 'PART' : 'VERB',
          tokens[i].value
        )
      ); // Removed optional chaining
      i++;
    }

    return { node: vp, endIndex: i };
  }

  private parsePrepPhrase(
    tokens: Token[],
    posTags: POSTag[],
    startIndex: number
  ): { node: ParseNode; endIndex: number } {
    const pp: ParseNode = this.createNode('PP');
    let i = startIndex;

    // Handle preposition
    if (i < tokens.length && posTags[i].tag === 'PREP') {
      pp.children.push(this.createNode('PREP', tokens[i].value)); // Removed optional chaining
      i++;
    }

    // Handle the following noun phrase
    const { node: np, endIndex } = this.parseNounPhrase(tokens, posTags, i);
    pp.children.push(np); // Removed optional chaining

    return { node: pp, endIndex };
  }

  private isNounPhrase(posTag: POSTag): boolean {
    return posTag.tag === 'NOUN' || posTag.tag === 'PRON';
  }

  private isVerb(token: Token, posTag: POSTag): boolean {
    return posTag.tag === 'VERB' || 
           posTag.tag === 'VFIN' || 
           posTag.tag === 'VINF' ||
           this.verbPatterns.some(pattern => pattern.test(token.value));
  }

  private isPrepPhrase(posTag: POSTag): boolean {
    return posTag.tag === 'PREP';
  }
}