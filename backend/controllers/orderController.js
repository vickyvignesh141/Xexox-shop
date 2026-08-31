const Order = require("../models/Order");
const generateOrderNumber = require("../services/orderNumberService");


const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            files,
            totalAmount,
            transactionId
        } = req.body;

        // Generate unique order number
        const orderNumber = await generateOrderNumber();

        const order = new Order({
            customerId,
            orderNumber,
            files,
            totalAmount,
            transactionId
        });

        await order.save();

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createOrder
};