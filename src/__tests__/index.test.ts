import nock from 'nock';

import { UvicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses.json';
import { getSectionFileByCRN } from '../dev/path-builders';

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

describe('call getCourseDetails()', () => {
  it('has the expected data for a given class', async () => {
    nock('https://uvic.kuali.co')
      .get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0')
      .reply(200, coursesJSON);
    nock('https://uvic.kuali.co')
      .get('/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/SkMkeY6XV')
      .reply(200, {
        __passedCatalogQuery: true,
        description:
          '<p>Topics include basic cryptography, security protocols, access control, multilevel security, physical and environmental security, network security, application security, e-services security, human aspects and business continuity planning. Discusses applications which need various combinations of confidentiality, availability, integrity and covertness properties; mechanisms to incorporate and test these properties in systems. Policy and legal issues are also covered.</p>',
        pid: 'SkMkeY6XV',
        title: 'Security Engineering',
        supplementalNotes: '',
        __catalogCourseId: 'SENG360',
        proForma: 'no',
        dateStart: '2020-01-01',
        credits: { credits: { min: '1.5', max: '1.5' }, value: '1.5', chosen: 'fixed' },
        preAndCorequisites:
          '<div><div><div><ul><li><span>Complete <!-- -->all<!-- --> of the following</span><ul><li data-test="ruleView-A"><div data-test="ruleView-A-result">Complete all of: <div><ul style="margin-top:5px;margin-bottom:5px"><li><span><a href="#/courses/view/5cbdf65404ce072400156009" target="_blank">SENG265</a> <!-- -->- <!-- -->Software Development Methods<!-- --> <span style="margin-left:5px">(1.5)</span></span></li></ul></div></div></li><li data-test="ruleView-B"><div data-test="ruleView-B-result"><div>minimum third-year standing in the Software Engineering or Computer Engineering or Computer Science program.</div></div></li></ul></li></ul></div></div></div>',
        id: '5cbdf65a56bbef2400c2f0e9',
        subjectCode: {
          name: 'SENG',
          description: 'Software Engineering (SENG)',
          id: '5c14042b42504f2400e6580b',
          linkedGroup: '5c3e3006ae5f593258bbf801',
        },
        catalogActivationDate: '2019-11-15',
        hoursCatalogText: '3-2-0',
        _score: 1,
      });

    const client = await UvicCourseScraper();
    const courseDetails = await client.getCourseDetails('SENG', '360');

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
    expect(courseDetails.hoursCatalogText).toEqual('3-2-0');
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
