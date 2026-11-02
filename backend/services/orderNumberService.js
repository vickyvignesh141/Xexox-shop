
const Counter = require("../models/Counter");

const generateOrderNumber = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: "global-order" },
        { $inc: { sequence: 1 } },
        {
            returnDocument: "after",
            upsert: true
        }
    );

    return `X${String(counter.sequence).padStart(4, "0")}`;
};

module.exports = generateOrderNumber;
