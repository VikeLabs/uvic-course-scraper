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
  instructors: string[];
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
  sectionType: sectionType;
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
  levels: levelType[];
  addtionalNotes?: string;
}

export interface Term {
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

// Kuali

export interface SubjectCode {
  name: string;
  description: string;
  id: string;
  linkedGroup: string;
}

export interface KualiCourseItem {
  __passedCatalogQuery: boolean;
  description: string;
  pid: string;
  title: string;
  supplementalNotes: string;
  __catalogCourseId: string;
  proForma: string;
  dateStart: string;
  credits: {
    credits: {
      min: string;
      max: string;
    };
    value: string;
    chosen: string;
  };
  crossListedCourses: {
    __catalogCourseId: string;
    pid: string;
    title: string;
  }[];
  id: string;
  subjectCode: SubjectCode;
  catalogActivationDate: string;
  hoursCatalogText: string;
  _score: number;
}

export interface KualiCourseCatalog {
  __catalogCourseId: string;
  __passedCatalogQuery: boolean;
  dateStart: string;
  pid: string;
  id: string;
  title: string;
  subjectCode: SubjectCode;
  catalogActivationDate: string;
  _score: number;
}
