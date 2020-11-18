import cheerio from 'cheerio';
import { getCurrTerm } from "./utils";
import { classScheduleListingExtractor } from './pages/courseListingEntries/index';
import { getSchedule } from './utils/tests/getSchedule';

const classSchedules = async (subject: string, course: string, term: string = getCurrTerm()) => {
    return await new Schedules(subject, course, term).createAsync();
}

const setSchedule = async (term: string, subject: string, course: string) => {
    const f =  await getSchedule(term, subject, course);
    const $ = cheerio.load(f);
    const parsed = await classScheduleListingExtractor($);
    return parsed;
}

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
        tmp.data = await setSchedule(this.term, this.subject, this.course);
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