import { Token, POSTag } from '../types';

export class POSTagger {
  private readonly tagPatterns: Array<[RegExp, string, string]> = [
    [/^[A-ZÄÖÜ][a-zäöüß]+$/, 'NOUN', 'Noun'],
    [/^(der|die|das|den|dem|des)$/i, 'ART', 'Article'],
    [/^(ist|sind|war|waren|hat|haben|wird|werden)$/i, 'VERB', 'Verb'],
    [/^[a-zäöüß]+lich$/, 'ADJ', 'Adjective'],
    [/^(in|auf|unter|über|bei|seit|von|zu)$/i, 'PREP', 'Preposition'],
    [/^(und|oder|aber|denn|sondern)$/i, 'CONJ', 'Conjunction'],
    [/^(ich|du|er|sie|es|wir|ihr|sie)$/i, 'PRON', 'Pronoun'],
    [/^[0-9]+$/, 'NUM', 'Number'],
    [/^[a-zäöüß]+en$/, 'VINF', 'Verb Infinitive'],
    [/^[a-zäöüß]+(st|t|en|et)$/, 'VFIN', 'Finite Verb'],
    [/^[a-zäöüß]+er$/, 'ADJ', 'Adjective Comparative']
  ];

  private readonly specialCases = new Map<string, [string, string]>([
    ['nicht', ['NEG', 'Negation']],
    ['sehr', ['ADV', 'Adverb']],
    ['nur', ['ADV', 'Adverb']],
    ['auch', ['ADV', 'Adverb']]
  ]);

  public tag(tokens: Token[]): POSTag[] {
    return tokens.map(token => {
      // Check special cases first
      const specialCase = this.specialCases.get(token.value.toLowerCase());
      if (specialCase) {
        return {
          token,
          tag: specialCase[0],
          description: specialCase[1]
        };
      }

      // Check patterns
      for (const [pattern, tag, description] of this.tagPatterns) {
        if (pattern.test(token.value)) {
          return {
            token,
            tag,
            description
          };
        }
      }

      // Default case
      return {
        token,
        tag: 'OTHER',
        description: 'Unknown Part of Speech'
      };
    });
  }

  public getDescription(tag: string): string {
    for (const [, tagValue, description] of this.tagPatterns) {
      if (tagValue === tag) {
        return description;
      }
    }
    return 'Unknown';
  }
}