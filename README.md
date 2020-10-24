[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Build Status][build-shield]][build-url]

# scheduler-scraper

## Testing
Easy as:

`npm test`

This will execute tests using Jest files with the extension `*.test*`.  

`npm test -- --watch` will put Jest into watch mode, which will execute tests as files change.

## Developer Tools
This repository contains a CLI to make development related tasks easier.

`npm run dump -- --term 202009 --type courses` 
- Dumps the course details for the `202009` term.
- Outputs to a `courses.json` file.

`npm run dump -- --term 202009 --type schedules` 
- Dumps the schedule details for all `202009` term classes.
- This schdule details corresponds to the `Class Schedule Listing` page view on BAN1P. 
- This command can only be run after dumping courses data.

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
