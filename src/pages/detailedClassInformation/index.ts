import { Seating } from '../../types';
import { assertPageTitle } from '../../common/assertions';

interface SectionDetails {
  seats: Seating;
  waitlistSeats: Seating;
  requirements: string[];
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
  const requirements = $(`table[summary="This table is used to present the detailed class information."]>tbody>tr>td`)
    .text()
    .split('\n')
    .filter(e => e.length);
  const idx = requirements.findIndex(e => e === 'Restrictions:');
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
    requirements: requirements.slice(idx + 1),
  };
};
