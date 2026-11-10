
const Counter = require("../models/Counter");

const generateOrderNumber = async () => {
    const dateKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    const counter = await Counter.findOneAndUpdate(
        {
            name: "global-order",
            dateKey
        },
        {
            $inc: { sequence: 1 }
        },
        {
            new: true,
            upsert: true
        }
    );

return {
    orderNumber: `X${String(counter.sequence).padStart(3, "0")}`,
    orderDateKey: dateKey
};};

module.exports = generateOrderNumber;
