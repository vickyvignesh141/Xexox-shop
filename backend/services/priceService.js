
const calculateFilePrice = (pageCount, copies, colorMode, side, paperSize) => {

    // Validate inputs
    if (
        !Number.isInteger(pageCount) || pageCount < 1 ||
        !Number.isInteger(copies) || copies < 1
    ) {
        throw new Error("Invalid page count or copies");
    }

    if (!["BW", "COLOR"].includes(colorMode)) {
        throw new Error("Invalid color mode");
    }

    if (!["SINGLE", "DOUBLE"].includes(side)) {
        throw new Error("Invalid print side");
    }

    if (!["A3", "A4", "VEC Paper"].includes(paperSize)) {
        throw new Error("Invalid paper size");
    }

    let paperCount;
    let rate;

    // A3 PAPER
    if (paperSize === "A3") {

        if (side === "DOUBLE") {
            throw new Error("Double-sided printing is not available for A3");
        }

        paperCount = pageCount;
        rate = colorMode === "BW" ? 10 : 30;
    }

    // A4 PAPER
    else if (paperSize === "A4") {

        paperCount = side === "SINGLE"
            ? pageCount
            : Math.ceil(pageCount / 2);

        rate = colorMode === "BW" ? 2 : 10;
    }

    // VEC PAPER
    else if (paperSize === "VEC Paper") {

        if (side === "DOUBLE") {
            throw new Error("Double-sided printing is not available for VEC Paper");
        }

        paperCount = pageCount;

        rate = colorMode === "BW" ? 2 : 10;
    }

    const total = paperCount * copies * rate;

    return total;
};

module.exports = calculateFilePrice;
