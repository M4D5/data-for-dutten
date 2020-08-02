function partition(list, partitionCount) {
    const output = [];
    const spacing = Math.ceil(list.length / partitionCount);

    for (let i = 0; i < list.length; i += spacing) {
        output[output.length] = list.slice(i, i + spacing);
    }

    return output;
}

module.exports = {partition};
