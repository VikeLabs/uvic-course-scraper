import { KualiCourseItem, KualiCourseItemParsed } from '../types';

export function KualiCourseItemParser(course: KualiCourseItem): KualiCourseItemParsed {
  // strip HTML tags from courseDetails.description
  course.description = course.description.replace(/(<([^>]+)>)/gi, '');

  const hoursCatalogText = course.hoursCatalogText;
  const hours = hoursCatalogText?.split('-');

  return {
    ...course,
    hoursCatalog: hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined,
  };
}
