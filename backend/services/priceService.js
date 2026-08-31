const calculateFilePrice = (pageCount, copies, colorMode, side) => {
    let paperCount;

    if (side === "SINGLE") {
        paperCount = pageCount;
    } else {
        paperCount = Math.ceil(pageCount / 2);
    }

    let rate;

    if (colorMode === "BW") {
        rate = 2;
    } else if (colorMode === "COLOR" && side === "SINGLE") {
        rate = 10;
    } else if (colorMode === "COLOR" && side === "DOUBLE") {
        rate = 20;
    }

    const total = paperCount * copies * rate;

    return total;
};

module.exports = calculateFilePrice;