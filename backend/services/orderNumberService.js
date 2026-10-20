const Counter = require("../models/Counter");

const generateOrderNumber = async () => {

    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
    const counter = await Counter.findOneAndUpdate(
        { name: `order-${today}` },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );

    const orderNumber = `X${String(counter.sequence).padStart(4, "0")}`;

    return orderNumber;
};

module.exports = generateOrderNumber;