
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        dateKey: {
            type: String,
            required: true
        },

        sequence: {
            type: Number,
            default: 0
        }
    },
    {
        collection: "counters",
        versionKey: false
    }
);

// Unique combination of name + dateKey
counterSchema.index(
    { name: 1, dateKey: 1 },
    { unique: true }
);

module.exports = mongoose.model("Counter", counterSchema);
