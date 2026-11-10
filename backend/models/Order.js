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
            required: true
        },

        orderDateKey: {
            type: String,
            required: true
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
                },
                paperSize: {
                    type: String,
                    enum: ["A3", "A4", "VEC Paper"],
                    required: true
                },

                note: {
                    type: String,
                    trim: true,
                    default: ""
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
            required: function () {
                return this.paymentMethod === "GPay";
            },
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: function () {
                return this.paymentMethod === "GPay" ? "PENDING" : undefined;
            }
        },

        orderStatus: {
            type: String,
            required: true,
            enum: ["PENDING", "COMPLETED", "NOT-COMPLETED"],
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

orderSchema.index(
    { orderDateKey: 1, orderNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("Order", orderSchema);