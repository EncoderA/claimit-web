import { faker } from '@faker-js/faker';

/**
 * Generates a random lowercase word.
 *
 * @param options - Options for faker.lorem.word
 * @returns A single random word.
 */
export function word(options?: { length?: number | { min: number; max: number }; strategy?: 'fail' | 'shortest' | 'longest' | 'closest' }): string {
  return faker.lorem.word(options);
}

/**
 * Generates a space-separated sequence of random words.
 *
 * @param count - The number of words or range of words to generate.
 * @returns A string of space-separated words.
 */
export function words(count?: number | { min: number; max: number }): string {
  return faker.lorem.words(count);
}

/**
 * Generates a random sentence.
 *
 * @param wordCount - The number of words or range of words in the sentence.
 * @returns A single sentence ending with a period.
 */
export function sentence(wordCount?: number | { min: number; max: number }): string {
  return faker.lorem.sentence(wordCount);
}

/**
 * Generates a paragraph of sentences.
 *
 * @param sentenceCount - The number of sentences or range of sentences in the paragraph.
 * @returns A single paragraph.
 */
export function paragraph(sentenceCount?: number | { min: number; max: number }): string {
  return faker.lorem.paragraph(sentenceCount);
}

/**
 * Generates a title-cased string suitable for a header or title.
 *
 * @returns A string in title case.
 */
export function title(): string {
  const s = faker.lorem.sentence({ min: 3, max: 6 });
  const clean = s.endsWith('.') ? s.slice(0, -1) : s;
  return clean
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Generates a multi-sentence description.
 *
 * @returns A string of 1 to 3 sentences.
 */
export function description(): string {
  return faker.lorem.sentences({ min: 1, max: 3 });
}
