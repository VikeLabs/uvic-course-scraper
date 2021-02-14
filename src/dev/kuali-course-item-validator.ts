import coursesJSON from '../../static/courses/courses.json';
import { ParsedKualiCourse } from '../types';

/**
 * Tool designed to identify optional json fields in the parsedKualiCourse type
 * For most up-to-date results, run course-dump before hand
 *
 * Counts the number of times each field is found in a Kuali course
 * Any fields found which are not a field of 'fieldCounter' will have a count of NaN
 */

// All fields copied from parsedKualiCourse type
const fieldCounter = {
  __catalogCourseId: 0,
  __passedCatalogQuery: 0,
  dateStart: 0,
  pid: 0,
  id: 0,
  title: 0,
  subjectCode: 0,
  catalogActivationDate: 0,
  _score: 0,
  description: 0,
  supplementalNotes: 0,
  proForma: 0,
  credits: 0,
  crossListedCourses: 0,
  hoursCatalogText: 0,
};

const countFields = (parsedKualiCourse: ParsedKualiCourse, key: string) => {
  fieldCounter[key as keyof ParsedKualiCourse]++;
};

const getFieldCount = (key: string) => {
  return fieldCounter[key as keyof ParsedKualiCourse];
};

const main = async () => {
  const parsedKualiCourses = coursesJSON as ParsedKualiCourse[];

  for (const parsedKualiCourse of parsedKualiCourses) {
    for (const key in parsedKualiCourse) {
      countFields(parsedKualiCourse, key);
    }
  }

  const total = parsedKualiCourses.length;

  console.log('-------- Persistent Fields --------');

  for (const key in parsedKualiCourses[0]) {
    const count = getFieldCount(key);

    if (count === total) {
      console.log(count + ' ' + key);
    }
  }

  console.log('-------- Optional Fields --------');

  for (const key in parsedKualiCourses[0]) {
    const count = getFieldCount(key);

    if (count != total) {
      console.log(count + ' ' + key);
    }
  }

  console.log('---------------------------------');
  console.log('Total Courses: ' + total);
};
main();
