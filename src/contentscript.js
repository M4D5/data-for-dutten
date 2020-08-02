import {Utils} from "./utils/utils";
import {HtmlUtils} from "./utils/html-utils";
import {TableRenderer} from "./table-renderer";

const defaultColorRange = {minHue: 0, maxHue: 120, minValue: 0, maxValue: 100};

const defaultPercentFormatter = v => v.toFixed(2) + '%';

const tableSpec = [
    {
        title: "Average grade",
        propertyGetter: c => c.averageGrade,
        propertyFormatter: v => v.toFixed(2),
        colorRange: {minHue: 0, maxHue: 120, minValue: 2, maxValue: 12}
    },
    {
        title: "Average grade percentile",
        propertyGetter: c => c.averageGradePercentile,
        propertyFormatter: defaultPercentFormatter,
        colorRange: defaultColorRange
    },
    {
        title: "Percent passed",
        propertyGetter: c => c.percentPassed,
        propertyFormatter: defaultPercentFormatter,
        colorRange: {minHue: 0, maxHue: 120, minValue: 50, maxValue: 100}
    },
    {
        title: "Course rating percentile",
        propertyGetter: c => c.qualityScorePercentile,
        propertyFormatter: defaultPercentFormatter,
        colorRange: defaultColorRange
    },
    {
        title: "Workscore percentile",
        propertyGetter: c => c.workloadScorePercentile,
        propertyFormatter: defaultPercentFormatter,
        colorRange: defaultColorRange
    },
    {
        title: "Lazyscore percentile 🍺",
        propertyGetter: c => c.lazyScorePercentile,
        propertyFormatter: defaultPercentFormatter,
        colorRange: defaultColorRange
    }
]

function sendMessage() {
    const course = Utils.getCourse();

    if (course) {
        chrome.runtime.sendMessage({course: course});
    }
}

sendMessage();

chrome.runtime.onMessage.addListener(course => {
    if (course) {
        const tableRenderer = new TableRenderer();
        const table = tableRenderer.render(tableSpec, course);

        HtmlUtils.injectElements([
            HtmlUtils.getTitleElement(),
            table,
            HtmlUtils.getInfoLinkElement()
        ]);
    }
});
