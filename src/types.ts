
export interface Response<T> {
  data: T;
  timestamp: Date;
  url: string;
}

export type levelType = 'law' | 'undergraduate' | 'graduate';
export type sectionType = 'lecture' | 'lab' | 'tutorial' | 'gradable lab' | 'lecture topic';
export type classification = 'YEAR_1' | 'YEAR_2' | 'YEAR_3' | 'YEAR_4' | 'YEAR_5' | 'unclassified';

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
  title: string;
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

export interface Requirements {
  level: levelType[];
  fieldOfStudy?: string[];
  classification?: classification[];
  negClassification?: classification[];
  degree?: string[];
  program?: string[];
  negProgram?: string[];
  college?: string[];
  negCollege?: string[];
  major?: string[];
}

export interface requirementObject {
  known: true | false;
  requirement: string;
  idx: number;
}

export interface DetailedClassInformation {
  title: string;
  seats: Seating;
  waitListSeats: Seating;
  requirements?: Requirements;
}

export interface DetailedClassInformationRes {
  data: DetailedClassInformation;
  timestamp: string;
  url: string;
}

export type BuildingInfo = { title: string; long?: string; short?: string; url?: string };
