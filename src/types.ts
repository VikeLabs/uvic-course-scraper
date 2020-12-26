export interface CourseJSON {
  [key: string]: any
  catalogCourseId: string
  subject: string;
  code: string;
  pid: string;
}

export interface Course {
  catalogCourseId: string;
  subject: string;
  code: string;
  pid: string;
  title: string;
}

export interface DetailedCourse extends Course {
  description: string;
  supplementalNotes: string;
  credits: string; // TODO: should be float
  crossListedCourses: Course[],
  hoursCatalogText: string;
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
