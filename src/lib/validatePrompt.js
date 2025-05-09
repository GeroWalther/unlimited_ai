/**
 * Validates the prompt to ensure it doesn't contain harmful content.
 * Applies different levels of strictness based on NSFW mode.
 *
 * @param prompt - The user input prompt.
 * @param allowNsfw - Whether to allow NSFW content (adult themes, nudity, etc.)
 * @returns An object indicating if the prompt is valid and an error message if not.
 */
export function validatePrompt(prompt, allowNsfw = false) {
  // Convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();

  // List of extremely harmful content keywords that should always be prohibited
  // regardless of NSFW setting
  const prohibitedTerms = [
    // Child exploitation terms
    'child porn',
    'child pornography',
    'childporn',
    'cp',
    'loli',
    'lolita',
    'shota',
    'minor',
    'underage',
    'kid',
    'toddler',
    'infant',
    'baby',
    'young child',
    'prepubescent',
    'pedo',
    'pedophilia',
    'jailbait',

    // Non-consensual content
    'rape',
    'forced',
    'non-consensual',
    'non consensual',
    'abuse',
    'molestation',

    // Extreme violence/gore
    'gore',
    'mutilation',
    'torture',
    'dismemberment',
    'snuff',
    'necro',
    'beheading',
    'decapitation',
    'hanging',
    'execution',

    // Hate/terrorism
    'holocaust',
    'terrorism',
    'terrorist',
    'jihad',
    'kkk',
    'lynching',
    'racial slur',
    'antisemitism',
    'antisemitic',
    'hate crime',
    'salafist',
    'salafism',

    // Animal abuse
    'bestiality',
    'zoophilia',
    'animal abuse',
    'animal cruelty',
  ];

  // SFW mode prohibited terms - only checked when allowNsfw is false
  const sfwProhibitedTerms = allowNsfw
    ? []
    : [
        'nude',
        'naked',
        'nudity',
        'sex',
        'sexual',
        'porn',
        'pornographic',
        'nsfw',
        'xxx',
        'erotic',
        'erotica',
        'genitals',
        'penis',
        'vagina',
        'breasts',
        'nipples',
        'buttocks',
        'ass',
        'explicit',
      ];

  // Combine terms based on NSFW setting
  const allProhibitedTerms = [...prohibitedTerms, ...sfwProhibitedTerms];

  // Check for prohibited terms
  for (const term of allProhibitedTerms) {
    // Using \b word boundary for more precise matching
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lowerPrompt)) {
      return {
        isValid: false,
        error: allowNsfw
          ? `Content prohibited: Your prompt contains terms that violate our guidelines on harmful content`
          : `Content prohibited in SFW mode: The term "${term}" is not allowed. Toggle NSFW mode to generate mature content.`,
      };
    }
  }

  // Secondary check for concerning combinations that might indicate harmful intent
  const concerningCombinations = [
    ['young', 'naked'],
    ['young', 'nude'],
    ['teen', 'naked'],
    ['teen', 'nude'],
    ['minor', 'sexy'],
    ['child', 'sexy'],
    ['kid', 'sexy'],
    ['child', 'naked'],
    ['child', 'nude'],
  ];

  for (const [term1, term2] of concerningCombinations) {
    if (lowerPrompt.includes(term1) && lowerPrompt.includes(term2)) {
      return {
        isValid: false,
        error: `Content prohibited: Your prompt contains potentially harmful combinations of terms`,
      };
    }
  }

  // Additional check for age-related terms in sexual contexts
  if (
    /\b\d+\s*(?:year|yr)s?\s*old\b/i.test(lowerPrompt) &&
    (lowerPrompt.includes('nude') ||
      lowerPrompt.includes('naked') ||
      lowerPrompt.includes('sexy') ||
      lowerPrompt.includes('porn'))
  ) {
    // Extract the age number
    const ageMatch = lowerPrompt.match(/\b(\d+)\s*(?:year|yr)s?\s*old\b/i);
    if (ageMatch && parseInt(ageMatch[1]) < 18) {
      return {
        isValid: false,
        error: `Content prohibited: Your prompt specifies an age under 18 in a potentially inappropriate context`,
      };
    }
  }

  // Allow artistic nudity and other adult content with artistic value in NSFW mode
  // or SFW content in SFW mode
  return { isValid: true };
}
