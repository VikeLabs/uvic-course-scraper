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

export type levelType = 'law' | 'undergraduate' | 'graduate';
export type sectionType = 'lecture' | 'lab' | 'tutorial';
export type deliveryMethodType = 'synchronous' | 'asynchronous' | 'mixed';

export interface Section {
  term: string;
  title: string;
  crn: string;
  sectionCode: string;
  waitlistSeats: Seating;
  seats: Seating;
  schedule: Schedule[];
  requirements: string[];
  additionalInfo: string;
  location: string;
  sectionType: string;
  deliveryMethod: deliveryMethodType;
  instructionalMethod: string;
  campus: 'online' | 'in-person';
  credits: string;
  associatedTerm: {
    start: string;
    end: string;
  };
  registrationDates: {
    start: string;
    end: string;
  };
  levels: string[];
  addtionalNotes?: string;
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
