const Order = require("../models/Order");

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
        if (order.paymentVerificationStatus !== "VERIFIED") {
            return res.status(400).json({
                message: "Payment must be verified before updating Xerox status"
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


module.exports = {
    verifyPayment,
    updateOrderStatus
};