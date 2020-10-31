/*
A simple example of how cheerio & RegEx work to do web-scraping.
Specifically focuses on how data from the sites we're hitting in this project is parsed.
Feel free to make changes to this code and use it when working on tasks to experiment with ideas!
*/

const request = require('request');
const cheerio = require('cheerio');

// Make a request to ECE 260's class schedule listing for the Sep - Dec 2020 term.
request('https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=ECE&crse_in=260&schd_in=', (error, response, html) => {
    if(!error && response.statusCode == 200){
        console.log('Starting scraping...');

        // Load the HTML into a cheerio object
        const $ = cheerio.load(html);

        // Get the part of the HTML response that includes a table with the following summary's tbody
        const table = $(`table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`);

       // find all descendants of `table` that have the tag `tr`
        const table_rows = table.find('tr');

        // Since there are multiple table rows in table_rows, we can iterate through them all
        table_rows.each((i, el) => {
            const info = $(el)
                .text()                 // get the text attributes of what we found
                .split('\n')            // split the text into an array, splitting at any new line
                .map(e => e.trim());    // trim each element of the array so there's no extra white space

            console.log(info);

            const regex = /\d{2}/;
            // Test if any elements in the info parsed above matches the given RegEx pattern
            info.forEach(el => {
                if(regex.test(el)){
                    console.log('Found a \`td\` element with 2 numbers in it', el);
                }
            });
        });

        console.log('Scraping done...');
    }
});