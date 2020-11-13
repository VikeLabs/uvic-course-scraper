import cheerio from 'cheerio';
import { classScheduleListingExtractor } from './pages/courseListingEntries/index';
import { getSchedule, getScheduleBySubject, getScheduleByTerm } from './utils/tests/getSchedule';

// Returns a list of CRNs given a course and it's term
// Just a test function for the NPM package
const getCRN = async (subject: string, course: string, term: string) =>{
    const f =  await getSchedule(term, subject, course);
    const $ = cheerio.load(f);
    const parsed = await classScheduleListingExtractor($);
    let toRet:  string[] = [];
    parsed.forEach((element: { crn: string; }) => {
        toRet.push(element.crn);
    });

    return toRet;
}

export default getCRN;