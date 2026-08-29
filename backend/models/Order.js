const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true
        },

        files: [
            {
                filename: {
                    type: String,
                    required: true
                },

                fileUrl: {
                    type: String,
                    required: true
                },

                fileSize: {
                    type: Number,
                    required: true
                },

                pageCount: {
                    type: Number,
                    required: true,
                    min: 1,
                    validate: {
                        validator: Number.isInteger,
                        message: "Page count must be a whole number"
                    }
                },

                copies: {
                    type: Number,
                    required: true,
                    min: 1,
                    validate: {
                        validator: Number.isInteger,
                        message: "Copies must be a whole number"
                    }
                },

                colorMode: {
                    type: String,
                    required: true,
                    enum: ["BW", "COLOR"]
                },

                side: {
                    type: String,
                    required: true,
                    enum: ["SINGLE", "DOUBLE"]
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        transactionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        paymentVerificationStatus: {
            type: String,
            required: true,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: "PENDING"
        },

        orderStatus: {
            type: String,
            required: true,
            enum: ["PROCESSING", "COMPLETED", "NOT_COMPLETED"],
            default: "PROCESSING"
        }
    },
    {
        collection: "orders",
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("Order", orderSchema);