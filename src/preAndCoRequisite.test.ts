import { getPreAndCoReqData } from './preAndCoRequisite';

// title: Course Listing Term
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date

describe('preAndCoReq information from Courses.json', (): void => {
  const data = getPreAndCoReqData('AHVS430');

  const expectedCourses =
    'Complete 1 of: ' +
    'AHVS230 - Monuments of South and Southeast Asia (1.5)' +
    'AHVS330A - Early Arts of South Asia (1.5)' +
    'AHVS330B - Later Arts of South Asia (1.5)' +
    'AHVS333A - Early Arts of Southeast Asia (1.5)' +
    'AHVS333B - Later Arts of Southeast Asia (1.5)' +
    'AHVS337 - Special Topics in Contemporary Asian Art (1.5)' +
    'HA230 - Monuments of South and Southeast Asia (1.5)' +
    'HA330A - Early Arts of South Asia (1.5)' +
    'HA330B - Later Arts of South Asia (1.5)' +
    'HA333A - Early Arts of Southeast Asia (1.5)' +
    'HA333B - Later Arts of Southeast Asia (1.5)' +
    'HA337 - Special Topics in Contemporary Asian Art (1.5)';

  it('has page has the expected courses', (): void => {
    expect(data.completeAllOfTheFollowing.oneCourse[0]).toEqual(expect.stringContaining(expectedCourses));
  });

  it('has the expected standing', (): void => {
    expect(data.completeAllOfTheFollowing.standing[0]).toBe('minimum fourth-year standing.');
  });
  //Next few test cases should be empty because the course tested requires "Complete all of the following"
  const expectedEmptyArray = [''];
  it('the expected other', (): void => {
    expect(data.completeAllOfTheFollowing.other).toEqual(expect.arrayContaining(expectedEmptyArray));
  });

  it('has the expected value for CompleteOne key', (): void => {
    expect(data.completeOne.other).toEqual(expect.arrayContaining(expectedEmptyArray));
    expect(data.completeOne.allCourses).toEqual(expect.arrayContaining(expectedEmptyArray));
    expect(data.completeOne.oneCourse).toEqual(expect.arrayContaining(expectedEmptyArray));
    expect(data.completeOne.standing).toEqual(expect.arrayContaining(expectedEmptyArray));
  });
});
