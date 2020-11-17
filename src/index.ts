import cheerio from 'cheerio';
import { getCurrTerm } from "./utils";
import { classScheduleListingExtractor } from './pages/courseListingEntries/index';
import { getSchedule } from './utils/tests/getSchedule';

const classListing = async (subject: string, course: string, term: string = getCurrTerm()) => {
    return await new Listing(subject, course, term).createAsync();
}

const setSchedule = async (term: string, subject: string, course: string) => {
    const f =  await getSchedule(term, subject, course);
    const $ = cheerio.load(f);
    const parsed = await classScheduleListingExtractor($);
    return parsed;
}
class Listing {
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
        const tmp = new Listing(this.subject, this.course, this.term);
        tmp.data = await setSchedule(this.term, this.subject, this.course);
        return tmp;
    }

    getData() {
        return this.data;
    }

    // for testing functionality
    getSections() {
        let toRet:  string[] = [];
        this.data.forEach((element: { sectionCode: string; }) => {
            toRet.push(element.sectionCode);
        });

        return toRet;
    }
}

// TODO: Implement a class for detailed class information
// class Details {
//     ...
// }

// TESTING
const main = async () => {
    const myClass =  await classListing('CSC', '226', '202101');
    console.log(myClass.getSections());
    console.log(myClass.getData());
}

main();

export default classListing;