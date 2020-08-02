function evaluateScore(scores, map) {
    if(!scores) {
        return undefined;
    }

    const answers = Object.keys(scores);

    let score = 0;
    let entries = 0;

    for (let answer of answers) {
        const amount = scores[answer];
        score += amount * map[answer];
        entries += amount;
    }

    return score / entries;
}

const months = {
    'august': 0,
    'juni': 1,
    'juli': 2,
}

function courseEvaluationInstanceSort(a, b) {
    if (a[1] > b[1]) {
        return 1;
    } else if (a[1] < b[1]) {
        return -1;
    }

    const aSeason = seasons[a[0]]
    const bSeason = seasons[b[0]]

    if (aSeason > bSeason) {
        return 1;
    } else if (aSeason < bSeason) {
        return -1;
    }

    if (!a[2] || !b[2]) {
        return 0;
    }

    const aMonth = months[a[2]]
    const bMonth = months[b[2]]

    if (aMonth > bMonth) {
        return 1;
    } else if (aMonth < bMonth) {
        return -1;
    } else {
        return 0;
    }
}

function getLatestCourseInstanceEvaluation(courseEvaluations, filter) {
    const courseInstances = Object.keys(courseEvaluations);

    let filteredInstances = courseInstances;

    if (filter) {
        filteredInstances = courseInstances.filter(f => filter(courseEvaluations[f]));
    }

    const latestCourseInstance = filteredInstances.sort((a, b) => {
        const aMatch = a.match(/([FE])(\d{2})-\d{2}( \w+)?/);
        const bMatch = b.match(/([FE])(\d{2})-\d{2}( \w+)?/);

        if (!aMatch || !bMatch) {
            return 0;
        }

        return -courseEvaluationInstanceSort(aMatch, bMatch);
    })[0];

    if (!latestCourseInstance) {
        return undefined;
    }

    return courseEvaluations[latestCourseInstance];
}

function getLatestWorkloadScore(courseEvaluations) {
    const scores = getLatestCourseInstanceEvaluation(courseEvaluations, i => i.workloadScores.neutral)?.workloadScores;
    return evaluateScore(scores,
        {
            muchLess: 3,
            less: 1,
            neutral: 0,
            more: -1,
            muchMore: -3
        });
}

function getLatestQualityScore(courseEvaluations) {
    const scores = getLatestCourseInstanceEvaluation(courseEvaluations, i => i.qualityScores.neutral)?.qualityScores;
    return evaluateScore(scores,
        {
            completelyAgree: 3,
            agree: 1,
            neutral: 0,
            disagree: -1,
            completelyDisagree: -3
        });
}

const seasons = {
    'Summer': 0,
    'F': 0,
    'Winter': 1,
    'E': 1
}

function courseGradeHistoryInstanceSort(a, b) {
    if (a[1] > b[1]) {
        return 1;
    } else if (a[1] < b[1]) {
        return -1;
    }

    const aSeason = seasons[a[0]]
    const bSeason = seasons[b[0]]

    if (aSeason > bSeason) {
        return 1;
    } else if (aSeason < bSeason) {
        return -1;
    } else {
        return 0;
    }
}

function getLatestGradeHistoryInstance(courseGradeHistory, filter) {
    const courseInstances = Object.keys(courseGradeHistory).filter(c => filter(courseGradeHistory[c]));

    return courseInstances.sort((a, b) => {
        const aMatch = a.match(/(\w+)-(\d+)/);
        const bMatch = b.match(/(\w+)-(\d+)/);

        if (!aMatch || !bMatch) {
            return 0;
        }

        return courseGradeHistoryInstanceSort(aMatch, bMatch);
    })[0];
}

function getLatestPercentPassed(courseGradeHistory) {
    const latestCourseInstance = getLatestGradeHistoryInstance(courseGradeHistory, c => c.attended && c.passed);

    if (!latestCourseInstance) {
        return undefined;
    }

    const gradeHistory = courseGradeHistory[latestCourseInstance]

    if(!gradeHistory.passed || !gradeHistory.attended) {
        return undefined;
    }

    return gradeHistory.passed / gradeHistory.attended * 100;
}

function getLatestAverageGrade(courseGradeHistory) {
    const latestCourseInstance = getLatestGradeHistoryInstance(courseGradeHistory, c => c.averageGrade);

    if (!latestCourseInstance) {
        return undefined;
    }

    const averageGrade = courseGradeHistory[latestCourseInstance].averageGrade;

    if(!averageGrade) {
        return undefined;
    }

    return averageGrade;
}

function computeLazyScore(percentPassed, workloadScore) {
    if(!percentPassed || !workloadScore) {
        return undefined;
    }

    return (percentPassed + (workloadScore * 20)) / 2;
}

function getBaseData(evaluations, gradeHistory) {
    const data = {};
    const courseNumbers = Object.keys(gradeHistory);

    for (let course of courseNumbers) {
        const percentPassed = getLatestPercentPassed(gradeHistory[course]);
        const workloadScore = getLatestWorkloadScore(evaluations[course]);

        data[course] = {
            averageGrade: getLatestAverageGrade(gradeHistory[course]),
            percentPassed: percentPassed,
            workloadScore: workloadScore,
            qualityScore: getLatestQualityScore(evaluations[course]),
            lazyScore: computeLazyScore(percentPassed, workloadScore)
        };
    }

    return data;
}

function computeGradePercentiles(data) {
    percentilesFor(data, c => c.averageGrade, (c, value) => c.averageGradePercentile = value)
}

function computeWorkloadScorePercentiles(data) {
    percentilesFor(data, c => c.workloadScore, (c, value) => c.workloadScorePercentile = value)
}

function computeQualityScorePercentiles(data) {
    percentilesFor(data, c => c.qualityScore, (c, value) => c.qualityScorePercentile = value)
}

function computeLazyScorePercentiles(data) {
    percentilesFor(data, c => c.lazyScore, (c, value) => c.lazyScorePercentile = value)
}

function getCourseObjs(data) {
    let coursesList = [];
    const courseNumbers = Object.keys(data);

    for (let courseNumber of courseNumbers) {
        let courseObj = {courseNumber: courseNumber}
        Object.assign(courseObj, data[courseNumber]);
        coursesList.push(courseObj);
    }

    return coursesList;
}

function percentilesFor(data, propertyGetter, percentilePropertySetter) {
    let coursesList = getCourseObjs(data)

    coursesList = coursesList.filter(c => propertyGetter(c) !== undefined && propertyGetter(c) !== null)
    coursesList.sort((a, b) => propertyGetter(b) - propertyGetter(a));

    let i = coursesList.length;

    for (let courseObj of coursesList) {
        percentilePropertySetter(data[courseObj.courseNumber], i / coursesList.length * 100);
        i--;
    }
}

function process(evaluations, gradeHistory) {
    const data = getBaseData(evaluations, gradeHistory);

    computeGradePercentiles(data);
    computeWorkloadScorePercentiles(data);
    computeQualityScorePercentiles(data);
    computeLazyScorePercentiles(data);

    return data;
}

module.exports = {process};
