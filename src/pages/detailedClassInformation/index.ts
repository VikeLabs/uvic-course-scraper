import { assertPageTitle } from '../../common/assertions';
import { DetailedClassInformation, levelType, classification } from '../../types';

const transformSeating = (seatInfo: number[]) => ({
  seats: {
    capacity: seatInfo[0],
    actual: seatInfo[1],
    remaining: seatInfo[2],
  },
  waitListSeats: {
    capacity: seatInfo[3],
    actual: seatInfo[4],
    remaining: seatInfo[5],
  },
});

/**
 * Get more details for a section. Most importantly, the section capacities
 */
export const detailedClassInfoExtractor = ($: cheerio.Root): DetailedClassInformation => {
  assertPageTitle('Detailed Class Information', $);

  const seatElement = $(`table[summary="This layout table is used to present the seating numbers."]>tbody>tr`);

  const seatInfo = seatElement
    .text()
    .split('\n')
    .map(e => parseInt(e, 10))
    .filter(e => !Number.isNaN(e));

  // initialize data to return
  const data: DetailedClassInformation = { ...transformSeating(seatInfo) };

  // parse requirements
  const requirementsInfo = $(
    `table[summary="This table is used to present the detailed class information."]>tbody>tr>td`
  )
    .text()
    .split('\n')
    .map(s => s.trim())
    .filter(e => e.length);

  const idx = requirementsInfo.findIndex(e => e === 'Restrictions:');
  const idxLevel = requirementsInfo.findIndex(e => e === requirementsInfo[idx + 1]);
  const idxField = requirementsInfo.findIndex(
    e => e === 'Must be enrolled in one of the following Fields of Study (Major, Minor,  or Concentration):'
  );
  const idxClassification = requirementsInfo.findIndex(
    e => e === 'Must be enrolled in one of the following Classifications:'
  );
  const idxEnd = requirementsInfo.findIndex(
    e => e === 'This course contains prerequisites please see the UVic Calendar for more information'
  );
  const numberOfLevels = idxField - (idxLevel + 1);

  // If restrictions cant be found returns undefined for level and fields
  if (idx === -1) {
    return data;
  }

  const level: levelType[] = [];
  const level1 = requirementsInfo[idxLevel + 1].toLowerCase().trim() as levelType;
  level.push(level1);

  const classification: classification[] = [];

  if (numberOfLevels > 1) {
    for (let i = 1; i < numberOfLevels; i++) {
      level.push(requirementsInfo[idxLevel + 1 + i].toLowerCase().trim() as levelType);
    }
  }

  // If fields or the end cannot be found returns undefined for fields
  if (idxField === -1 || idxEnd === -1) {
    return {
      ...data,
      requirements: {
        level: level,
        classification: classification,
      },
    };
  }

  const fields: string[] = [];
  const classifications: classification[] = [];
  let i = idxField + 1;
  let j = 0;

  if (idxClassification == -1) {
    for (i; i < idxEnd; i++) {
      fields[j] = requirementsInfo[i].trim();
      j++;
    }
  } else {
    let i = idxField + 1;
    let j = 0;

    for (i; i < idxClassification; i++) {
      fields[j] = requirementsInfo[i].trim();
      j++;
    }

    i = idxClassification + 1;
    j = 0;

    for (i; i < idxEnd; i++) {
      classifications[j] = requirementsInfo[i].trim();
      j++;
    }
  }

  return {
    ...data,
    requirements: {
      level: level as levelType[],
      fieldOfStudy: fields,
      classification: classifications,
    },
  };
};
