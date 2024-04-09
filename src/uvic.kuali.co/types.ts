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
