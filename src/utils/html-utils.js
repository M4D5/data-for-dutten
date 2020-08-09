const TableId = 'dfd-table';
const TitleId = 'dfd-title';
const InfoLinkId = 'dfd-info-link';

export class HtmlUtils {
    static getTableElement() {
        const tableElement = document.createElement('table', {});
        this.addAttribute(tableElement, 'id', TableId);
        tableElement.appendChild(document.createElement('tbody'));
        return tableElement;
    }

    static cell(content) {
        const cell = document.createElement('td');
        cell.appendChild(content);
        return cell;
    }

    static row(table, cells) {
        const row = document.createElement('tr');
        cells.forEach(c => row.appendChild(c));
        table.firstChild.appendChild(row);
    }

    static injectElements(elements) {
        const nextNode = document.querySelector('.box.information > table:nth-of-type(2)');
        elements.forEach(e => nextNode.parentNode.insertBefore(e, nextNode));
    }

    static getTitleElement() {
        const titleNode = document.createElement('h5');
        this.addAttribute(titleNode, 'id', TitleId);
        titleNode.appendChild(document.createTextNode('Data for Dutten'));
        return titleNode;
    }

    static getInfoLinkElement() {
        const infoLinkContainerNode = document.createElement('div');
        this.addAttribute(infoLinkContainerNode, 'id', InfoLinkId);
        this.addAttribute(infoLinkContainerNode, 'class', 'info-link');

        const infoLinkNode = document.createElement('a');
        this.addAttribute(infoLinkNode, 'href', 'https://m4d5.github.io/datafordutten/#/guide');
        this.addAttribute(infoLinkNode, 'target', '_blank');

        infoLinkNode.appendChild(document.createTextNode('What is this?'));
        infoLinkContainerNode.appendChild(infoLinkNode);

        return infoLinkContainerNode;
    }

    static addAttribute(element, name, value) {
        const idAttribute = document.createAttribute(name);
        idAttribute.value = value;
        element.setAttributeNode(idAttribute);
    }
}
