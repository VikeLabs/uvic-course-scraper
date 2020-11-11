import { selectSeries } from 'async';
import cheerio from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Section, Schedule, levelType, sectionType, deliveryMethodType } from '../../types';
import { getSchedule } from '../../utils/tests/getSchedule';

dayjs.extend(customParseFormat);

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
      // Having this table in the cheerio object was causing inconsistent errors whilst parsing the prior section, thus I removed it.\
      // ***This doesn't have to be before sectionInfo anymore, but it's not make or break being here
      let scheduleEntries = $(
        `table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`,
        sectionEntry
      )
        .text()
        .trim()
        .split('\n');

      // Parse block before schedule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .each((i, el) => {
          $(el)
            .find('table')
            .remove();
          $(el)
            .find('a')
            .remove();
        })
        .text()
        .trim();

      // Declare RegEx patterns
      const additionalInfoRegex = /(.*)Associated Term/s;
      const associatedTermRegex = /Associated Term:\s*(.*)/i;
      const associatedStartRegex = /(\w{3})\s*-/;
      const associatedEndRegex = /-\s*(\w{3})/;
      const registrationDatesRegex = /Registration Dates:\s*(.*)/i;
      const registrationStartRegex = /(.+)\s*to/;
      const registrationEndRegex = /to\s*(.+)/;
      const levelsRegex = /Levels:\s*(.+)/i;
      const sectionTypeRegex = /(.*)\s+schedule\s*type/i;
      const instructionalMethodRegex = /\s*(.*)\s*instructional method/i;
      const creditsRegex = /\s*(\d\.\d+)\s*credits/i;
      const yearRegex = /\d{4}/;

      if (additionalInfoRegex.test(sectionInfo)) {
        section.additionalInfo = additionalInfoRegex.exec(sectionInfo)![1].trim();
      }

      // Parse the associated term start and finish from the string into an object
      // i.e. "Associated Term: First Term: Sep - Dec 2019" -> { start: '201909' , end: '201912' }
      if (associatedTermRegex.test(sectionInfo)) {
        const associatedTerm = associatedTermRegex.exec(sectionInfo)![1];
        if (
          associatedEndRegex.test(associatedTerm) &&
          associatedStartRegex.test(associatedTerm) &&
          yearRegex.test(associatedTerm)
        ) {
          const associatedStart = dayjs(associatedStartRegex.exec(associatedTerm)![1], 'MMM').format('MM');
          const associatedEnd = dayjs(associatedEndRegex.exec(associatedTerm)![1], 'MMM').format('MM');
          const year = yearRegex.exec(associatedTerm)![0];
          section.associatedTerm = {
            start: year + associatedStart,
            end: year + associatedEnd,
          };
        }
      }
      console.log(section.associatedTerm);

      // Parse the registration times from the string into an object
      // i.e. "Registration Dates: Jun 17, 2019 to Sep 20, 2019" -> { start: 'Jun 17, 2019', end: 'Sep 20, 2019' }
      if (registrationDatesRegex.test(sectionInfo)) {
        const registrationDates = registrationDatesRegex.exec(sectionInfo)![1];
        if (registrationStartRegex.test(registrationDates) && registrationEndRegex.test(registrationDates)) {
          const registrationStart = registrationStartRegex.exec(registrationDates)![1].trim();
          const registrationEnd = registrationEndRegex.exec(registrationDates)![1].trim();
          section.registrationDates = {
            start: registrationStart,
            end: registrationEnd,
          };
        }
      }
      console.log(section.registrationDates);

      // Parse the levels from the string and split them into an array
      // i.e. "Levels: Law, Undergraduate" -> [law, undergraduate]
      if (levelsRegex.test(sectionInfo)) {
        const levels = levelsRegex
          .exec(sectionInfo)![1]
          .toLowerCase()
          .trim();
        section.levels = levels.split(/,\s*/) as levelType[];
      }
      console.log(section.levels);

      // Check if online campus or in-person campus
      // Might change this because in the HTML it's either: online or main campus (might be other campuses too)
      // Problem may arise if classes are offered online & in-person, will look into
      if (/online/i.test(sectionInfo)) {
        section.campus = 'online';
      } else {
        section.campus = 'in-person';
      }
      console.log(section.campus);

      if (sectionTypeRegex.test(sectionInfo)) {
        section.sectionType = sectionTypeRegex.exec(sectionInfo)![1].toLowerCase() as sectionType;
      }
      console.log(section.sectionType);

      // Check if online or in-person instructional method
      if (instructionalMethodRegex.test(sectionInfo)) {
        section.instructionalMethod = instructionalMethodRegex
          .exec(sectionInfo)![1]
          .toLowerCase()
          .trim();
      }
      console.log(section.instructionalMethod);

      if (creditsRegex.exec(sectionInfo)) {
        section.credits = creditsRegex.exec(sectionInfo)![1];
      }

      // Parse schedule table
      const scheduleData: Schedule[] = [];
      while (true) {
        scheduleEntries = scheduleEntries.slice(7);
        if (scheduleEntries[0] == '') {
          while (scheduleEntries[0].length == 0) {
            scheduleEntries = scheduleEntries.slice(1);
          }
        }
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
          instructors: scheduleEntries[6].split(/\s*,\s*/),
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