function isTooPersonal(input: {text: string}): boolean {
    const text = String(input.text).toLowerCase();
     const bannedPatterns: RegExp[] = [
    /how old/i,
    /what.*your.*(name|age|religion|family|health|marital|spouse|children)/i,
    /do you have (a wife|husband|children|any illness|a disease)/i,
    /where.*you.*from/i,
    /are.*you.*married/i,
    /\b(my|our) (wife|husband|child|children|mother|father|health|disease)\b/i,
  ];
   
  return bannedPatterns.some((pattern) => pattern.test(text));


}

describe('isTooPersonal', () => {
    test('detects age-related question', () => {
        expect(isTooPersonal({text: 'How old are you?'})).toBe(true);
    });

    test('detects marital status question', () => {
        expect(isTooPersonal({text: 'Are you married?'})).toBe(true);
    });

    test('ignores general immigation question', () => {
        expect(isTooPersonal({text: 'How can i apply for visa?'})).toBe(false);
    });

    test('detects disguised personal question', () => {
        expect(isTooPersonal({text: 'what is your religion?'})).toBe(true);
    });
    
    test('case insensitive', () => {
        expect(isTooPersonal({text: 'Do you have CHILDREN'})).toBe(true);
    });
    
    test('non-personal edge case', () => {
        expect(isTooPersonal({ text: 'Where should i go to apply'})).toBe(false);
    });
});