import cheerio from 'cheerio';
import moment from 'moment';
import { Section, Schedule, levelType, sectionType, deliveryMethodType } from '../../types';

/**
 * Extends course object with section info for term.
 *
 * @param {Course} course the course object to extend
 * @param {string} term the term code
 */
export const classScheduleListingExtractor = async ($: cheerio.Root): Promise<Section[]> => {
  const regex = /(.+) - (\d+) - ([\w|-]{0,4} \w?\d+\w?) - ([A|B|T]\d+)/;
  try {
    const sections: Section[] = [];
    const sectionEntries = $(`table[summary="This layout table is used to present the sections found"]>tbody>tr`);
    for (let sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) { //why += 2?
      const section = {} as Section;

      // Parse Title block e.g. "Algorithms and Data Structures I - 30184 - CSC 225 - A01"
      const title = $('a', sectionEntries[sectionIdx]);
      section.title = /(.*)\s-\s*\d{5}/.exec(title.text())![1];
      const m = regex.exec(title.text());
      if (m) {
        section.crn = m[2];
        section.sectionCode = m[4];
      }

      // Get more information from section details page. Uncommenting this would increase runtime by at least x2
      // const sectionDetailsEndpoint = $('a', sectionEntries[sectionIdx]).attr('href');
      // if (sectionDetailsEndpoint) {
      //   Object.assign(section, await getSectionDetails(sectionDetailsEndpoint));
      // }

      // Section info is divided into 2 table rows, here we get the second one
      const sectionEntry = sectionEntries[sectionIdx + 1];

      // Parse schedule table
      // This must be done before sectionInfo because sectionInfo removes this table from the cheerio object
      // Having this table in the cheerio object was causing inconsistent errors whilst parsing the prior section, thus I removed it.
      let scheduleEntries = $(
        `table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`,
        sectionEntry
      )
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim())
        .filter(e => e != '');

      // Parse block before schedule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .each((i, el) => {
          $(el).find('table').remove();
          $(el).find('a').remove();
        })
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim())
        .filter(e => e);

      // Sanitize sectionInfo[] of unwanted elements
      if(/Associated Term/i.test(sectionInfo[1]) === false){
        sectionInfo.splice(0, 1, sectionInfo[0] + ' ' + sectionInfo[1]);
        sectionInfo.splice(1, 1);
      }
      if(/Attributes/i.test(sectionInfo[4])){
        sectionInfo.splice(4, 1);
      }

      section.additionalInfo = sectionInfo[0];

      // Parse the associated term start and finish from the string into an object
      // i.e. "Associated Term: First Term: Sep - Dec 2019" -> { start: '201909' , end: '201912' }
      const associatedStartRegex = /(\w{3})\s*-/;
      const associatedEndRegex = /-\s*(\w{3})/;
      const yearRegex = /\d{4}/;
      const associatedStart = moment().month(associatedStartRegex.exec(sectionInfo[1])![1]).format('MM');
      const associatedEnd = moment().month(associatedEndRegex.exec(sectionInfo[1])![1]).format('MM');
      const year = yearRegex.exec(sectionInfo[1])![0];
      section.associatedTerm = {
        start: year + associatedStart,
        end: year + associatedEnd
      };

      // Parse the registration times from the string into an object
      // i.e. "Registration Dates: Jun 17, 2019 to Sep 20, 2019" -> { start: 'Jun 17, 2019', end: 'Sep 20, 2019' }
      const registrationStartRegex = /:\s*(.+)\sto/;
      const registrationEndRegex = /to\s*(.+)/;
      const registrationStart = registrationStartRegex.exec(sectionInfo[2])![1];
      const registrationEnd = registrationEndRegex.exec(sectionInfo[2])![1];
      section.registrationDates = {
        start: registrationStart,
        end: registrationEnd
      };

      // Parse the levels from the string and split them into an array
      // i.e. "Levels: Law, Undergraduate" -> [law, undergraduate]
      const levelsRegex = /:\s*(.+)/;
      const levels = levelsRegex.exec(sectionInfo[3])![1].toLowerCase();
      section.levels = levels.split(/,\s*/);

      // Check if online campus or in-person campus
      // Might change this because in the HTML it's either: online or main campus (might be other campuses too)
      if(/online/i.test(sectionInfo[4]) === true){
        section.campus = 'online';
      }
      else{
        section.campus = 'in-person';
      }

      section.sectionType = /(lecture|lab|tutorial)/i.exec(sectionInfo[5])![1].toLowerCase();

      // Check if online or in-person instructional method
      if(/online/i.test(sectionInfo[6]) === true){
        section.instructionalMethod = 'online';
      }
      else{
        section.instructionalMethod = 'in-person';
      }

      section.credits = /(\d\.\d+)/.exec(sectionInfo[7])![1];

      // Parse schedule table
      const scheduleData: Schedule[] = [];
      while (true) {
        scheduleEntries = scheduleEntries.slice(7);
        if (scheduleEntries.length == 0) {
          break;
        }
        scheduleData.push({
          type: scheduleEntries[0],
          time: scheduleEntries[1],
          days: scheduleEntries[2],
          where: scheduleEntries[3],
          dateRange: scheduleEntries[4],
          scheduleType: scheduleEntries[5],
          instructors: scheduleEntries[6],
        });
      }
      section.schedule = scheduleData;

      sections.push(section);
    }
    return sections;
  } catch (error) {
    throw new Error(`Failed to get sections: ${error}`);
  }
};
