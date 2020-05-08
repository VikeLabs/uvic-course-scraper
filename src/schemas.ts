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

const SectionSchema = new Schema({
  term: String,
  CRN: String,
  waitlistSeats: SeatingSchema,
  seats: SeatingSchema,
  schedule: [ScheduleSchema],
  requirements: [String],
  description: String,
  sectionCode: String, //A01, B02, etc..
  additionalInfo: String,
  location: String,
  sectionType: String,
  instructionalMethod: String,
  credits: String,
  associatedTerm: String,
  registrationDates: String,
  levels: String,
});

const TermSchema = new Schema({
  term: String,
  sections: [SectionSchema],
});

export const CourseSchema = new Schema(
  {
    courseCatalogId: String,
    subject: String,
    code: String,
    title: String,
    description: String,
    offerings: [TermSchema],
  },
  { strict: false }
);
