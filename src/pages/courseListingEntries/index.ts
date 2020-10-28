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
      section.title = title.text();
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

      // Parse block before schedule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim())
        .filter(e => e);
      section.additionalInfo = sectionInfo[0];

      if(/Associated Term/.test(sectionInfo[1]) === false){
        sectionInfo.splice(0, 1, sectionInfo[0] + ' ' + sectionInfo[1]);
        sectionInfo.splice(1, 1);
      }

      console.log(sectionInfo);

      const associatedStartRegex = /(\w{3})\s*-/;
      const associatedEndRegex = /-\s*(\w{3})/;
      const yearRegex = /\d{4}/;

      // get associated term start and end dates in MM format
      const associatedStart = moment().month(associatedStartRegex.exec(sectionInfo[1])![1]).format('MM');
      const associatedEnd = moment().month(associatedEndRegex.exec(sectionInfo[1])![1]).format('MM');
      const year = yearRegex.exec(sectionInfo[1])![0];

      section.associatedTerm = {
        start: year + associatedStart,
        end: year + associatedEnd
      };

      //{ start: 'Jun 22, 2020', end: 'Sep 25, 2020' }
      const registrationStartRegex = /:\s*(.+)\sto/;
      const registrationEndRegex = /to\s*(.+)/;

      const registrationStart = registrationStartRegex.exec(sectionInfo[2])![1];
      const registrationEnd = registrationEndRegex.exec(sectionInfo[2])![1];

      section.registrationDates = {
        start: registrationStart,
        end: registrationEnd
      };

      // section.levels = sectionInfo[3].split(/:(.+)/)[1];
      // section.location = sectionInfo[4];
      // section.sectionType = sectionInfo[5];
      // section.instructionalMethod = sectionInfo[6];
      // section.credits = sectionInfo[7];

      // Parse schedule table
      let scheduleEntries = $(
        `table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`,
        sectionEntry
      )
        .text()
        .split('\n')
        .filter(e => e.length);
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
