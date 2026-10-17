const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrderByNumber,
    getMyOrders,
    calculatePrice,
} = require("../controllers/orderController");

const customerAuth = require("../middleware/customerAuth");

router.post("/", customerAuth, createOrder);
router.get("/my-orders", customerAuth, getMyOrders);
router.get("/:orderNumber", customerAuth, getOrderByNumber);
router.post("/calculate-price", customerAuth,calculatePrice);

module.exports = router;