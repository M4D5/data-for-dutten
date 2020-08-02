const cheerio = require('cheerio');
const utils = require('./utils');

async function getLinksForCourse(page, courseNumber) {
    await page.goto(`https://kurser.dtu.dk/course/${courseNumber}/info`);
    const html = await page.content();

    const evaluationsBar = cheerio('.box > .bar', html)[0];
    const gradeHistoryBar = cheerio('.box > .bar', html)[1];

    const result = {};

    result.evaluationsLinks = cheerio(evaluationsBar, html)
        .nextUntil('.bar')
        .map((i, el) => getChildAnchorTagLink(el))
        .get();

    result.gradeHistoryLinks = cheerio(gradeHistoryBar, html)
        .nextAll()
        .map((i, el) => getChildAnchorTagLink(el))
        .get();

    return result;
}

function getChildAnchorTagLink(el) {
    if (el.children.length === 0) {
        return undefined;
    }

    const links = cheerio(el.children).filter('a').get();

    if (links.length === 0) {
        return undefined;
    }

    return links[0].attribs.href;
}

async function getLinksForCoursesPartition(page, partition) {
    let i = 0;
    const result = {};

    for (let courseNumber of partition) {
        i++;
        result[courseNumber] = await getLinksForCourse(page, courseNumber);
        console.log(`Retrieved ${result[courseNumber].gradeHistoryLinks.length + result[courseNumber].evaluationsLinks.length} links for course ${courseNumber}, ${i} of ${partition.length}`);
    }

    return result;
}

async function get(browser, courseNumbers) {
    const partitions = utils.partition(courseNumbers, 5);
    const promises = [];
    const pages = [];

    for (let i = 0; i < partitions.length; i++) {
        const page = await browser.newPage();
        promises.push(getLinksForCoursesPartition(page, partitions[i]));
        pages.push(page);
    }

    const results = await Promise.all(promises);

    for (let page of pages) {
        await page.close();
    }

    const result = {};
    Object.assign(result, ...results);

    return result;
}

const exampleResult = {
    '01005': {
        evaluationsLinks: [
            'https://evaluering.dtu.dk/kursus/01005/204137',
            'https://evaluering.dtu.dk/kursus/01005/194435',
            'https://evaluering.dtu.dk/kursus/01005/177795',
            'https://evaluering.dtu.dk/kursus/01005/168580',
            'https://evaluering.dtu.dk/kursus/01005/155576'
        ],
        gradeHistoryLinks: [
            'http://karakterer.dtu.dk/Histogram/1/01005/Summer-2020',
            'http://karakterer.dtu.dk/Histogram/1/01005/Summer-2019',
            'http://karakterer.dtu.dk/Histogram/1/01005/Summer-2018',
            'http://karakterer.dtu.dk/Histogram/1/01005/Summer-2017',
            'http://karakterer.dtu.dk/Histogram/1/01005-3/Winter-2016'
        ]
    }
}

module.exports = {get, exampleResult};
