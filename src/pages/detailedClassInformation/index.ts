import { levelType, Seating, fieldType } from '../../types';

interface SectionDetails {
  seats: Seating;
  waitlistSeats: Seating;
  requirements: requirements;
}

interface requirements {
  level: levelType[];
  fieldOfStudy: String[];
}

/**
 * Gets more details of the section. Most importantly, the section capacities
 */
export const detailedClassInfoExtractor = async ($: cheerio.Root): Promise<SectionDetails> => {
  const seatElement = $(`table[summary="This layout table is used to present the seating numbers."]>tbody>tr`);

  const seatInfo = seatElement
    .text()
    .split('\n')
    .map(e => parseInt(e, 10))
    .filter(e => !Number.isNaN(e));

  const requirementsInfo = $(`table[summary="This table is used to present the detailed class information."]>tbody>tr>td`)
    .text()
    .split('\n')
    .filter(e => e.length);

  const idx = requirementsInfo.findIndex(e => e === 'Restrictions:');
  const idxLevel = requirementsInfo.findIndex(e => e === requirementsInfo[idx + 1]);
  const idxField = requirementsInfo.findIndex(e => e === 'Must be enrolled in one of the following Fields of Study (Major, Minor,  or Concentration):');
  const idxEnd = requirementsInfo.findIndex(e => e === 'This course contains prerequisites please see the UVic Calendar for more information');

  const tempLevel = requirementsInfo[idxLevel + 1].toLowerCase().trim();
  var level: levelType = 'unknown';

  if (tempLevel === 'undergraduate') {
    var level: levelType = 'undergraduate';
  }
  else if (tempLevel === 'graduate') {
    var level: levelType = 'graduate';
  }
  else if (tempLevel === 'law') {
    var level: levelType = 'law';
  }

  var fields: String[] = [];
  var i = idxField + 1;
  var j = 0;
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
      level: [level],
      fieldOfStudy: fields,
    }
  };
};
