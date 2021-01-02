import cheerio from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { assertPageTitle } from '../../common/assertions';
import { ClassScheduleListing, MeetingTimes, levelType, sectionType } from '../../types';

dayjs.extend(customParseFormat);

export const classScheduleListingExtractor = async ($: cheerio.Root): Promise<ClassScheduleListing[]> => {
  assertPageTitle('Class Schedule Listing', $);

  const regex = /(.+) - (\d+) - ([\w|-]{0,4} \w?\d+\w?) - ([A|B|T]\d+)/;
  const classSchedules: ClassScheduleListing[] = [];
  const sectionEntries = $(`table[summary="This layout table is used to present the sections found"]>tbody>tr`);
  for (let sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) {
    const classSchedule = {} as ClassScheduleListing;

    // Parse Title block e.g. "Algorithms and Data Structures I - 30184 - CSC 225 - A01"
    const title = $('a', sectionEntries[sectionIdx]);
    const m = regex.exec(title.text());
    if (m) {
      classSchedule.crn = m[2];
      classSchedule.sectionCode = m[4];
    }

    // Section info is divided into 2 table rows, here we get the second one
    const sectionEntry = sectionEntries[sectionIdx + 1];

    // Parse schedule table
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
    const additionalNotesRegex = /(.*)Associated Term/s;
    const associatedTermRegex = /Associated Term:\s*(.*)/i;
    const associatedStartRegex = /(\w{3})\s*-/;
    const associatedEndRegex = /-\s*(\w{3})/;
    const registrationDatesRegex = /Registration Dates:\s*(.*)/i;
    const registrationStartRegex = /(.+)\s*to/;
    const registrationEndRegex = /to\s*(.+)/;
    const yearRegex = /\d{4}/;
    const levelsRegex = /Levels:\s*(.+)/i;
    const campusRegex = /online/i;
    const sectionTypeRegex = /(.*)\s+schedule\s*type/i;
    const instructionalMethodRegex = /\s*(.*)\s*instructional method/i;
    const creditsRegex = /\s*(\d\.\d+)\s*credits/i;

    if (additionalNotesRegex.test(sectionInfo)) {
      classSchedule.additionalNotes = additionalNotesRegex.exec(sectionInfo)![1].trim();
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
        classSchedule.associatedTerm = {
          start: year + associatedStart,
          end: year + associatedEnd,
        };
      }
    }

    // Parse the registration times from the string into an object
    // i.e. "Registration Dates: Jun 17, 2019 to Sep 20, 2019" -> { start: 'Jun 17, 2019', end: 'Sep 20, 2019' }
    if (registrationDatesRegex.test(sectionInfo)) {
      const registrationDates = registrationDatesRegex.exec(sectionInfo)![1];
      if (registrationStartRegex.test(registrationDates) && registrationEndRegex.test(registrationDates)) {
        const registrationStart = registrationStartRegex.exec(registrationDates)![1].trim();
        const registrationEnd = registrationEndRegex.exec(registrationDates)![1].trim();
        classSchedule.registrationDates = {
          start: registrationStart,
          end: registrationEnd,
        };
      }
    }

    // Parse the levels from the string and split them into an array
    // i.e. "Levels: Law, Undergraduate" -> [law, undergraduate]
    if (levelsRegex.test(sectionInfo)) {
      const levels = levelsRegex
        .exec(sectionInfo)![1]
        .toLowerCase()
        .trim();
      classSchedule.levels = levels.split(/,\s*/) as levelType[];
    }

    // Check if online campus or in-person campus
    if (campusRegex.test(sectionInfo)) {
      classSchedule.campus = 'online';
    } else {
      classSchedule.campus = 'in-person';
    }

    if (sectionTypeRegex.test(sectionInfo)) {
      classSchedule.sectionType = sectionTypeRegex.exec(sectionInfo)![1].toLowerCase() as sectionType;
    }

    // Check if online or in-person instructional method
    if (instructionalMethodRegex.test(sectionInfo)) {
      classSchedule.instructionalMethod = instructionalMethodRegex
        .exec(sectionInfo)![1]
        .toLowerCase()
        .trim();
    }

    // TODO: parse this into int
    if (creditsRegex.exec(sectionInfo)) {
      classSchedule.credits = creditsRegex.exec(sectionInfo)![1];
    }

    // Parse schedule table
    const meetingTimes: MeetingTimes[] = [];
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
      meetingTimes.push({
        type: scheduleEntries[0],
        time: scheduleEntries[1],
        days: scheduleEntries[2],
        where: scheduleEntries[3],
        dateRange: scheduleEntries[4],
        scheduleType: scheduleEntries[5],
        instructors: scheduleEntries[6].split(/\s*,\s*/),
      });
    }
    classSchedule.meetingTimes = meetingTimes;
    classSchedules.push(classSchedule);
  }
  return classSchedules;
};
