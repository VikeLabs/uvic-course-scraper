import * as cheerio from 'cheerio';

export type TermValue = { term: string; text: string };

// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_dyn_ctlg
export const extractCourseListingTerm = ($: cheerio.Root): TermValue[] => {
  const termElements = $('select > option');
  let terms: TermValue[] = [];
  for (let i = 0; i < termElements.length; i++) {
    const t = $(termElements[i]);
    terms.push({ term: t.attr('value') || '', text: t.text() || '' });
  }
  return terms;
};
