/**
 * Validates the prompt to ensure it doesn't contain banned content.
 * @param prompt - The user input prompt.
 * @returns An object indicating if the prompt is valid and an error message if not.
 */
export function validatePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  // Basic content filtering - allow artistic nudity but filter harmful content
  if (
    lowerPrompt.includes('illegal') ||
    lowerPrompt.includes('non-consensual') ||
    lowerPrompt.includes('brutal') ||
    lowerPrompt.includes('gore') ||
    lowerPrompt.includes('blood') ||
    lowerPrompt.includes('torture') ||
    lowerPrompt.includes('death') ||
    lowerPrompt.includes('murder') ||
    lowerPrompt.includes('suicide') ||
    lowerPrompt.includes('hate') ||
    lowerPrompt.includes('racism') ||
    lowerPrompt.includes('child') ||
    lowerPrompt.includes('child abuse') ||
    lowerPrompt.includes('child porn') ||
    lowerPrompt.includes('child violence') ||
    lowerPrompt.includes('child gore') ||
    lowerPrompt.includes('child blood') ||
    lowerPrompt.includes('child torture') ||
    lowerPrompt.includes('child exploitation') ||
    lowerPrompt.includes('revenge porn')
  ) {
    return { isValid: false, error: 'Prompt violates terms' };
  }

  // Allow artistic nudity and other adult content with artistic value
  return { isValid: true };
}
