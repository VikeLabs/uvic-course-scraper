import cheerio from 'cheerio';
import { getCurrTerm } from "./utils";
import { classScheduleListingExtractor } from './pages/courseListingEntries/index';
import { getSchedule } from './utils/tests/getSchedule';

const course = (subject: string, course: string, term: string = getCurrTerm()) => {
    return new Course(subject, course, term);
}
class Course {
    subject: string;
    course: string;
    term: string;

    constructor(subject: string, course: string, term: string) {
        this.subject = subject;
        this.course = course;
        this.term = term;
    }

    async getCRN() {
        const f =  await getSchedule(this.term, this.subject, this.course);
        const $ = cheerio.load(f);
        const parsed = await classScheduleListingExtractor($);
        let toRet:  string[] = [];
        parsed.forEach((element: { crn: string; }) => {
            toRet.push(element.crn);
        });

        return toRet;
    }

    async getSections() {
        const f =  await getSchedule(this.term, this.subject, this.course);
        const $ = cheerio.load(f);
        const parsed = await classScheduleListingExtractor($);
        let toRet:  string[] = [];
        parsed.forEach((element: { sectionCode: string; }) => {
            toRet.push(element.sectionCode);
        });

        return toRet;
    }
}

class Section extends Course {
    section: string;

    constructor(subject: string, course: string, term: string, section: string){
        super(subject, course, term);
        this.section = section;
    }
}

const myClass = course('CSC', '226', '202101');
const main = async () => {
    console.log(await myClass.getSections());
}

main();

export default course;