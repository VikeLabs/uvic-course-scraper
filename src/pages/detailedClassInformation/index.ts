import { LevelType, Seating } from '../../types';
import { assertPageTitle } from '../../common/assertions';

interface SectionDetails {
  seats: Seating;
  waitlistSeats: Seating;
  requirements: Requirements;
}

interface Requirements {
  level: LevelType[];
  fieldOfStudy: string[];
}

/**
 * Gets more details of the section. Most importantly, the section capacities
 */
export const detailedClassInfoExtractor = async ($: cheerio.Root): Promise<SectionDetails> => {
  assertPageTitle('Detailed Class Information', $);

  const seatElement = $(`table[summary="This layout table is used to present the seating numbers."]>tbody>tr`);

  const seatInfo = seatElement
    .text()
    .split('\n')
    .map(e => parseInt(e, 10))
    .filter(e => !Number.isNaN(e));

  const requirementsInfo = $(
    `table[summary="This table is used to present the detailed class information."]>tbody>tr>td`
  )
    .text()
    .split('\n')
    .map(Function.prototype.call, String.prototype.trim)
    .filter(e => e.length);

  const idx: number = requirementsInfo.findIndex(e => e === 'Restrictions:');
  const idxLevel: number = requirementsInfo.findIndex(e => e === requirementsInfo[idx + 1]);
  const idxField: number = requirementsInfo.findIndex(
    e => e === 'Must be enrolled in one of the following Fields of Study (Major, Minor,  or Concentration):'
  );
  const idxEnd: number = requirementsInfo.findIndex(
    e => e === 'This course contains prerequisites please see the UVic Calendar for more information'
  );
  const numberOfLevels: number = idxField - (idxLevel + 1);

  // If restrictions cant be found returns undefined for level and fields
  if (idx == -1) {
    console.log('idx == -1');
    const level: LevelType[] = ['undefined'];
    const fields: string[] = ['undefined'];
    return {
      seats: {
        capacity: seatInfo[0],
        actual: seatInfo[1],
        remaining: seatInfo[2],
      },
      waitlistSeats: {
        capacity: seatInfo[3],
        actual: seatInfo[4],
        remaining: seatInfo[5],
      },

      requirements: {
        level: level,
        fieldOfStudy: fields,
      },
    };
  }

  const level: LevelType[] = [];
  const level1 = requirementsInfo[idxLevel + 1].toLowerCase().trim() as LevelType;
  level.push(level1);

  if (numberOfLevels > 1) {
    for (let i = 1; i < numberOfLevels; i++) {
      level.push(requirementsInfo[idxLevel + 1 + i].toLowerCase().trim() as LevelType);
    }
  }

  // If fields or the end cannot be found returns undefined for fields
  if (idxField == -1 || idxEnd == -1) {
    console.log('idxField: ' + idxField + ' idxEnd: ' + idxEnd);
    const fields: string[] = ['undefined'];
    return {
      seats: {
        capacity: seatInfo[0],
        actual: seatInfo[1],
        remaining: seatInfo[2],
      },
      waitlistSeats: {
        capacity: seatInfo[3],
        actual: seatInfo[4],
        remaining: seatInfo[5],
      },

      requirements: {
        level: level,
        fieldOfStudy: fields,
      },
    };
  }

  const fields: string[] = [];
  let i = idxField + 1;
  let j = 0;

  for (i; i < idxEnd; i++) {
    fields[j] = requirementsInfo[i].trim();
    j++;
  }

  return {
    seats: {
      capacity: seatInfo[0],
      actual: seatInfo[1],
      remaining: seatInfo[2],
    },
    waitlistSeats: {
      capacity: seatInfo[3],
      actual: seatInfo[4],
      remaining: seatInfo[5],
    },

    requirements: {
      level: level as LevelType[],
      fieldOfStudy: fields,
    },
  };
};
