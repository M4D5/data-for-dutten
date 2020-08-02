const cheerio = require('cheerio');
const utils = require('./utils');

function extractQualityScores(html) {
    const qualityScoresDiv = cheerio('.FinalEvaluation_QuestionText:contains("kurset er godt")', html).parent().parent();
    const scores = qualityScoresDiv.find('.FinalEvaluation_Result_AnswerCountColumn span').map((i, el) => parseInt(cheerio(el).text())).get();

    return {
        'completelyAgree': scores[0],
        'agree': scores[1],
        'neutral': scores[2],
        'disagree': scores[3],
        'completelyDisagree': scores[4]
    };
}

function extractWorkloadScores(html) {
    const workloadScores = cheerio('.FinalEvaluation_QuestionText:contains("arbejdsindsats i kurset")', html).parent().parent();
    const scores = workloadScores.find('.FinalEvaluation_Result_AnswerCountColumn span').map((i, el) => parseInt(cheerio(el).text())).get();

    return {
        'muchLess': scores[0],
        'less': scores[1],
        'neutral': scores[2],
        'more': scores[3],
        'muchMore': scores[4]
    };
}

function extractEvaluation(html) {
    const result = {};

    result.qualityScores = extractQualityScores(html);
    result.workloadScores = extractWorkloadScores(html);

    return result;
}

function getCourseInstanceName(html) {
    return cheerio('#PeriodDropDownList', html).val();
}

async function getEvaluationsForCourse(page, courseNumber, links) {
    const results = {};

    for (let link of links.evaluationsLinks) {
        try {
            await page.goto(link, {
                waitUntil: 'domcontentloaded'
            });
            const html = await page.content();
            const instanceName = getCourseInstanceName(html);
            results[instanceName] = extractEvaluation(html);
        } catch (error) {
            console.error(`Failed to open link ${link} for course ${courseNumber}: ${error.message}`)
        }
    }

    return results;
}

async function getEvaluationsForPartition(page, links, partition) {
    let i = 0;
    const result = {};

    for (let courseNumber of partition) {
        i++;
        result[courseNumber] = await getEvaluationsForCourse(page, courseNumber, links[courseNumber]);
        console.log(`Retrieved evaluations for course ${courseNumber}, ${i} of ${partition.length}`);
    }

    return result;
}

async function get(browser, links) {
    const partitions = utils.partition(Object.keys(links), 40);
    const promises = [];
    const pages = [];

    for (let i = 0; i < partitions.length; i++) {
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        await page.setRequestInterception(true);

        page.on('request', request => {
            const url = request.url();

            if (url.endsWith('.js') ||
                url.endsWith('.css') ||
                url.endsWith('.png') ||
                url.endsWith('.jpg') ||
                url.endsWith('.gif') ||
                url.indexOf('.ashx') !== -1 ||
                url.indexOf('.woff') !== -1 ||
                url.endsWith('GetBackItem') ||
                url.endsWith('GetMenu')) {
                request.abort();
            } else {
                request.continue();
            }
        });

        promises.push(getEvaluationsForPartition(page, links, partitions[i]));
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
