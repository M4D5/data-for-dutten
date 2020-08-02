import {HtmlUtils} from "./utils/html-utils";
import {ColorUtils} from "./utils/color-utils";

export class TableRenderer {
    render(spec, data) {
        const table = HtmlUtils.getTableElement();
        spec.forEach(valueSpec => this.renderRow(table, valueSpec, valueSpec.propertyGetter(data)));
        return table;
    }

    renderRow(table, valueSpec, value) {
        HtmlUtils.row(table, [
            HtmlUtils.cell(this.createLabelNode(valueSpec)),
            HtmlUtils.cell(this.createValueNode(valueSpec, value))
        ]);
    }

    createValueNode(valueSpec, value) {
        const valueElement = document.createElement('span');

        if (valueSpec.colorRange) {
            HtmlUtils.addAttribute(valueElement, 'class', `value-background`)
            HtmlUtils.addAttribute(valueElement, 'style', `background-color: ${ColorUtils.colorRangeToString(value, valueSpec.colorRange)}`)
        }

        valueElement.appendChild(document.createTextNode(this.getValueText(valueSpec, value)));

        return valueElement;
    }

    createLabelNode(valueSpec) {
        const labelNode = document.createElement('label');
        labelNode.appendChild(document.createTextNode(valueSpec.title));
        return labelNode;
    }

    getValueText(valueSpec, value) {
        return valueSpec.propertyFormatter(value);
    }
}
