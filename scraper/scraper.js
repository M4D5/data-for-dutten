const puppeteer = require('puppeteer');
const fs = require('fs');
const CourseNumbers = require('./course-numbers')
const CourseLinks = require('./course-links')
const GradeHistory = require('./grade-history')
const Evaluations = require('./evaluations')
const DataProcessing = require('./data-processing')

async function init(browser) {
    const page = await browser.newPage();
    await page.goto('https://kurser.dtu.dk/');
    await page.waitForNavigation();
    await page.close();
}

async function fullScrape() {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    const courseNumbers = await CourseNumbers.get(page);
    await page.close();
    writeFile('course-numbers', courseNumbers);
    console.log(`Retrieved ${courseNumbers.length} course numbers...`);

    const links = await CourseLinks.get(browser, courseNumbers);
    writeFile('course-links', links);
    console.log('Retrieved all grade history links...');

    const gradeHistory = await GradeHistory.get(browser, links);
    writeFile('grade-history', gradeHistory);
    console.log('Retrieved all grade histories...');

    const evaluations = await Evaluations.get(browser, links);
    writeFile('evaluations', evaluations);
    console.log('Retrieved all evaluations...');

    const data = DataProcessing.process(evaluations, gradeHistory);
    writeFile('data', data);
    console.log('Processed all data...');

    await browser.close();
}

function writeFile(filename, data) {
    const dir = './data/';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(`./data/${filename}.json`, JSON.stringify(data));
}

function readFile(filename) {
    const dir = './data/';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    return JSON.parse(fs.readFileSync(`./data/${filename}.json`).toString());
}


async function main() {
    // const browser = await puppeteer.launch();
    // await init(browser);
    // console.log('Initialized Browser');

    // const courseNumbers = readFile('course-numbers');
    // const courseLinks = await CourseLinks.get(browser, courseNumbers);
    //
    // writeFile('course-links', courseLinks);

    // const links = await CourseLinks.get(browser, ['01005', '01017', '02101']);

    // const links = readFile('course-links');

    // const gradeHistory = await GradeHistory.get(browser, links);
    // writeFile('grade-history', gradeHistory);
    // console.log('Extracted grade history...')

    // const evaluations = await Evaluations.get(browser, links);
    // writeFile('evaluations', evaluations);
    // console.log('Extracted evaluations...')

    const evaluations = readFile('evaluations');
    const gradeHistory = readFile('grade-history');

    const data = DataProcessing.process(evaluations, gradeHistory);
    writeFile('data', data);
    console.log('Processed all data...');

    // await browser.close();
}


main().then(() => console.log('Scrape completed'));
