import { connect, disconnect } from './database';
import { CourseModel } from './types';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const main = async () => {
  console.log('hi');
  let courseData: any[] = JSON.parse(fs.readFileSync('courses.json').toString());
  // const courseData = data.length;
  courseData = courseData.filter(e => e.subject === 'CSC');
  await connect();
  for (const course of courseData) {
    await CourseModel.create(course);
  }
  disconnect();
};

main();
