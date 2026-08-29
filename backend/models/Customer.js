const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({

    mobile: {
        type: String,
        required: true,
        unique: true,
        match: /^[6-9]\d{9}$/
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true,
        enum: [
            "Aeronautical Engineering",
            "Automobile Engineering",
            "Civil Engineering",
            "Electrical and Electronics Engineering",
            "Electronics and Communication Engineering",
            "Information Technology",
            "Computer Science and Engineering (Cyber Security)",
            "Computer Science and Engineering",
            "Mechanical Engineering",
            "Electronics and Instrumentation Engineering",
            "Master of Business Administration"
        ]

    },
    year: {
        type: Number,
        required: true,
        min: 1, max: 4,
        validate: {
            validator: function (value) {
                if (!Number.isInteger(value)) return false;

                if (this.department === "Master of Business Administration") {
                    return [1, 2].includes(value);
                }

                return value >= 1 && value <= 4;
            },
            message: "Invalid year for the selected department"
        }

    },
    section: {
        type: String,
        required: true,
        uppercase: true,
        enum: ['A', 'B', 'C', 'D']

    },
    // registerNumber: {
    //     type: String,
    //     required: false,
    //     unique: true,
    //     trim: true    //it removes the extra space at start and end only  " 12348 " - "1234"
    // },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
}, {
    collection: "customers",
    versionKey: false,  // collection name in db
    timestamps: true

});

module.exports = mongoose.model("Customer", customerSchema);
