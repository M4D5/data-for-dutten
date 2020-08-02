const cheerio = require('cheerio');
const utils = require('./utils');

function extractPassed(passedText) {
    const passedMatch = passedText.match(/(\d+)/mg);
    let passed;

    if (!passedMatch || passedMatch.length !== 3) {
        passed = NaN;
    } else {
        passed = parseInt(passedMatch[0]);
    }

    return passed;
}

function extractValueInRow(table, row) {
    const rowNode = cheerio(table).children(`tr`).filter((i, el) => {
        return cheerio(cheerio(el).children('td:nth-child(1)')[0]).text().indexOf(row) !== -1;
    });

    return cheerio(rowNode.children('td:nth-child(2)')[0]).text();
}

function extractGradeInfo(html) {
    const result = {};

    const dataTable = cheerio('.table-slide-container > table > tbody', html)[0];
    const attendedText = extractValueInRow(dataTable, 'Fremmødte');
    const passedText = extractValueInRow(dataTable, 'Antal bestået');
    const averageGradeText = extractValueInRow(dataTable, 'Eksamensgennemsnit').replace(',', '.');

    result.attended = parseInt(attendedText);
    result.passed = extractPassed(passedText);
    result.averageGrade = parseFloat(averageGradeText);

    const gradesTable = cheerio('.table-slide-container > table > tbody', html)[2];

    result.grades = {
        '12': parseInt(extractValueInRow(gradesTable, '12')),
        '10': parseInt(extractValueInRow(gradesTable, '10')),
        '7': parseInt(extractValueInRow(gradesTable, '7')),
        '4': parseInt(extractValueInRow(gradesTable, '4')),
        '02': parseInt(extractValueInRow(gradesTable, '02')),
        '00': parseInt(extractValueInRow(gradesTable, '00')),
        '-3': parseInt(extractValueInRow(gradesTable, '-3'))
    };

    return result;
}

function getCourseInstanceName(link) {
    // Group 1 is everything after the last /
    const match = link.match(/.*\/(.+)$/);

    if (!match) {
        return 'unknown';
    }

    return match[1];
}

async function getGradeHistoryForCourse(page, courseNumber, links) {
    const results = {};

    for (let link of links.gradeHistoryLinks) {
        await page.goto(link);
        const html = await page.content();
        const instanceName = getCourseInstanceName(link);
        results[instanceName] = extractGradeInfo(html);
    }

    return results;
}

async function getGradeHistoryForPartition(page, links, partition) {
    let i = 0;
    const result = {};

    for (let courseNumber of partition) {
        i++;
        result[courseNumber] = await getGradeHistoryForCourse(page, courseNumber, links[courseNumber]);
        console.log(`Retrieved grade history for course ${courseNumber}, ${i} of ${partition.length}`);
    }

    return result;
}

async function get(browser, links) {
    const partitions = utils.partition(Object.keys(links), 5);
    const promises = [];
    const pages = [];

    for (let i = 0; i < partitions.length; i++) {
        const page = await browser.newPage();
        promises.push(getGradeHistoryForPartition(page, links, partitions[i]));
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

module.exports = {get};
