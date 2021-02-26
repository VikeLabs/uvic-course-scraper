// need to do runtime checks, so we do this instead of an object?
export function getCatalogForTerm(term: string): string {
  switch (term) {
    case '202009':
      return '5d9ccc4eab7506001ae4c225';
    case '202101':
      return '5f21b66d95f09c001ac436a0';
    case '202105':
      return '5ff357f8d30280001b0c26dd';
    default:
      return '';
  }
}

export interface SubjectCode {
  name: string;
  description: string;
  id: string;
  linkedGroup: string;
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

export interface KualiCourseItem extends KualiCourseCatalog {
  description: string;
  supplementalNotes?: string;
  formerlyNotesText?: string;
  allGradingTypes?: { [key: string]: string };
  proForma: string;
  credits: {
    credits: {
      min: string;
      max: string;
    };
    value: string;
    chosen: string;
  };
  crossListedCourses?: {
    __catalogCourseId: string;
    pid: string;
    title: string;
  }[];
  //This has two types because the JSON returned from uvic is a
  //string so we parse it to turn into an object type after the parsing is done.
  hoursCatalogText?: string | { lecture: string; lab: string; tutorial: string };
  repeatableCatalogText?: string;
}

export type levelType = 'law' | 'undergraduate' | 'graduate';
export type sectionType = 'lecture' | 'lab' | 'tutorial';
export type classification = 'YEAR_1' | 'YEAR_2' | 'YEAR_3' | 'YEAR_4' | 'YEAR_5';

export interface MeetingTimes {
  type: string;
  time: string;
  days: string;
  where: string;
  dateRange: string;
  scheduleType: string;
  instructors: string[];
}

export interface ClassScheduleListing {
  crn: string;
  sectionCode: string;
  additionalNotes?: string;
  associatedTerm: {
    start: string;
    end: string;
  };
  registrationDates: {
    start: string;
    end: string;
  };
  levels: levelType[];
  campus: 'online' | 'in-person';
  sectionType: sectionType;
  instructionalMethod: string;
  credits: string;
  meetingTimes: MeetingTimes[];
}

export interface Seating {
  capacity: number;
  actual: number;
  remaining: number;
}

interface Requirements {
  level: levelType[];
  fieldOfStudy?: string[];
  classification?: classification[];
}

export interface DetailedClassInformation {
  seats: Seating;
  waitListSeats: Seating;
  requirements?: Requirements;
}
