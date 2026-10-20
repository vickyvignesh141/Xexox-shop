const Order = require("../models/Order");
const Customer = require("../models/Customer");
const generateOrderNumber = require("../services/orderNumberService");
const calculateFilePrice = require("../services/priceService");

const { S3Client, GetObjectCommand,DeleteObjectCommand } = require("@aws-sdk/client-s3");

const { PDFDocument } = require("pdf-lib");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


// ======================================================
// CALCULATE PRICE
// ======================================================

const calculatePrice = async (req, res) => {
    try {

        const { files } = req.body;

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                message: "At least one file is required"
            });
        }

        const calculatedFiles = [];

        let totalAmount = 0;

        for (const file of files) {

            const {
                pageCount,
                copies,
                colorMode,
                side
            } = file;

            if (
                !Number.isInteger(pageCount) ||
                pageCount < 1 ||

                !Number.isInteger(copies) ||
                copies < 1 ||

                !["BW", "COLOR"].includes(colorMode) ||

                !["SINGLE", "DOUBLE"].includes(side)
            ) {
                return res.status(400).json({
                    message: "Invalid price details"
                });
            }

            const amount = calculateFilePrice(
                pageCount,
                copies,
                colorMode,
                side
            );

            calculatedFiles.push({
                amount
            });

            totalAmount += amount;
        }

        return res.status(200).json({
            files: calculatedFiles,
            totalAmount
        });

    } catch (error) {

        console.error(
            "Calculate price error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// CREATE ORDER
// ======================================================

const createOrder = async (req, res) => {

    console.log("CREATE ORDER CONTROLLER HIT");

    try {

        const {
            files,
            paymentMethod,
            transactionId,
            customerComment
        } = req.body;

        const customerId = req.customerId;

        // --------------------------------
        // Find customer
        // --------------------------------

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }


        // --------------------------------
        // Validate payment method
        // --------------------------------

        if (!["COD", "GPay"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }


        // --------------------------------
        // Validate GPay transaction ID
        // --------------------------------

        if (
            paymentMethod === "GPay" &&
            (!transactionId || !transactionId.trim())
        ) {
            return res.status(400).json({
                message: "Transaction ID is required for GPay payment"
            });
        }


        // --------------------------------
        // Check duplicate transaction ID
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
        // Validate files
        // --------------------------------

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


        // --------------------------------
        // Verify S3 files
        // --------------------------------

        for (const file of files) {

            if (!file.s3Key || !file.pageCount) {
                return res.status(400).json({
                    message: "S3 key and page count are required"
                });
            }


            try {

                const command = new GetObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: file.s3Key
                });

                const s3Response = await s3.send(command);


                // Convert S3 stream to buffer
                const chunks = [];

                for await (const chunk of s3Response.Body) {
                    chunks.push(chunk);
                }

                const pdfBytes = Buffer.concat(chunks);


                // Read PDF
                const pdfDoc = await PDFDocument.load(pdfBytes);

                const actualPageCount = pdfDoc.getPageCount();


                // Verify page count
                if (actualPageCount !== file.pageCount) {

                    return res.status(400).json({
                        message:
                            `Page count mismatch for ${file.s3Key}`
                    });
                }

            } catch (error) {

                console.error(
                    "S3 PDF verification error:",
                    error
                );

                return res.status(400).json({
                    message:
                        `Unable to verify uploaded PDF: ${file.s3Key}`
                });
            }
        }


        // --------------------------------
        // Calculate total amount
        // --------------------------------

        let totalAmount = 0;

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


        // --------------------------------
        // Generate order number
        // --------------------------------

        const orderNumber = await generateOrderNumber();


        // --------------------------------
        // Create order
        // --------------------------------

        const orderData = {
            customerId,
            orderNumber,
            files: updatedFiles,
            totalAmount,
            paymentMethod,
            customerComment: customerComment?.trim() || undefined
        };

        if (paymentMethod === "GPay") {
            orderData.transactionId = transactionId.trim();
        }

        const order = new Order(orderData);
        await order.save();


        // --------------------------------
        // Response
        // --------------------------------

        return res.status(201).json({

            message: "Order created successfully",

            order

        });

    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        // Duplicate transaction ID
        if (
            error.code === 11000 &&
            error.keyPattern?.transactionId
        ) {

            return res.status(409).json({
                message: "Transaction ID already used"
            });
        }


        // Mongoose validation error
        if (error.name === "ValidationError") {

            return res.status(400).json({
                message: error.message
            });
        }


        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ======================================================
// GET ORDER BY NUMBER
// ======================================================

// const getOrderByNumber = async (req, res) => {

//     try {

//         const { orderNumber } = req.params;
        
//         const order = await Order.findOne({
//             orderNumber,
//             customerId: req.customerId
//         });

//         if (!order) {
//             return res.status(404).json({
//                 message: "Order not found"
//             });
//         }

//         return res.status(200).json({
//             order
//         });

//     } catch (error) {

//         console.error(
//             "Get order error:",
//             error
//         );

//         return res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// };


// ======================================================
// GET MY ORDERS
// ======================================================

const getMyOrders = async (req, res) => {

    try {


        const orders = await Order.find({
            customerId: req.customerId
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            orders
        });

    } catch (error) {

        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getCustomerPdfUrl = async (req, res) => {
    try {
        const { s3Key } = req.query;

        if (!s3Key) {
            return res.status(400).json({ message: "S3 key is required" });
        }

        // Verify this PDF belongs to this customer's order
        const order = await Order.findOne({
            customerId: req.customerId,
            "files.s3Key": s3Key,
        });

        if (!order) {
            return res.status(404).json({ message: "File not found" });
        }

        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
        });

        const url = await getSignedUrl(s3, command, {
            expiresIn: 3600,
        });

        return res.status(200).json({ url });
    } catch (error) {
        console.error("Customer PDF URL error:", error);
        return res.status(500).json({
            message: "Unable to generate PDF URL",
        });
    }
};


const deletePendingOrderFile = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { s3Key } = req.body;

        if (!s3Key) {
            return res.status(400).json({
                message: "S3 key is required"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            customerId: req.customerId,
            orderStatus: "PENDING",
            "files.s3Key": s3Key
        });

        if (!order) {
            return res.status(404).json({
                message: "Pending order or PDF not found"
            });
        }

        if (order.files.length <= 1) {
            return res.status(400).json({
                message: "Delete the entire order instead"
            });
        }

        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key
        }));

        order.files = order.files.filter(
            file => file.s3Key !== s3Key
        );

        order.totalAmount = order.files.reduce(
            (total, file) => total + file.amount,
            0
        );

        await order.save();

        return res.status(200).json({
            message: "PDF deleted successfully"
        });
    } catch (error) {
        console.error("Delete PDF error:", error);

        return res.status(500).json({
            message: "Unable to delete PDF"
        });
    }
};

const deletePendingOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            customerId: req.customerId,
            orderStatus: "PENDING"
        });

        if (!order) {
            return res.status(404).json({
                message: "Pending order not found"
            });
        }

        // Delete all PDFs from S3 first
        for (const file of order.files) {
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: file.s3Key
            }));
        }

        // Delete order from MongoDB
        await Order.deleteOne({
            _id: order._id,
            customerId: req.customerId,
            orderStatus: "PENDING"
        });

        return res.status(200).json({
            message: "Order and PDFs deleted successfully"
        });
    } catch (error) {
        console.error("Delete order error:", error);

        return res.status(500).json({
            message: "Unable to delete order"
        });
    }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createOrder,
    // getOrderByNumber,
    getMyOrders,
    calculatePrice,
    getCustomerPdfUrl,
    deletePendingOrder,
    deletePendingOrderFile
};