import { Document, model } from 'mongoose';
import { CourseSchema } from './schemas';

export interface Seating {
  capacity: number;
  actual: number;
  remaining: number;
}

export interface Schedule {
  type: string;
  time: string;
  days: string;
  where: string;
  dateRange: string;
  scheduleType: string;
  instructors: string;
}

export interface Section {
  term: string;
  CRN: string;
  waitlistSeats: Seating;
  seats: Seating;
  schedule: Schedule[];
  requirements: string[];
  description: string;
  sectionCode: string; //A01, B02, etc..
  additionalInfo: string;
  location: string;
  sectionType: string;
  instructionalMethod: string;
  credits: string;
  associatedTerm: string;
  registrationDates: string;
  levels: string;
}

interface Term {
  term: string;
  sections: Section[];
}

export interface Course {
  [key: string]: string | Term[] | any;
  courseCatalogId: string;
  code: string;
  subject: string;
  title: string;
  pid: string;
  offerings: Term[];
}

export interface CourseDocument extends Course, Document { }
