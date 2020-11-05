[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Build Status][build-shield]][build-url]
[![Code Coverage][coverage-shield]][coverage-url]

# scheduler-scraper

## Getting Started
0. Get VSCode set up.
1. Clone the repo to your machine by running
`git clone https://github.com/VikeLabs/scheduler-scraper.git`
in your terminal.
2. Once you have `schedule-scraper` open as a project, run `npm install` to get your environment set up with the dependencies this project uses.
3. If you want, run and experiment with `example.ts` using `npx ts-node-dev example.ts` to get a feel for how cheerio and RegEx works on the type of sites our project is hitting.
4. Find an unassigned task on Zenhub to work on.
5. Create a new branch using `git checkout -b <branch-name>` (make sure it's up to date with `master`)
6. Commit the changes you've made and push to GitHub to create a Pull Request.

## Testing
Easy as:

`npm test`

This will execute tests using Jest files with the extension `*.test*`.  

`npm test -- --watch` will put Jest into watch mode, which will execute tests as files change.

## Developer Tools
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
- This schdule details corresponds to the `Class Schedule Listing` page view on BAN1P. 
- This command can only be run after dumping courses data.

```
npm run dump -- --term 202009 --type class --crn 10953
```
- Dumps the HTML of a "Detailed Class Information" page for a given term and CRN.

- Example links for sites we're hitting:

    * Class Schedule Listing: https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=ECE&crse_in=260&schd_in=. This is where all the information for a specific class will be parsed such as when the term is, location, CRN, etc. You can change the parameters `term_in`, `subj_in`, and `crse_in` to anything you'd like to view other class listings. For example, `202101`, `CHEM`, and `101` could be put in the respective locations.
    * Detailed Class Information: https://www.uvic.ca/BAN1P/bwckschd.p_disp_detail_sched?term_in=202009&crn_in=10953. This is where all the information for a specific section of a class will be parsed such as the class and waitlist capacity. You can change the parameters `term_in`, `crn_in`, to anything you'd like to view other class listings. For example, `202101` and `12345` could be put in the respective locations.
    * Kuali course catalog: https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225. This is the mass JSON response which has every course UVIC is offering for the semester.

**Currently all file output is hardcoded to `tmp`.**


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/VikeLabs/scheduler-scraper.svg?style=flat-square
[contributors-url]: https://github.com/VikeLabs/scheduler-scraper/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/VikeLabs/scheduler-scraper.svg?style=flat-square
[stars-url]: https://github.com/VikeLabs/scheduler-scraper/stargazers
[issues-shield]: https://img.shields.io/github/issues/VikeLabs/scheduler-scraper.svg?style=flat-square
[issues-url]: https://github.com/othneildrew/VikeLabs/scheduler-scraper/issues
[build-shield]: https://travis-ci.com/VikeLabs/scheduler-scraper.svg?branch=master
[build-url]: https://travis-ci.com/VikeLabs/scheduler-scraper
[coverage-shield]: https://codecov.io/gh/VikeLabs/scheduler-scraper/branch/master/graph/badge.svg?token=06B7FNZ8TH
[coverage-url]: https://codecov.io/gh/VikeLabs/scheduler-scraper
