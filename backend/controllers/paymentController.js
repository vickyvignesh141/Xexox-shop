const Order = require("../models/Order");
const generateOrderNumber = require("../services/orderNumberService");
const Customer = require("../models/Customer");
const calculateFilePrice = require("../services/priceService");

const createPaymentOrder = async (req, res) => {
    try {
        const {
            customerId,
            files,
            transactionId
        } = req.body;


        if (!customerId || !files || !files.length || !transactionId) {
            return res.status(400).json({
                message: "Valid order and payment details are required"
            });
        }


        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        for (const file of files) {
    if (
        !file.filename ||
        !file.fileUrl ||
        !Number.isInteger(file.pageCount) ||
        file.pageCount < 1 ||
        !Number.isInteger(file.copies) ||
        file.copies < 1 ||
        !["BW", "COLOR"].includes(file.colorMode) ||
        !["SINGLE", "DOUBLE"].includes(file.side)
    ) {
        return res.status(400).json({
            message: "Invalid file details"
        });
    }
}

        const existingOrder = await Order.findOne({ transactionId });

        if (existingOrder) {
            return res.status(409).json({
                message: "Transaction ID already used"
            });
        }

        let totalAmount = 0;

        for (const file of files) {
            const filePrice = calculateFilePrice(
                file.pageCount,
                file.copies,
                file.colorMode,
                file.side
            );

            totalAmount += filePrice;
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
            message: "Payment submitted and order created successfully",
            order
        });
    } catch (error) {
        console.error("Create payment order error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createPaymentOrder
};
