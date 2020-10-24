import cheerio from 'cheerio';
import { Section, Schedule } from '../../types';

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
    for (let sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) {
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

      // Parse block before schdule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim());
      section.additionalInfo = sectionInfo[0];
      section.associatedTerm = sectionInfo[1].split(/:(.+)/)[1];
      // section.registrationDates = sectionInfo[2].split(/:(.+)/)[1];
      section.levels = sectionInfo[3].split(/:(.+)/)[1];
      section.location = sectionInfo[4];
      section.sectionType = sectionInfo[5];
      section.instructionalMethod = sectionInfo[6];
      section.credits = sectionInfo[7];

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
