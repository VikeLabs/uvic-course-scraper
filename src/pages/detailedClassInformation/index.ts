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

  // TODO: fix this (not always right)
  const numberOfLevels = idxField - (idxLevel + 1);

  // If restrictions can't be found return just seating info.
  if (idx === -1) {
    return data;
  }

  const level = requirementsInfo
    .slice(idxLevel + 1, idxLevel + numberOfLevels + 1)
    .map(v => v.toLowerCase().trim() as levelType);

  // If fields or the end cannot be found returns undefined for fields
  if (idxField === -1 || idxEnd === -1) {
    return {
      ...data,
      requirements: {
        level,
      },
    };
  }

  // requirements/classification parsing
  const classification: classification[] = [];
  const fields: string[] = [];

  if (idxClassification === -1) {
    // no classification entires exist

    requirementsInfo.slice(idxField + 1, idxEnd).forEach(v => fields.push(v.trim()));
  } else {
    // classification entries exist

    requirementsInfo.slice(idxField + 1, idxClassification).forEach(v => fields.push(v.trim()));
    const d = requirementsInfo
      .slice(idxClassification + 1, idxEnd)
      .map(v => (v.indexOf('Year') !== -1 ? (v.toUpperCase().replace(' ', '_') as classification) : null));

    classification.push(...d);
  }

  return {
    ...data,
    requirements: {
      level,
      fieldOfStudy: fields,
      classification,
    },
  };
};
