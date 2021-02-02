import * as cheerio from 'cheerio';
import nock from 'nock';

import { UvicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses.json';
import { getScheduleFileByCourse, getSectionFileByCRN } from '../dev/path-builders';

afterEach(() => {
  nock.cleanAll();
});

describe('call getAllCourses()', () => {
  it('should have all expected data for a course', async () => {
    nock('https://uvic.kuali.co')
      .get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0')
      .reply(200, coursesJSON);

    const client = await UvicCourseScraper();
    const allCourses = await client.getAllCourses();

    const courseIdx = Math.floor(Math.random() * allCourses.length);

    expect(allCourses[courseIdx]).toHaveProperty('__catalogCourseId');
    expect(allCourses[courseIdx]).toHaveProperty('__passedCatalogQuery');
    expect(allCourses[courseIdx]).toHaveProperty('_score');
    expect(allCourses[courseIdx]).toHaveProperty('catalogActivationDate');
    expect(allCourses[courseIdx]).toHaveProperty('dateStart');
    expect(allCourses[courseIdx]).toHaveProperty('getDetails');
    expect(allCourses[courseIdx]).toHaveProperty('id');
    expect(allCourses[courseIdx]).toHaveProperty('pid');
    expect(allCourses[courseIdx]).toHaveProperty('subjectCode');
    expect(allCourses[courseIdx]).toHaveProperty('title');
  });
});

describe('call getSeats()', () => {
  it('has the expected data for a given section', async () => {
    const htmlResponse = await getSectionFileByCRN('202101', '20001');
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckschd.p_disp_detail_sched?term_in=202101&crn_in=20001')
      .reply(200, htmlResponse);

    const client = await UvicCourseScraper();
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

describe('call getCourseSectionsByTerm', () => {
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

    const client = await UvicCourseScraper();
    const courseSections = await client.getCourseSectionsByTerm('202101', 'SENG', '371');

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
    expect(courseSections[0].seats).toStrictEqual({ capacity: 8, actual: 7, remaining: 1 });
    expect(courseSections[0].waitListSeats).toStrictEqual({ capacity: 100, actual: 1, remaining: 99 });
    expect(courseSections[0].requirements).toHaveProperty('level');
    expect(courseSections[0].requirements).toHaveProperty('fieldOfStudy');
    expect(courseSections[0].requirements).toHaveProperty('classification');
  });
});
