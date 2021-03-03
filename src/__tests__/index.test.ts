import nock from 'nock';

import { UVicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses.json';
import { getScheduleFileByCourse, getSectionFileByCRN } from '../dev/path-builders';
import { KualiCourseItem } from '../types';

import courseDetailJSON from './static/courseDetail.json';

const nockCourseCatalog = () => {
  nock('https://uvic.kuali.co').get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0').reply(200, coursesJSON);
};

const nockCourseDetails = (pid: string) => {
  nock('https://uvic.kuali.co')
    .get('/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/' + pid)
    .reply(200, courseDetailJSON);
};

afterEach(() => {
  nock.cleanAll();
});

describe('call getAllCourses()', () => {
  it('should have all expected data for a course', async () => {
    nockCourseCatalog();

    const { data } = await UVicCourseScraper.getAllCourses();

    const courseIdx = Math.floor(Math.random() * data.length);

    expect(data[courseIdx]).toHaveProperty('__catalogCourseId');
    expect(data[courseIdx]).toHaveProperty('__passedCatalogQuery');
    expect(data[courseIdx]).toHaveProperty('_score');
    expect(data[courseIdx]).toHaveProperty('catalogActivationDate');
    expect(data[courseIdx]).toHaveProperty('dateStart');
    expect(data[courseIdx]).toHaveProperty('id');
    expect(data[courseIdx]).toHaveProperty('pid');
    expect(data[courseIdx]).toHaveProperty('subjectCode');
    expect(data[courseIdx]).toHaveProperty('title');
  });
});

const expectSENG360 = (pid: string, courseDetails: KualiCourseItem) => {
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
  expect(courseDetails.hoursCatalogText).toStrictEqual({
    lecture: '3',
    lab: '2',
    tutorial: '0',
  });
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
};

describe('call getCourseDetails()', () => {
  it('has the expected data for a given class', async () => {
    nockCourseCatalog();

    const pid = 'SkMkeY6XV';
    nockCourseDetails(pid);

    const client = new UVicCourseScraper();
    const { data } = await client.getCourseDetails('SENG', '360');

    expectSENG360(pid, data);
  });
});

describe('call getCourseDetailsByPid()', () => {
  it('has the expected data for a given class', async () => {
    const pid = 'SkMkeY6XV';
    nockCourseDetails(pid);
    const { data } = await UVicCourseScraper.getCourseDetailsByPid(pid);

    expectSENG360(pid, data);
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
    const { data } = await UVicCourseScraper.getCourseSections(term, subject, code);

    expect(data.length).toEqual(4);

    expect(data[0].crn).toEqual('22642');
    expect(data[0].sectionCode).toEqual('A01');
    expect(data[0].additionalNotes).toEqual(
      'Reserved for students in a Computer Science program.  BSENG students should register in A02. This course will be offered fully online and asynchronous (no “real-time” sessions planned or required).'
    );
    expect(data[0].associatedTerm).toStrictEqual({ start: '202101', end: '202104' });
    expect(data[0].registrationDates).toStrictEqual({ start: 'Jun 22, 2020', end: 'Jan 22, 2021' });
    expect(data[0].levels).toStrictEqual(['graduate', 'law', 'undergraduate']);
    expect(data[0].campus).toEqual('online');
    expect(data[0].sectionType).toEqual('lecture');
    expect(data[0].instructionalMethod).toEqual('online');
    expect(data[0].credits).toEqual('1.500');
    expect(data[0].meetingTimes[0]).toHaveProperty('dateRange');
    expect(data[0].meetingTimes[0]).toHaveProperty('days');
    expect(data[0].meetingTimes[0]).toHaveProperty('instructors');
    expect(data[0].meetingTimes[0]).toHaveProperty('scheduleType');
    expect(data[0].meetingTimes[0]).toHaveProperty('time');
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
    const { data } = await UVicCourseScraper.getSectionSeats(term, crn);

    const seats = data.seats;
    const waitListSeats = data.waitListSeats;

    expect(seats.capacity).toEqual(10);
    expect(seats.actual).toEqual(10);
    expect(seats.remaining).toEqual(0);
    expect(waitListSeats.capacity).toEqual(10);
    expect(waitListSeats.actual).toEqual(2);
    expect(waitListSeats.remaining).toEqual(8);
  });
});
