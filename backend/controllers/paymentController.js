const Order = require("../models/Order");
const generateOrderNumber = require("../services/orderNumberService");
const Customer = require("../models/Customer");
const calculateFilePrice = require("../services/priceService");

const createPaymentOrder = async (req, res) => {
    try {
        const {
            customerId,
            files,
            paymentMethod,
            transactionId
        } = req.body;

        // --------------------------------
        // 1. Basic validation
        // --------------------------------
        if (
            !customerId ||
            !Array.isArray(files) ||
            files.length === 0 ||
            !["COD", "GPay"].includes(paymentMethod)
        ) {
            return res.status(400).json({
                message: "Valid order and payment details are required"
            });
        }

        if (paymentMethod === "GPay" && !transactionId?.trim()) {
            return res.status(400).json({
                message: "GPay transaction ID is required"
            });
        }
        // --------------------------------
        // 2. Check customer
        // --------------------------------
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // --------------------------------
        // 3. Check duplicate transaction ID
        // --------------------------------
        if (paymentMethod === "GPay") {
    const existingOrder = await Order.findOne({
        transactionId: transactionId.trim()
    });

    if (existingOrder) {
        return res.status(409).json({
            message: "Transaction ID already used"
        });
    }
}

        // --------------------------------
        // 4. Validate and calculate each file
        // --------------------------------
        const processedFiles = [];
        let totalAmount = 0;

        for (const file of files) {

            if (
                !file.filename ||
                !file.fileUrl ||
                !Number.isInteger(file.fileSize) ||
                file.fileSize < 0 ||
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

            // Backend calculates the price
            const filePrice = calculateFilePrice(
                file.pageCount,
                file.copies,
                file.colorMode,
                file.side
            );

            // Add file price to grand total
            totalAmount += filePrice;

            // Store calculated amount with the file
            processedFiles.push({
                filename: file.filename,
                s3Key: file.s3Key,
                fileSize: file.fileSize,
                pageCount: file.pageCount,
                copies: file.copies,
                colorMode: file.colorMode,
                side: file.side,
                amount: filePrice
            });
        }

        // --------------------------------
        // 5. Generate order number
        // --------------------------------
        const orderNumber = await generateOrderNumber();

        // --------------------------------
        // 6. Create order
        // --------------------------------
        const order = new Order({
    customerId,
    orderNumber,
    files: processedFiles,
    totalAmount,
    paymentMethod,
    transactionId:
        paymentMethod === "GPay"
            ? transactionId.trim()
            : null
});

        await order.save();

        // --------------------------------
        // 7. Send response
        // --------------------------------
        return res.status(201).json({
            message: "Payment submitted and order created successfully",

            order: {
                orderNumber: order.orderNumber,
                files: order.files,
                totalAmount: order.totalAmount,
                transactionId: order.transactionId,
                paymentVerificationStatus:
                    order.paymentVerificationStatus,
                orderStatus: order.orderStatus
            }
        });

    } catch (error) {

        console.error(
            "Create payment order error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createPaymentOrder
};
