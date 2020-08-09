const cheerio = require('cheerio');

function extractValueInRow(table, row) {
    const rowNode = cheerio(table).children(`tr`).filter((i, el) => {
        return cheerio(cheerio(el).children('td:nth-child(1)')[0]).text().indexOf(row) !== -1;
    });

    return cheerio(rowNode.children('td:nth-child(2)')[0]).text();
}

function extractSchedulePlacements(text) {
    return text.match(/[EF]\d[AB]?/g);
}

async function getCourseInformation(page, courseNumber) {
    await page.goto(`https://kurser.dtu.dk/course/${courseNumber}`);
    const html = await page.content();

    const table1 = cheerio('.box.information > table:nth-of-type(1) > tbody', html);
    const table2 = cheerio('.box.information > table:nth-of-type(2) > tbody', html);
    const schedulePlacementsText = extractValueInRow(table2, 'Skemaplacering');

    return {
        courseTitle: extractValueInRow(table1, 'Engelsk titel'),
        schedulePlacements: extractSchedulePlacements(schedulePlacementsText)
    };
}

async function get(browser, courseNumbers) {
    const result = {};

    const page = await browser.newPage();
    await page.goto(`https://kurser.dtu.dk`);
    await page.evaluate('setLanguage("da-DK")');
    await page.waitForNavigation();

    for(let courseNumber of courseNumbers) {
        result[courseNumber] = await getCourseInformation(page, courseNumber);
        console.log(`Extracted course info for course ${courseNumber}`)
    }

    return result;
}

module.exports = {get};
