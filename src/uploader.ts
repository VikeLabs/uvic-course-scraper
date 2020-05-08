import { model } from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

import { connect, disconnect, clearDB } from './database';
import { CourseDocument, Course } from './types';
import { CourseSchema } from './schemas';

dotenv.config();

const main = async () => {
  const courseData: Course[] = JSON.parse(fs.readFileSync('courses.json').toString());
  await connect();
  await clearDB();

  const CourseModel = model<CourseDocument>('course', CourseSchema);
  for (const course of courseData) {
    await CourseModel.create(course);
  }
  disconnect();
};

main();
