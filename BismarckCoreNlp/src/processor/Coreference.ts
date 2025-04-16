import { Token, POSTag, Coreference } from '../types';

export class CoreferenceResolver {
  private readonly germanPronouns = [
    'er', 'sie', 'es',
    'ihm', 'ihr', 'ihm',
    'ihn', 'sie', 'es',
    'sein', 'seine', 'seiner', 'seinen', 'seinem',
    'ihr', 'ihre', 'ihrer', 'ihren', 'ihrem',
    'deren', 'dessen'
  ];

  private readonly genderMap = new Map<string, string>([
    ['der', 'MASC'],
    ['die', 'FEM'],
    ['das', 'NEUT'],
    ['er', 'MASC'],
    ['sie', 'FEM'],
    ['es', 'NEUT']
  ]);

  public resolve(tokens: Token[], posTags: POSTag[]): Coreference[] {
    const references: Coreference[] = [];
    const entities = this.findEntities(tokens, posTags);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (this.isPronoun(token.value)) {
        const pronoun = token.value.toLowerCase();
        const gender = this.getGender(pronoun);
        
        // Find the most recent matching entity
        const matchingEntity = this.findMatchingEntity(
          entities,
          i,
          gender
        );

        if (matchingEntity) {
          const existingRef = references.find(
            ref => ref.original.text === matchingEntity.text
          );

          if (existingRef) {
            existingRef.references.push({
              text: token.value,
              position: { start: token.start, end: token.end }
            });
          } else {
            references.push({
              original: matchingEntity,
              references: [{
                text: token.value,
                position: { start: token.start, end: token.end }
              }]
            });
          }
        }
      }
    }

    return references;
  }

  private findEntities(tokens: Token[], posTags: POSTag[]): Array<{
    text: string;
    position: { start: number; end: number };
    gender: string;
  }> {
    const entities: Array<{
      text: string;
      position: { start: number; end: number };
      gender: string;
    }> = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const pos = posTags[i];

      if (pos.tag === 'NOUN' && /^[A-ZÄÖÜ]/.test(token.value)) {
        // Look for preceding article to determine gender
        let gender = 'UNKNOWN';
        if (i > 0 && posTags[i - 1].tag === 'ART') {
          gender = this.getGender(tokens[i - 1].value) || 'UNKNOWN';
        }

        entities.push({
          text: token.value,
          position: { start: token.start, end: token.end },
          gender
        });
      }
    }

    return entities;
  }

  private findMatchingEntity(
    entities: Array<{
      text: string;
      position: { start: number; end: number };
      gender: string;
    }>,
    pronounIndex: number,
    pronounGender: string
  ) {
    // Look for the most recent entity with matching gender
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity.position.end < pronounIndex) {
        if (entity.gender === pronounGender || entity.gender === 'UNKNOWN') {
          return entity;
        }
      }
    }
    return null;
  }

  private isPronoun(word: string): boolean {
    return this.germanPronouns.includes(word.toLowerCase());
  }

  private getGender(word: string): string {
    return this.genderMap.get(word.toLowerCase()) || 'UNKNOWN';
  }
}