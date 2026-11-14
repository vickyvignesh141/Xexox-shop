const Order = require("../models/Order");
const { S3Client, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION
});

// Verify or reject payment
const verifyPayment = async (req, res) => {
    try {
        const orderNumber = `V${req.params.year}/${req.params.sequence}`;
        const { status } = req.body || {};

        if (!["VERIFIED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid payment verification status"
            });
        }

        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.paymentVerificationStatus !== "PENDING") {
            return res.status(400).json({
                message: "Payment has already been verified or rejected"
            });
        }

        order.paymentVerificationStatus = status;

        if (status === "VERIFIED") {
            order.orderStatus = "PENDING";
        }

        if (status === "REJECTED") {
            order.orderStatus = "NOT_COMPLETED";
        }

        await order.save();

        return res.status(200).json({
            message: `Payment ${status.toLowerCase()} successfully`,
            order
        });

    } catch (error) {
        console.error("Verify payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Update Xerox status
const updateOrderStatus = async (req, res) => {
    try {
        console.log("STATUS BODY:", req.body);

        const orderNumber = `V${req.params.year}/${req.params.sequence}`;
        const { status } = req.body || {};

        if (!["COMPLETED", "NOT-COMPLETED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.paymentMethod === "GPay" &&
            order.paymentVerificationStatus !== "VERIFIED"
        ) {
            return res.status(400).json({
                message: "GPay payment must be verified before updating Xerox status"
            });
        }

        if (order.orderStatus !== "PENDING") {
            return res.status(400).json({
                message: "Order status has already been updated"
            });
        }

        order.orderStatus = status;

        await order.save();

        return res.status(200).json({
            message: `Order marked as ${status.toLowerCase()}`,
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate(
                "customerId",
                "name mobile department year section email"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getPdfUrl = async (req, res) => {
    try {
        const { s3Key } = req.query;

        if (!s3Key) {
            return res.status(400).json({
                message: "S3 key is required"
            });
        }

        const order = await Order.findOne({
            "files.s3Key": s3Key
        });

        if (!order) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        try {
            await s3.send(new HeadObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key
            }));
        } catch (error) {
            if (
                error.name === "NotFound" ||
                error.name === "NoSuchKey" ||
                error.$metadata?.httpStatusCode === 404
            ) {
                return res.status(410).json({
                    available: false,
                    code: "FILE_EXPIRED",
                    message: "This PDF has expired. Files are available for 3 days."
                });
            }

            throw error;
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key
        });

        const { getSignedUrl } = await import(
            "@aws-sdk/s3-request-presigner"
        );

        const url = await getSignedUrl(s3, command, {
            expiresIn: 3600
        });

        return res.status(200).json({ url });

    } catch (error) {
        console.error("Get PDF URL error:", error);

        return res.status(500).json({
            message: "Unable to generate PDF URL"
        });
    }
};

module.exports = {
    verifyPayment,
    updateOrderStatus,
    getAllOrders,
    getPdfUrl
};