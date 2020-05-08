import { Document, model } from 'mongoose';
import { CourseSchema } from './schemas';

interface Seating {
  capacity: number;
  actual: number;
  remaining: number;
}

interface Schedule {
  type: string;
  time: string;
  days: string;
  where: string;
  dateRange: string;
  scheduleType: string;
  instructors: string;
}

interface Term {
  term: string;
  CRN: string;
  waitlist: Seating;
  seats: Seating;
  schdule: Schedule[];
}

export interface Course {
  courseId: string;
  subject: string;
  courseCode: string;
  title: string;
  description: string;
  terms: Term[];
}

export interface CourseDocument extends Course, Document { }
export const CourseModel = model<CourseDocument>('course', CourseSchema);
