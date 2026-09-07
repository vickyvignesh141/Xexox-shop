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

        // Check transaction ID
        const existingOrder = await Order.findOne({ transactionId });

        if (existingOrder) {
            return res.status(409).json({
                message: "Transaction ID already used"
            });
        }

        // Validate files
        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                message: "At least one file is required"
            });
        }

        if (files.length > 2) {
            return res.status(400).json({
                message: "Maximum 2 files are allowed per order"
            });
        }

        let totalAmount = 0;

        // Calculate amount for each file
        const updatedFiles = files.map((file) => {
            const amount = calculateFilePrice(
                file.pageCount,
                file.copies,
                file.colorMode,
                file.side
            );

            totalAmount += amount;

            return {
                ...file,
                amount
            };
        });

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order
        const order = new Order({
            customerId,
            orderNumber,
            files: updatedFiles,
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

        // Duplicate transaction ID
        if (
            error.code === 11000 &&
            error.keyPattern?.transactionId
        ) {
            return res.status(409).json({
                message: "Transaction ID already used"
            });
        }

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