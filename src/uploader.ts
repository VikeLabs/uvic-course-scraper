import { connect, disconnect, clearDB } from './database';
import { CourseModel, Course } from './types';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const main = async () => {
  const courseData: Course[] = JSON.parse(fs.readFileSync('courses.json').toString());
  await connect();
  await clearDB();

  for (const course of courseData) {
    await CourseModel.create(course);
  }
  disconnect();
};

main();
