import nock from 'nock';

import { UVicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses.json';
import { getScheduleFileByCourse, getSectionFileByCRN } from '../dev/path-builders';

import courseDetailJSON from './static/courseDetail.json';

afterEach(() => {
  nock.cleanAll();
});

describe('call getAllCourses()', () => {
  it('should have all expected data for a course', async () => {
    nock('https://uvic.kuali.co').get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0').reply(200, coursesJSON);

    const client = UVicCourseScraper();
    const allCourses = await client.getAllCourses();

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

describe('call getCourseDetails()', () => {
  it('has the expected data for a given class', async () => {
    nock('https://uvic.kuali.co').get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0').reply(200, coursesJSON);
    nock('https://uvic.kuali.co')
      .get('/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/SkMkeY6XV')
      .reply(200, courseDetailJSON);

    const client = UVicCourseScraper();
    const courseDetails = await client.getCourseDetails('SkMkeY6XV');

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
    expect(courseDetails.pid).toEqual('SkMkeY6XV');
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
  });
});

describe('call getCourseSections', () => {
  it('has the expected data for a given class', async () => {
    const crns = ['22642', '22643', '22644', '22645'];
    const sectionsResponse = await getScheduleFileByCourse('202101', 'SENG', '371');
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckctlg.p_disp_listcrse?term_in=202101&subj_in=SENG&crse_in=371&schd_in=')
      .reply(200, sectionsResponse);
    // mock each detailed class info page
    for (const crn of crns) {
      const detailsResponse = await getSectionFileByCRN('202101', crn);
      nock('https://www.uvic.ca')
        .get(`/BAN1P/bwckschd.p_disp_detail_sched?term_in=202101&crn_in=${crn}`)
        .reply(200, detailsResponse);
    }

    const client = UVicCourseScraper();
    const courseSections = await client.getCourseSections('202101', 'SENG', '371');

    expect(courseSections.length).toEqual(4);

    expect(courseSections[0].crn).toEqual('22642');
    expect(courseSections[0].sectionCode).toEqual('A01');
    expect(courseSections[0].additionalNotes).toEqual(
      'Reserved for students in a Computer Science program.  BSENG students should register in A02. This course will be offered fully online and asynchronous (no “real-time” sessions planned or required).'
    );
    expect(courseSections[0].associatedTerm).toStrictEqual({ start: '202101', end: '202104' });
    expect(courseSections[0].registrationDates).toStrictEqual({ start: 'Jun 22, 2020', end: 'Jan 22, 2021' });
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

describe('call getSeats()', () => {
  it('has the expected data for a given section', async () => {
    const htmlResponse = await getSectionFileByCRN('202101', '20001');
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckschd.p_disp_detail_sched?term_in=202101&crn_in=20001')
      .reply(200, htmlResponse);

    const client = UVicCourseScraper();
    const classSeats = await client.getSeats('202101', '20001');

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
