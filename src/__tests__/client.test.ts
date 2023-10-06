jest.mock('../common/utils');
import nock from 'nock';
import { mocked } from 'ts-jest/utils';

import { UVicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses-202009.json';
import subjects202009 from '../../static/subjects/subjects-202009.json';
import subjects202105 from '../../static/subjects/subjects-202105.json';
import { getCatalogIdForTerm, getCurrentTerm } from '../common/utils';
import {
  getCourseDetailByPidSync,
  getMapsAndBuildings,
  getScheduleFileByCourse,
  getSectionFileByCRN,
} from '../dev/path-builders';
import { KualiCourseItemParsed } from '../types';

const mockGetCurrentTerm = mocked(getCurrentTerm);
const mockGetCatalogIdForTerm = mocked(getCatalogIdForTerm);

const nockCourseCatalog = (term: string) => {
  nock('https://uvic.kuali.co')
    .get(`/api/v1/catalog/courses/${getCatalogIdForTerm(term)}`)
    .reply(200, coursesJSON);
};

const nockCourseDetails = (term: string, pid: string) => {
  nock('https://uvic.kuali.co')
    .get(`/api/v1/catalog/course/${getCatalogIdForTerm(term)}/${pid}`)
    .reply(200, getCourseDetailByPidSync(term, pid));
};

afterEach(() => {
  nock.cleanAll();
});

describe('call getCourses()', () => {
  it('should have all expected data for a course', async () => {
    nockCourseCatalog('202101');

    const { response: allCourses } = await UVicCourseScraper.getCourses('202101');

    const courseIdx = Math.floor(Math.random() * allCourses.length);

    expect(allCourses[courseIdx]).toHaveProperty('__catalogCourseId');
    expect(allCourses[courseIdx]).toHaveProperty('__passedCatalogQuery');
    expect(allCourses[courseIdx]).toHaveProperty('_score');
    expect(allCourses[courseIdx]).toHaveProperty('catalogActivationDate');
    expect(allCourses[courseIdx]).toHaveProperty('dateStart');
    expect(allCourses[courseIdx]).toHaveProperty('id');
    expect(allCourses[courseIdx]).toHaveProperty('pid');
    expect(allCourses[courseIdx]).toHaveProperty('subjectCode');
    expect(allCourses[courseIdx]).toHaveProperty('title');
  });
});

const expectSENG360 = (pid: string, courseDetails: KualiCourseItemParsed) => {
  expect(courseDetails.description).toEqual(
    'Topics include basic cryptography, security protocols, access control, multilevel security, physical and environmental security, network security, application security, e-services security, human aspects and business continuity planning. Discusses applications which need various combinations of confidentiality, availability, integrity and covertness properties; mechanisms to incorporate and test these properties in systems. Policy and legal issues are also covered.'
  );
  expect(courseDetails.supplementalNotes).toEqual('');
  expect(courseDetails.proForma).toEqual('no');
  expect(courseDetails.credits).toStrictEqual({
    credits: { min: '1.5', max: '1.5' },
    value: '1.5',
    chosen: 'fixed',
  });
  expect(courseDetails.crossListedCourses).toBeUndefined();
  expect(courseDetails.hoursCatalog).toStrictEqual([
    {
      lecture: '3',
      lab: '2',
      tutorial: '0',
    },
  ]);
  expect(courseDetails.__catalogCourseId).toEqual('SENG360');
  expect(courseDetails.__passedCatalogQuery).toBeTruthy();
  expect(courseDetails.dateStart).toEqual('2020-01-01');
  expect(courseDetails.pid).toEqual(pid);
  expect(courseDetails.id).toEqual('5cbdf65a56bbef2400c2f0e9');
  expect(courseDetails.title).toEqual('Security Engineering');
  expect(courseDetails.subjectCode).toStrictEqual({
    name: 'SENG',
    description: 'Software Engineering (SENG)',
    id: '5c14042b42504f2400e6580b',
    linkedGroup: '5c3e3006ae5f593258bbf801',
  });
  expect(courseDetails.catalogActivationDate).toEqual('2019-11-15');
  expect(courseDetails._score).toEqual(1);
  expect(courseDetails.preAndCorequisites).toStrictEqual([
    {
      quantity: 'ALL',
      reqList: [
        {
          quantity: 'ALL',
          reqList: [{ subject: 'SENG', code: '265' }],
        },
        'minimum third-year standing in the Software Engineering or Computer Engineering or Computer Science program.',
      ],
    },
  ]);
  expect(courseDetails.preOrCorequisites).toBeUndefined();
};

describe('call getCourseDetails()', () => {
  it('has the expected data for a given class', async () => {
    const term = '202101';
    nockCourseCatalog(term);

    const pid = 'SkMkeY6XV';
    nockCourseDetails(term, pid);

    const client = new UVicCourseScraper();
    const response = await client.getCourseDetails(term, 'SENG', '360');

    expect(response).toBeDefined();
    if (response) {
      expectSENG360(pid, response.response);
    }
  });
});

describe('call getCourseDetailsByPid()', () => {
  it('has the expected data for a given class', async () => {
    const pid = 'SkMkeY6XV';
    const term = '202101';
    nockCourseDetails(term, pid);

    const { response: courseDetails } = await UVicCourseScraper.getCourseDetailsByPid(term, pid);

    expectSENG360(pid, courseDetails);
  });
});

describe('call getCourseSections', () => {
  it('has the expected data for a given class', async () => {
    const term = '202101';
    const subject = 'SENG';
    const code = '371';
    const sectionsResponse = await getScheduleFileByCourse(term, subject, code);
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckctlg.p_disp_listcrse?term_in=' + term + '&subj_in=' + subject + '&crse_in=' + code + '&schd_in=')
      .reply(200, sectionsResponse);
    const { response: courseSections } = await UVicCourseScraper.getCourseSections(term, subject, code);

    expect(courseSections.length).toEqual(4);

    expect(courseSections[0].crn).toEqual('22642');
    expect(courseSections[0].sectionCode).toEqual('A01');
    expect(courseSections[0].additionalNotes).toEqual(
      'Reserved for students in a Computer Science program.  BSENG students should register in A02. This course will be offered fully online and asynchronous (no “real-time” sessions planned or required).'
    );
    expect(courseSections[0].associatedTerm).toStrictEqual({ start: '202101', end: '202104' });
    expect(courseSections[0].registrationDates).toStrictEqual({
      start: 'Jun 22, 2020',
      end: 'Jan 22, 2021',
    });
    expect(courseSections[0].levels).toStrictEqual(['graduate', 'law', 'undergraduate']);
    expect(courseSections[0].campus).toEqual('online');
    expect(courseSections[0].sectionType).toEqual('lecture');
    expect(courseSections[0].instructionalMethod).toEqual('online');
    expect(courseSections[0].credits).toEqual('1.500');
    expect(courseSections[0].meetingTimes[0]).toHaveProperty('dateRange');
    expect(courseSections[0].meetingTimes[0]).toHaveProperty('days');
    expect(courseSections[0].meetingTimes[0]).toHaveProperty('instructors');
    expect(courseSections[0].meetingTimes[0]).toHaveProperty('scheduleType');
    expect(courseSections[0].meetingTimes[0]).toHaveProperty('time');
  });
});

describe('call getSectionSeats()', () => {
  const term = '202101';
  const crn = '20001';
  it('has the expected data for a given section', async () => {
    const htmlResponse = await getSectionFileByCRN(term, crn);
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckschd.p_disp_detail_sched?term_in=' + term + '&crn_in=' + crn)
      .reply(200, htmlResponse);
    const { response: classSeats } = await UVicCourseScraper.getSectionSeats(term, crn);

    const seats = classSeats.seats;
    const waitListSeats = classSeats.waitListSeats;

    expect(seats.capacity).toEqual(10);
    expect(seats.actual).toEqual(10);
    expect(seats.remaining).toEqual(0);
    expect(waitListSeats.capacity).toEqual(10);
    expect(waitListSeats.actual).toEqual(2);
    expect(waitListSeats.remaining).toEqual(8);
  });
});

describe('call getSubjects()', () => {
  afterEach(() => {
    mockGetCurrentTerm.mockClear();
    mockGetCatalogIdForTerm.mockClear();
  });

  describe('with term', () => {
    it('returns the subjects correctly', async () => {
      mockGetCurrentTerm.mockReturnValue('202105');
      mockGetCatalogIdForTerm.mockReturnValue('5ff357f8d30280001b0c26dd');

      nock('https://www.uvic.ca')
        .get('/BAN1P/pkg_kuali_api.pr_get_catalog?p_catalog=' + '5ff357f8d30280001b0c26dd')
        .reply(200, subjects202105);
      expect((await UVicCourseScraper.getSubjects('202105')).length).toBeGreaterThan(0);
    });
  });

  describe('without term', () => {
    it('returns the subjects correctly', async () => {
      mockGetCatalogIdForTerm.mockReturnValue('5d9ccc4eab7506001ae4c225');

      nock('https://www.uvic.ca')
        .get('/BAN1P/pkg_kuali_api.pr_get_catalog?p_catalog=' + '5d9ccc4eab7506001ae4c225')
        .reply(200, subjects202009);
      expect((await UVicCourseScraper.getSubjects()).length).toBeGreaterThan(0);
    });
  });
});

describe('call getBuildings()', () => {
  it('calls the expected URL and returns an array of building info', async () => {
    nock('https://www.uvic.ca')
      .get('/search/maps-buildings/index.php')
      .reply(200, await getMapsAndBuildings());
    expect((await UVicCourseScraper.getBuildings()).response.length).toBeGreaterThan(0);
  });
});
