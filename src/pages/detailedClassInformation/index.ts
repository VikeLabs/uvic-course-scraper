import { assertPageTitle } from '../../common/assertions';
import { DetailedClassInformation, levelType, classification, Requirements, requirementObject } from '../../types';

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
    .map((e) => parseInt(e, 10))
    .filter((e) => !Number.isNaN(e));

  // initialize data to return
  const data: DetailedClassInformation = { ...transformSeating(seatInfo) };

  // parse requirements
  const requirementsInfo = $(
    `table[summary="This table is used to present the detailed class information."]>tbody>tr>td`
  )
    .text()
    .split('\n')
    .map((s) => s.trim())
    .filter((e) => e.length);

  // regex statement to grab requirements, ignores "restrictions:" title
  const regex = new RegExp(/^(?!restrictions).*:$/, 'i');

  // list of requirement indeces for parsing
  let requirementsIdxList: number[] = [];
  requirementsIdxList = requirementsInfo
    .map((el, idx: number) => (regex.test(el) ? idx : ''))
    .filter(String) as number[];

  // list of requirments for parsing
  const requirementsList: string[] = [];
  requirementsIdxList.forEach((el) => requirementsList.push(requirementsInfo[el]));

  // initialize requirements object
  const requirements = {} as Requirements;
  const requirementObjectList = [] as requirementObject[];

  // list of known requirements and there strings
  const knownRequiremnts = {
    level: 'Must be enrolled in one of the following Levels:',
    fieldOfStudy: 'Must be enrolled in one of the following Fields of Study (Major, Minor,  or Concentration):',
    classification: 'Must be enrolled in one of the following Classifications:',
    negClassification: 'May not be enrolled as the following Classifications:',
    degree: 'Must be enrolled in one of the following Degrees:',
    program: 'Must be enrolled in one of the following Programs:',
    negProgram: 'May not be enrolled in one of the following Programs:',
    college: 'Must be enrolled in one of the following Colleges:',
    negCollege: 'May not be enrolled in one of the following Colleges:',
    major: 'Must be enrolled in one of the following Majors:',
  };

  // classification list for negative classification parsing
  const classificationList = ['unclassified', 'YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5'];

  // to appease the typescript gods >:()
  type requirementKey = keyof Requirements;

  // itterate through requirements list and
  requirementsList.forEach((req, i) => {
    const requirementObject = {} as requirementObject;
    requirementObject.idx = requirementsIdxList[i];
    if (Object.values(knownRequiremnts).includes(req)) {
      requirementObject.known = true;
      requirementObject.requirement = Object.keys(knownRequiremnts).find(
        (key) => knownRequiremnts[key as requirementKey] === req
      ) as string;
    } else requirementObject.known = false;
    requirementObjectList.push(requirementObject);
  });

  let idxEnd = requirementsInfo.findIndex(
    (e) => e === 'This course contains prerequisites please see the UVic Calendar for more information'
  );

  // if there is no end string, set idxEnd to where it would be
  if (idxEnd == -1) {
    idxEnd = requirementsInfo.length;
  }

  // adds requirements to requirements object to be returned
  function addRequirements(requirementType: requirementKey, idx: number, nextIdx: number) {
    if (requirementType === 'level') {
      requirements['level'] = requirementsInfo.slice(idx + 1, nextIdx).map((v) => v.toLowerCase().trim() as levelType);
    } else if (requirementType === 'classification') {
      requirements['classification'] = requirementsInfo
        .slice(idx + 1, nextIdx)
        .map((v) => v.trim().toUpperCase().replace(' ', '_') as classification);
    } else if (requirementType === 'negClassification') {
      const negClassification = requirementsInfo
        .slice(idx + 1, nextIdx)
        .map((v) => v.trim().toUpperCase().replace(' ', '_') as classification);
      requirements['classification'] = classificationList.filter(
        (y) => !negClassification.includes(y as classification)
      ) as classification[];
    } else {
      requirements[requirementType] = requirementsInfo.slice(idx + 1, nextIdx).map((v) => v.trim() as string);
    }
  }

  /**
   * if the requirement is known (ie. in 'knownRequirements' object) then pass indeces to 'addRequirements' to
   * add the parsed requirements.
   *
   * if not known do nothing (skips over unknown requirement and will not be returned)
   */
  requirementObjectList.forEach((req, i) => {
    if (req.known) {
      if (requirementObjectList[i + 1] !== undefined) {
        addRequirements(req.requirement as requirementKey, req.idx, requirementObjectList[i + 1].idx);
      } else addRequirements(req.requirement as requirementKey, req.idx, idxEnd);
    }
  });

  // return parsed seating and requirements data
  return {
    ...data,
    requirements,
  };
};
