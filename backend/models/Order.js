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

                s3Key: {
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
                },

                amount: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            required: true,
            enum: ["COD", "GPay"]
        },

        transactionId: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
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
            enum: ["PENDING", "COMPLETED", "NOT_COMPLETED"],
            default: "PENDING"
        },
        customerComment: {
            type: String,
            trim: true,
            maxlength: 500
        },
    },
    {
        collection: "orders",
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("Order", orderSchema);