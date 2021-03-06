import coursesJSON from '../../static/courses/courses.json';
import { KualiCourseItem } from '../types';

/**
 * Tool designed to identify optional json fields in the kualiCourseItem type
 * For most up-to-date results, run course-dump before hand
 *
 * Counts the number of times each field is found in a Kuali course
 * Any fields found which are not a field of 'fieldCounter' will have a count of NaN
 */

// All fields copied from kualiCourseItem type
const fieldCounter = {
  __catalogCourseId: 0,
  __passedCatalogQuery: 0,
  allGradingTypes: 0,
  formerlyNotesText: 0,
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
  repeatableCatalogText: 0,
};

const countFields = (kualiCourseItem: KualiCourseItem, key: string) => {
  fieldCounter[key as keyof KualiCourseItem]++;
};

const getFieldCount = (key: string) => {
  return fieldCounter[key as keyof KualiCourseItem];
};

const main = async () => {
  const kualiCourseItems = coursesJSON as KualiCourseItem[];

  for (const kualiCourseItem of kualiCourseItems) {
    for (const key in kualiCourseItem) {
      countFields(kualiCourseItem, key);
    }
  }

  const total = kualiCourseItems.length;

  console.log('-------- Persistent Fields --------');

  for (const key in kualiCourseItems[0]) {
    const count = getFieldCount(key);

    if (count === total) {
      console.log(count + ' ' + key);
    }
  }

  console.log('-------- Optional Fields --------');

  for (const key in kualiCourseItems[0]) {
    const count = getFieldCount(key);

    if (count != total) {
      console.log(count + ' ' + key);
    }
  }

  console.log('---------------------------------');
  console.log('Total Courses: ' + total);
};
main();
