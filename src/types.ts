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
  title: string;
  crn: string;
  sectionCode: string; //A01, B02, etc...
  waitlistSeats: Seating;
  seats: Seating;
  schedule: Schedule[];
  requirements: string[];
  additionalInfo: string;
  location: string;
  sectionType: string;
  instructionalMethod: string;
  campus: 'online';
  credits: string;
  associatedTerm: string;
  registrationDates: {
    start: string;
    end: string;
  };
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
