import { Schema } from 'mongoose';

const SeatingSchema = new Schema({
  capacity: Number,
  actual: Number,
  remaining: Number,
});

const ScheduleSchema = new Schema({
  type: String,
  time: String,
  days: String,
  where: String,
  dateRange: String,
  scheduleType: String,
  instructors: String,
});

const TermSchema = new Schema({
  term: String,
  CRN: String,
  waitlist: SeatingSchema,
  seats: SeatingSchema,
  schdule: [ScheduleSchema],
});

export const CourseSchema = new Schema({
  courseId: String,
  subject: String,
  courseCode: String,
  title: String,
  description: String,
  terms: [TermSchema],
});
