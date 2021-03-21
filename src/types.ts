export interface SubjectCode {
  name: string;
  description: string;
  id: string;
  linkedGroup: string;
}

export interface KualiSubject {
  subject: string;
  title: string;
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
export interface KualiCourseCatalogRes {
  data: KualiCourseCatalog[];
  timestamp: string;
  url: string;
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
export interface KualiCourseItemRes {
  data: KualiCourseItem;
  timestamp: string;
  url: string;
}

export type levelType = 'law' | 'undergraduate' | 'graduate';
export type sectionType = 'lecture' | 'lab' | 'tutorial';
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
export interface ClassScheduleListingRes {
  data: ClassScheduleListing[];
  timestamp: string;
  url: string;
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
  seats: Seating;
  waitListSeats: Seating;
  requirements?: Requirements;
}
export interface DetailedClassInformationRes {
  data: DetailedClassInformation;
  timestamp: string;
  url: string;
}
