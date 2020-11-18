import { parseCoAndPrerequisites } from './requisites';
import courses from '../static/courses/courses.json';
import { Course } from './types';
import * as cheerio from 'cheerio';
// import * as fs from 'fs';

const coursesData = courses as Course[];
const getPreAndCoReqInfo = (courseCode: string): string => {
  for (let i = 0; i < coursesData.length; i++) {
    if (courseCode === coursesData[i].__catalogCourseId) {
      const preAndCoReqInfo = coursesData[i].preAndCorequisites;
      if (preAndCoReqInfo === undefined) throw new Error('Pre and Co-Requisites are undefined');
      return (preAndCoReqInfo as string).replace(/<span>(\d+)<\/span>/g, '$1');
    }
  }
  throw new Error(`No Course with the name "${courseCode}" found`);
};

describe('parseCoAndPrerequisites', () => {
  it('works for ECE260', () => {
    const data = getPreAndCoReqInfo('ECE260');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it('works for CSC225', () => {
    const data = getPreAndCoReqInfo('CSC225');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it('works for ECE360', () => {
    const data = getPreAndCoReqInfo('ECE360');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it('works for SENG475', () => {
    const data = getPreAndCoReqInfo('SENG475');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it.only('works for PAAS451', () => {
    const data = getPreAndCoReqInfo('PAAS451');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it('works for SENG440', () => {
    const data = getPreAndCoReqInfo('SENG440');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it('works for ECE355', () => {
    const data = getPreAndCoReqInfo('ECE355');
    const $ = cheerio.load(data);
    parseCoAndPrerequisites($);
  });

  it.skip('works for all', () => {
    const l = [];
    for (let i = 0; i < coursesData.length; i++) {
      const data = coursesData[i].preAndCorequisites;
      if (data) {
        const $ = cheerio.load(data);
        l.push(parseCoAndPrerequisites($).trim());
      }
    }
    // fs.writeFileSync('prereqs.json', JSON.stringify(l));
  });
});
