import { getPreAndCoReqData } from './preAndCoRequisite';

// title: Course Listing Term
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date

describe('preAndCoReq information from Courses.json', (): void => {
  const data = getPreAndCoReqData('AHVS420');

  const expectedCourses = [
    'AHVS321 - Late Antique and Early Christian Art (1.5)',
    'AHVS323 - Byzantine Art (1.5)',
    'AHVS326 - Early Medieval Art (1.5)',
    'AHVS328 - Gothic Art and Architecture (1.5)',
    'HA321 - Late Antique and Early Christian Art (1.5)',
    'HA323 - Byzantine Art (1.5)',
    'HA326 - Early Medieval Art (1.5)',
    'HA328 - Gothic Art and Architecture (1.5)',
    'HIST236 - Medieval Europe (3.0)',
    'HSTR236A - The Creation of the Medieval World (1.5)',
  ];

  it('has page has the expected courses', (): void => {
    expect(data.all.one.courses).toEqual(expect.arrayContaining(expectedCourses));
  });

  const expectedUnits = ['1.5 units of 300 or 400 level MEDI courses'];
  it('has page has the expected courses', (): void => {
    expect(data.all.one.units).toEqual(expect.arrayContaining(expectedUnits));
  });

  it('has page has the expected standing', (): void => {
    expect(data.all.standing[0]).toBe('minimum fourth-year standing.');
  });
});
