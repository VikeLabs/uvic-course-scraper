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
  hoursCatalogText?: string;
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

interface Seating {
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

export type CourseSection = ClassScheduleListing & DetailedClassInformation;
