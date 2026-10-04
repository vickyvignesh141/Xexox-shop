const Order = require("../models/Order");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Verify or reject payment
const verifyPayment = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("CONTENT TYPE:", req.headers["content-type"]);
        const { orderNumber } = req.params;
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

        // Only verified payment can move to Xerox processing
        if (status === "VERIFIED") {
            order.orderStatus = "PENDING";
        }

        // Rejected payment cannot be processed
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
        const { orderNumber } = req.params;
        const { status } = req.body || {};

        if (!["COMPLETED", "NOT_COMPLETED"].includes(status)) {
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

        // Payment must be verified before Xerox can be completed
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