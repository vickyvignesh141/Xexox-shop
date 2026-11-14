
const Counter = require("../models/Counter");

const generateOrderNumber = async () => {

    const year = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Kolkata",
        year: "2-digit"
    }).format(new Date());

    const counter = await Counter.findOneAndUpdate(
        {
            name: "global-order",
            dateKey: year
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
        orderNumber: `V${year}/${String(counter.sequence).padStart(5, "0")}`,
        orderDateKey: year
    };
};

module.exports = generateOrderNumber;
