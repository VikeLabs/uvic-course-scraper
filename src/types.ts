export interface Response<T> {
  response: T;
  timestamp: Date;
  url: string;
}

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

// KualiCourseCatalog is returned the index of courses from Kuali
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

// KualiCourseItem is the full version of KualiCourseCatalog
// This is retrieved one-by-one from a Kuali endpoint.
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
    value:
      | string
      | {
          min: string;
          max: string;
        };
    chosen: string;
  };
  crossListedCourses?: {
    __catalogCourseId: string;
    pid: string;
    title: string;
  }[];
  hoursCatalogText?: string;
  repeatableCatalogText?: string;
  preAndCorequisites?: string;
  preOrCorequisites?: string;
}

export type KualiCourseItemParsed = Omit<
  KualiCourseItem,
  'hoursCatalogText' | 'preAndCorequisites' | 'preOrCorequisites'
> & {
  hoursCatalog?: {
    lecture: string;
    tutorial: string;
    lab: string;
  }[];
  preAndCorequisites?: Array<NestedPreCoRequisites | Course | string>;
  preOrCorequisites?: Array<NestedPreCoRequisites | Course | string>;
};

export type Course = {
  subject: string;
  code: string;
  pid?: string;
};

export type NestedPreCoRequisites = {
  // How many of the reqs need to be completed
  quantity?: number | 'ALL';
  // Is a coreq or not
  coreq?: boolean;
  // How many accumulative units of the given reqs are needed
  units?: boolean;
  // Minimum grade needed from the following reqs
  grade?: string;
  // Minimum GPA needed from the following reqs
  gpa?: string;
  // Data the function fails to parse
  unparsed?: string;
  // Array of reqs
  reqList?: Array<NestedPreCoRequisites | Course | string>;
};

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
  seats: Seating;
  waitListSeats: Seating;
  requirements?: Requirements;
}
export interface DetailedClassInformationRes {
  data: DetailedClassInformation;
  timestamp: string;
  url: string;
}

// BOOKSTORE TYPES
export type Textbook = {
  bookstoreUrl?: string;
  image?: string;
  title: string;
  authors?: string[];
  required: boolean;
  price: {
    new?: string;
    used?: string;
    digitalAccess?: string;
    newAndDigitalAccess?: string;
  };
  isbn: string;
};

export type CourseTextbooks = {
  subject: string;
  code: string;
  section: string;
  textbooks: Textbook[];
};
