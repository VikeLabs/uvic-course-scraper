import {
  classScheduleListingUrl,
  courseListingsEntriesUrl,
  detailedClassInformationUrl,
  courseListingTermUrl,
} from '../lib/urls';

describe('classScheduleListingUrl', () => {
  it('builds the URL correctly', () => {
    const url = classScheduleListingUrl('202009', 'PAAS', '138');
    expect(url).toBe(
      'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=PAAS&crse_in=138&schd_in='
    );
  });
});

describe('detailedClassInformationUrl', () => {
  it('builds the URL correctly', () => {
    const url = detailedClassInformationUrl('202009', '12407');
    expect(url).toBe('https://www.uvic.ca/BAN1P/bwckschd.p_disp_detail_sched?term_in=202009&crn_in=12407');
  });
});

describe('courseListingsEntriesUrl', () => {
  it('builds the URL correctly', () => {
    const url = courseListingsEntriesUrl('202009', 'PAAS', '138');
    expect(url).toBe(
      'https://www.uvic.ca/BAN1P/bwckctlg.p_display_courses?term_in=202009&one_subj=PAAS&sel_crse_strt=138&sel_crse_end=138&sel_subj=&sel_levl=&sel_schd=&sel_coll=&sel_divs=&sel_dept=&sel_attr='
    );
  });
});

describe('courseListingTermUrl', () => {
  it('builds the URL correctly', () => {
    const url = courseListingTermUrl('202001');
    expect(url).toBe(
      'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date?call_proc_in=bwckctlg.p_disp_dyn_ctlg&cat_term_in=202001'
    );
  });
});
