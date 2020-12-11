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

export type levelType = 'law' | 'undergraduate' | 'graduate' | 'undefined';
export type sectionType = 'lecture' | 'lab' | 'tutorial';
export type deliveryMethodType = 'synchronous' | 'asynchronous' | 'mixed';

//for future implementation
export type fieldType = 'ATWP' | 'AGEI' | 'ASL' | 'ANTH' | 'AE' | 'AHVS' |
  'ARTS' | 'ACAN' | 'ASTR' | 'BIOC' | 'BCMB' | 'BIOL' | 'BME' | 'CS' | 'CHEM' |
  'CYC' | 'CYCI' | 'CIVE' | 'COM' | 'CSC' | 'CW' | 'ED-P' | 'EDCI' | 'DHUM' |
  'DSS' | 'EOS' | 'ECON' | 'EDUC' | 'ED-D' | 'ECE' | 'ENGR' | 'ENT' | 'ER' |
  'ES' | 'EUS' | 'EPHE' | 'FA' | 'FRAN' | 'GNDR' | 'GEOG' | 'GMST' | 'GDS' |
  'GREE' | 'GRS' | 'HLTH' | 'HINF' | 'HS' | 'HSTR' | 'HDCC' | 'HSD' | 'HUMA' |
  'ICDG' | 'CYCB' | 'IED' | 'IGOV' | 'INGH' | 'IS' | 'ISP' | 'IB' | 'INTS' |
  'ITAL' | 'LATI' | 'LAS' | 'LAW' | 'LING' | 'MRNE' | 'MATH' | 'MECH' | 'MEDS' |
  'MEDI' | 'MICR' | 'MUS' | 'NURS' | 'PAAS' | 'PHIL' | 'PHYS' | 'POLI' | 'PORT' |
  'PSYC' | 'ADMN' | 'RS' | 'SCIE' | 'SMGT' | 'SLST' | 'SJS' | 'SOSC' | 'SOCW' |
  'SOCI' | 'SENG' | 'SPAN' | 'STAT' | 'TS' | 'THEA' | 'VIRS' | 'ART' | 'WRIT';

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