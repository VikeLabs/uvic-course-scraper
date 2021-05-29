import { KualiCourseCatalog, KualiCourseItem } from './types';

import { UVicCourseScraper } from '.';

export function subjectCodeExtractor(course: KualiCourseItem | KualiCourseCatalog): { subject: string; code: string } {
  return {
    subject: course.__catalogCourseId.slice(0, course.subjectCode.name.length),
    code: course.__catalogCourseId.slice(course.subjectCode.name.length),
  };
}

const main = async () => {
  const courses = await UVicCourseScraper.getCourses('202101');

  const sections = await Promise.all(
    courses.response.flatMap(async (course) => {
      const { subject, code } = subjectCodeExtractor(course);
      const s = await UVicCourseScraper.getCourseSections('202101', subject, code);
      const lectures = s.response.filter((c) => c.sectionType === 'lecture' || c.sectionType === 'lecture topic');
      const meetingTimes = lectures.flatMap((l) => l.meetingTimes.flatMap((m) => m.dateRange));
      return meetingTimes.filter((value, index, self) => self.indexOf(value) === index);
    })
  );
  console.log(sections.filter((m) => m.length > 0));
};

main();
