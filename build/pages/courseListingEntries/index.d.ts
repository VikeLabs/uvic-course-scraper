import cheerio from 'cheerio';
import { Section } from '../../types';
/**
 * Extends course object with section info for term.
 *
 * @param {Course} course the course object to extend
 * @param {string} term the term code
 */
export declare const classScheduleListingExtractor: ($: cheerio.Root) => Promise<Section[]>;
