const Order = require("../models/Order");
const generateOrderNumber = require("../services/orderNumberService");
const calculateFilePrice = require("../services/priceService");

const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            files,
            transactionId
        } = req.body;

        let totalAmount = 0;

        for (const file of files) {
            totalAmount += calculateFilePrice(
                file.pageCount,
                file.copies,
                file.colorMode,
                file.side
            );
        }

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


const getOrderByNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getMyOrders = async (req, res) => {
    try {
        const { customerId } = req.params;

        const orders = await Order.find({ customerId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createOrder,
    getOrderByNumber,
    getMyOrders
};