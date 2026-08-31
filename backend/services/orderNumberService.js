const Counter = require("../models/Counter");

const generateOrderNumber = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: "order" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );

    const orderNumber = `X${String(counter.sequence).padStart(4, "0")}`;

    return orderNumber;
};

module.exports = generateOrderNumber;