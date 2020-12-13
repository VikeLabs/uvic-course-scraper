import * as cheerio from 'cheerio';
import path from 'path';
import appRoot from 'app-root-path';
import fs from 'fs'
import { glob } from 'glob';
import { detailedClassInfoExtractor } from './index';

const getSchedulePathsByTerm = (): string[] => {

    const paths = glob.sync(path.join(appRoot.toString(), `static/sections/*/*.html`));
    return paths
};

describe('Detailed Class Information', () => {

    it('Extracts all fields for manual testing', async () => {
        const allFilePaths = getSchedulePathsByTerm()
        let mySet = new Set();
        for (let path of allFilePaths) {
            const $ = cheerio.load(await fs.promises.readFile(path));
            const parsed = await detailedClassInfoExtractor($);
            for (let field of parsed.requirements.fieldOfStudy) {
                mySet.add(field)
            }
        }

        let myArray = Array.from(mySet)

        //used for output.txt
        //console.log(myArray)

        //used for output2.txt
        for (let field of myArray) {
            console.log(field)
        }
    });
});