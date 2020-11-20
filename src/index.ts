import cheerio from 'cheerio';
import got from 'got';
import { getCurrTerm } from './utils';
import { classScheduleListingExtractor } from './pages/courseListingEntries/index';
import { getSchedule } from './utils/tests/getSchedule';

const classSchedules = async (subject: string, course: string, term: string = getCurrTerm()) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return await new Schedules(subject, course, term).createAsync();
};

// TODO: Change this function to make request
const parseSchedules = async (term: string, subject: string, course: string) => {
  const link = `https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=${term}&subj_in=${subject}&crse_in=${course}&schd_in=`;
  try {
    const response = await got(link);
    const $ = cheerio.load(response.body);
    const parsed = await classScheduleListingExtractor($);
    return parsed;
  } catch (err) {
    console.log(err.response.body);
  }
};

// function getSchedule
class Schedules {
  subject: string;
  course: string;
  term: string;
  private data: any;

  constructor(subject: string, course: string, term: string) {
    this.subject = subject;
    this.course = course;
    this.term = term;
  }

  async createAsync() {
    const tmp = new Schedules(this.subject, this.course, this.term);
    tmp.data = await parseSchedules(this.term, this.subject, this.course);
    return tmp;
  }

  getSchedules() {
    return this.data;
  }

  getSections() {
    const toRet = this.data.map((e: any) => e.sectionCode);

    return toRet;
  }

  getCRN() {
    const toRet = this.data.map((e: any) => e.crn);

    return toRet;
  }
}

// TODO: Implement a class for detailed class information
// class Details {
//     ...
// }

export default classSchedules;
