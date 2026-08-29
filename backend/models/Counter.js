const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
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

module.exports = mongoose.model("Counter", counterSchema);