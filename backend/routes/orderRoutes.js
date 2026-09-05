const express = require("express");

const router = express.Router();

const {createOrder,getOrderByNumber,getMyOrders} = require("../controllers/orderController");


router.post("/", createOrder);
router.get("/customer/:customerId", getMyOrders);
router.get("/:orderNumber", getOrderByNumber);


module.exports = router;