const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

request('https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=PAAS&crse_in=138&schd_in=', (error, response, html) => {
    if(!error && response.statusCode == 200){
        const $ = cheerio.load(html);

        // console.log(html);

        //th[contains(@class, 'title')]//a/text()

        $('.ddtitle').each((i, el) => {
            const title = $(el).find('a').text();
            const regex = /\d{5}/;
            console.log(regex.exec(title)[0]);
        });

        console.log('Scraping done...');
    }
});