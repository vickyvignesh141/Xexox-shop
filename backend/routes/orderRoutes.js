const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrderByNumber,
    getMyOrders,
    calculatePrice,
    getCustomerPdfUrl,
    deletePendingOrder,
deletePendingOrderFile,
} = require("../controllers/orderController");

const customerAuth = require("../middleware/customerAuth");

router.post("/", customerAuth, createOrder);
router.get("/my-orders", customerAuth, getMyOrders);
// router.get("/:orderNumber", customerAuth, getOrderByNumber);
router.post("/calculate-price", customerAuth,calculatePrice);
router.delete("/:orderId/files", customerAuth, deletePendingOrderFile);
router.delete("/:orderId", customerAuth, deletePendingOrder);

module.exports = router;