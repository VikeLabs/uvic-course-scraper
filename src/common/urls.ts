import * as qs from 'querystring';

const BASE_URL = 'https://www.uvic.ca/BAN1P';

// URL builders for known pages on UVic BAN1P.
// Also serves as some documentation for known and useful endpoints.

// GET: Class Schedule Listing
// eg. https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=PAAS&crse_in=138&schd_in=
export const classScheduleListingUrl = (term: string, subject: string, course: string): string => {
  const params = qs.stringify({
    term_in: term,
    subj_in: subject,
    crse_in: course,
    schd_in: '',
  });
  return `${BASE_URL}/bwckctlg.p_disp_listcrse?${params}`;
};
// GET: Detailed Class Information
export const detailedClassInformationUrl = (term: string, crn: string): string => {
  const params = qs.stringify({
    term_in: term,
    crn_in: crn,
  });
  return `${BASE_URL}/bwckschd.p_disp_detail_sched?${params}`;
};

// GET: Course Listing Entries
// Note: can hit this endpoint with a POST request too. Difference between
// eg. https://www.uvic.ca/BAN1P/bwckctlg.p_display_courses?term_in=202009&one_subj=PAAS&sel_crse_strt=138&sel_crse_end=138&sel_subj=&sel_levl=&sel_schd=&sel_coll=&sel_divs=&sel_dept=&sel_attr=
export const courseListingsEntriesUrl = (term: string, subject: string, course: string): string => {
  // TODO: figure out what the result of the fields mean.
  const params = qs.stringify({
    term_in: term,
    one_subj: subject,
    sel_crse_strt: course,
    sel_crse_end: course,
    sel_subj: '',
    sel_levl: '',
    sel_schd: '',
    sel_coll: '',
    sel_divs: '',
    sel_dept: '',
    sel_attr: '',
  });
  return `${BASE_URL}/bwckctlg.p_display_courses?${params}`;
};

// POST: Course Listing Term
// eg. https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date
// qs: call_proc_in=bwckctlg.p_disp_dyn_ctlg&cat_term_in=202001
export const courseListingTermUrl = (term: string): string => {
  const params = qs.stringify({
    //   TODO: not sure what this does
    call_proc_in: 'bwckctlg.p_disp_dyn_ctlg',
    cat_term_in: term,
  });
  return `${BASE_URL}/bwckctlg.p_disp_cat_term_date?${params}`;
};

// construct subjects endpoint
export function subjectsUrl(id: string): string {
  return `https://www.uvic.ca/BAN1P/pkg_kuali_api.pr_get_catalog?p_catalog=${id}`;
}

// UVic Legacy Calendar
// const LEGACY_BASE_URL = (year: string, month: string) => `https://web.uvic.ca/calendar${year}-${month}/CDs/`;

// Kuali
export function coursesUrl(id: string): string {
  return `https://uvic.kuali.co/api/v1/catalog/courses/${id}`;
}

export function courseDetailUrl(id: string, pid: string): string {
  return `https://uvic.kuali.co/api/v1/catalog/course/${id}/${pid}`;
}
