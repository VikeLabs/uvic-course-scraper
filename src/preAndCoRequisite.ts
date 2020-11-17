import * as cheerio from 'cheerio';
import courses from '../static/courses/courses.json';
import { Course } from './types.js';

const course = courses as Course[];

export function getPreAndCoReqInfo(c: string) {
  for (let i = 0; i < course.length; i++) {
    if (c == course[i].__catalogCourseId) {
      const preAndCoReqInfo = course[i].preAndCorequisites;
      if (preAndCoReqInfo === undefined) throw new Error('Pre and Co-Requisites are undefined');
      return preAndCoReqInfo;
    }
  }
  throw new Error(`No Course with the name "${c}" found`);
}
const preAndCoReq = {
  completeAllOfTheFollowing: {
    oneCourse: [''],
    allCourses: [''],
    standing: [''],
    other: [''],
  },
  completeOne: { oneCourse: [''], allCourses: [''], standing: [''], other: [''] },
};
const data = [''];
//Specify the course name below to get the information from courses.json
export function getPreAndCoReqData(c: string) {
  const $ = cheerio.load(getPreAndCoReqInfo(c));
  let i = 0;
  if (
    $('li > span')
      .first()
      .text() != 'Complete all of the following' &&
    $('li > span')
      .first()
      .text() != 'Complete 1 of the following'
  ) {
    i = i;
  } else {
    data[i] = $('li > span')
      .first()
      .text();
    i++;
  }
  $('li > [data-test]').each((index, elem) => {
    data[i] = $(elem).text();
    i++;
  });
  const regexCompleteFollowing = /Complete all of the following/;
  const regexCompleteOneFollowing = /Complete 1 of the following/;
  const regexCompleteAllOf = /Complete all of/;
  const regexCompleteOneOf = /Complete 1 of/;
  const regexStanding = /standing/;

  if (regexCompleteFollowing.test(data[0])) {
    let x = 0;
    let y = 0;
    let z = 0;
    let w = 0;
    for (let i = 1; i < data.length; i++) {
      if (regexCompleteAllOf.test(data[i])) {
        preAndCoReq.completeAllOfTheFollowing.allCourses[x] = data[i];
        x++;
      } else if (regexCompleteOneOf.test(data[i])) {
        preAndCoReq.completeAllOfTheFollowing.oneCourse[y] = data[i];
        y++;
      } else if (regexStanding.test(data[i])) {
        preAndCoReq.completeAllOfTheFollowing.standing[z] = data[i];
        z++;
      } else {
        preAndCoReq.completeAllOfTheFollowing.other[w] = data[i];
        w++;
      }
    }
  } else if (regexCompleteOneFollowing.test(data[0])) {
    let x = 0;
    let y = 0;
    let z = 0;
    let w = 0;
    for (let i = 1; i < data.length; i++) {
      if (regexCompleteAllOf.test(data[i])) {
        preAndCoReq.completeOne.allCourses[x] = data[i];
        x++;
      } else if (regexCompleteOneOf.test(data[i])) {
        preAndCoReq.completeOne.oneCourse[y] = data[i];
        y++;
      } else if (regexStanding.test(data[i])) {
        preAndCoReq.completeOne.standing[z] = data[i];
        z++;
      } else {
        preAndCoReq.completeOne.other[w] = data[i];
        w++;
      }
    }
  }

  return preAndCoReq;
}
