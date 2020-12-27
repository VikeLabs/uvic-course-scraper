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

export interface MeetingTimes {
  type: string;
  time: string;
  days: string;
  where: string;
  dateRange: string;
  scheduleType: string;
  instructors: string[];
}

export interface ClassSchedule {
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

export interface ClassScheduleDetails {
  seats: Seating;
  waitListSeats: Seating;
  requirements: string[];
}
