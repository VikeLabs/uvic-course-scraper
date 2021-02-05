[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Code Coverage][coverage-shield]][coverage-url]

# uvic-course-scraper


UVic Course Scraper is a Node.js library that parses information from [University of Victoria](https://uvic.ca) (UVic) course calandar and course schedule information sources. It uses [Cheerio](https://cheerio.js.org/) under the hood to parse HTML.

As a developer, you would use this to parse HTML and JSON from Kuali and BAN1P which would be retrieved by any method like fetch etc.

# Usage

## Install
```
npm install @vikelabs/uvic-course-scraper
```

## Initialization
```ts
const client = await UvicCourseScraper();
```

## API
The following table provides descriptions of the methods available on the object generated by ``new UvicCourseScraper();``.
| Method | Description |
|--------|-------------|
|``getAllCourses()``|Returns array of ``KualiCourseCatalog`` objects containing all courses active in the Kuali catalog|
|``getCourseDetails(subject: string, code: string)``|Returns a ``KualiCourseItem`` object with details for the course|
|``getCourseSections(term: string, subject: string, code: string)``|Returns array of ``CourseSection`` objects with details for each section of the course in the given term|
|``getSeats(term: string, crn: string)``|Returns a ``DetailedClassInformation`` object with the `seats` and `waitListSeats` for the course|

## Example
```ts
// initialize a scraper client
const client = await UVicCourseScraper();

// example: get the course sections for CSC 111
const course = await client.getCourseSections('202101', 'CSC', '111');

// example: retrieve information from the parsed course sections
const crn = course[0].crn;
const seats = course[1].seats;
```

# Development

0. Get [VS Code](https://code.visualstudio.com/) set up.
1. Clone the repo to your machine by running the following in your terminal:

```
git clone https://github.com/VikeLabs/uvic-course-scraper.git
```

2. Once you have `uvic-course-scraper` open as a project, run `npm install` to get your environment set up with the dependencies this project uses.
3. If you want, run and experiment with `example.ts` using `npx ts-node-dev example.ts` to get a feel for how cheerio and RegEx works on the type of sites our project is hitting.
4. Find an unassigned task on [ZenHub](https://app.zenhub.com/workspaces/team-schedule-courses-5f973f50ae36d70012eb5b2e/board?repos=216653028) to work on.
5. Create a new branch using `git checkout -b <branch-name>` (make sure it's up to date with `master`)
6. Commit the changes you've made and push to GitHub to create a Pull Request.

# Testing

This project uses [Jest](https://jestjs.io/) testing framework. You can execute tests by running `npm test`.

This will execute tests using Jest files with the extension `*.test*`.

`npx jest --watch` will put Jest into watch mode, which will execute tests as files change.

# Developer Tools

This repository contains a CLI to make development related tasks easier.

```
npm run dump -- --term 202009 --type courses
```

- Dumps the course details for the `202009` term.
- Outputs to a `courses.json` file.

```
npm run dump -- --term 202009 --type schedules
```

- Dumps the schedule details for all `202009` term classes.
- This schedule details corresponds to the `Class Schedule Listing` page view on BAN1P.
- This command can only be run after dumping courses data.

```
npm run dump -- --term 202009 --type class --crn 10953
```

- Dumps the HTML of a "Detailed Class Information" page for a given term and CRN.

```
npm run dump -- --term 202009 --type sections
```

- Dumps the section details for all `202009` term classes by crn.
- This command can only be run after dumping schedules data.

# Target Pages

The following are some of the pages we are currently parsing.

## Schedule Information (BAN1P)

### Class Schedule Listing

[Class Schedule Listing - ECE 260 - 202009](https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=ECE&crse_in=260&schd_in=)

This is where all the information for a specific class will be parsed such as when the term is, location, CRN, etc. You can change the query string parameters `term_in`, `subj_in`, and `crse_in` to anything you'd like to view other class listings. For example, `202101`, `CHEM`, and `101` could be put in the respective locations.

### Detailed Class Information

[Detailed Class Information](https://www.uvic.ca/BAN1P/bwckschd.p_disp_detail_sched?term_in=202009&crn_in=10953)

This is where all the information for a specific section of a class will be parsed such as the class and waitlist capacity. You can change the parameters `term_in`, `crn_in`, to anything you'd like to view other class listings. For example, `202101` and `12345` could be put in the respective locations.

## Course Information (Kuali)

The course information from this source is _mostly_ in `JSON` already so this library does not do much and is mainly used to create a list of courses for other processes. However, there is some parsing done. The `preAndCorequisites` field is `HTML` so we _intend_ to parse this.

[Kuali Courses Catalog Info](https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225)

This is the `JSON` file which contains **basic** information about every course being offered and some courses that were offered recently.

To get more detailed information about a course, one much make another request using the `pid` value from the above `JSON`

[Kuali Course Info](https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/ByS23Pp7E)

This contains detailed information about a class like:

- Description
- Requirements
- Pre and co-requisites

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/VikeLabs/scheduler-scraper.svg?style=flat-square
[contributors-url]: https://github.com/VikeLabs/scheduler-scraper/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/VikeLabs/scheduler-scraper.svg?style=flat-square
[stars-url]: https://github.com/VikeLabs/scheduler-scraper/stargazers
[issues-shield]: https://img.shields.io/github/issues/VikeLabs/scheduler-scraper.svg?style=flat-square
[issues-url]: https://github.com/othneildrew/VikeLabs/scheduler-scraper/issues
[coverage-shield]: https://codecov.io/gh/VikeLabs/scheduler-scraper/branch/master/graph/badge.svg?token=06B7FNZ8TH
[coverage-url]: https://codecov.io/gh/VikeLabs/scheduler-scraper
