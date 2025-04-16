import { Token, NamedEntity } from '../types';

export class NamedEntityRecognizer {
  private readonly patterns: Array<[RegExp, string]> = [
    [/^[A-ZÄÖÜ][a-zäöüß]+(straße|platz|weg|allee)$/, 'LOCATION'],
    [/^[A-ZÄÖÜ][a-zäöüß]+(GmbH|AG|KG|OHG|e\.V\.|GbR)$/, 'ORGANIZATION'],
    [/^[A-ZÄÖÜ][a-zäöüß]+(burg|stadt|dorf|bach|berg|tal)$/, 'LOCATION'],
    [/^[A-ZÄÖÜ][a-zäöüß]+er\s+(Universität|Hochschule)$/, 'ORGANIZATION'],
    [/^(Dr\.|Prof\.|Herr|Frau)\s+[A-ZÄÖÜ][a-zäöüß]+$/, 'PERSON']
  ];

  private readonly germanTitles = [
    'Dr.', 'Prof.', 'Dipl.', 'Ing.', 'Med.', 'Phil.',
    'Herr', 'Frau', 'Graf', 'Baron', 'König', 'Kaiser'
  ];

  private readonly locationIndicators = [
    'straße', 'platz', 'weg', 'allee', 'gasse', 'ring',
    'stadt', 'dorf', 'berg', 'tal', 'burg', 'brücke'
  ];

  public recognize(tokens: Token[]): NamedEntity[] {
    const entities: NamedEntity[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];
      let matched = false;

      // Check multi-token patterns first
      if (i < tokens.length - 1) {
        const twoTokens = `${token.value} ${tokens[i + 1].value}`;
        const entityType = this.checkMultiTokenPattern(twoTokens);
        if (entityType) {
          entities.push({
            entity: twoTokens,
            type: entityType,
            start: token.start,
            end: tokens[i + 1].end
          });
          i += 2;
          matched = true;
          continue;
        }
      }

      // Check single token patterns
      if (!matched) {
        for (const [pattern, type] of this.patterns) {
          if (pattern.test(token.value)) {
            entities.push({
              entity: token.value,
              type,
              start: token.start,
              end: token.end
            });
            matched = true;
            break;
          }
        }
      }

      // Handle potential person names
      if (!matched && this.isPotentialPersonName(token.value)) {
        entities.push({
          entity: token.value,
          type: 'PERSON',
          start: token.start,
          end: token.end
        });
      }

      i++;
    }

    return this.mergeAdjacentEntities(entities);
  }

  private checkMultiTokenPattern(text: string): string | null {
    // Check for organization patterns
    if (/^[A-ZÄÖÜ][a-zäöüß]+ (GmbH|AG|KG|OHG)$/.test(text)) {
      return 'ORGANIZATION';
    }

    // Check for person name patterns
    if (this.germanTitles.some(title => text.startsWith(title))) {
      return 'PERSON';
    }

    // Check for location patterns
    if (this.locationIndicators.some(indicator => text.toLowerCase().includes(indicator))) {
      return 'LOCATION';
    }

    return null;
  }

  private isPotentialPersonName(token: string): boolean {
    return /^[A-ZÄÖÜ][a-zäöüß]+$/.test(token) && 
           !this.locationIndicators.some(ind => token.toLowerCase().includes(ind)) &&
           !token.endsWith('GmbH') &&
           !token.endsWith('AG');
  }

  private mergeAdjacentEntities(entities: NamedEntity[]): NamedEntity[] {
    const merged: NamedEntity[] = [];
    let current: NamedEntity | null = null;

    for (const entity of entities) {
      if (!current) {
        current = entity;
        continue;
      }

      if (current.type === entity.type && 
          entity.start - current.end <= 1) {
        current = {
          entity: `${current.entity} ${entity.entity}`,
          type: current.type,
          start: current.start,
          end: entity.end
        };
      } else {
        merged.push(current);
        current = entity;
      }
    }

    if (current) {
      merged.push(current);
    }

    return merged;
  }
}