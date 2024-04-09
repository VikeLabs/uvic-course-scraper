
// UVic Legacy Calendar
// const LEGACY_BASE_URL = (year: string, month: string) => `https://web.uvic.ca/calendar${year}-${month}/CDs/`;

export function coursesUrl(catalogId: string): string {
  return `https://uvic.kuali.co/api/v1/catalog/courses/${catalogId}`;
}export function courseDetailUrl(catalogId: string, pid: string): string {
  return `https://uvic.kuali.co/api/v1/catalog/course/${catalogId}/${pid}`;
}

