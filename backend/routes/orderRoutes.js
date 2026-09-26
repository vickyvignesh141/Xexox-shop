const express = require("express");

const router = express.Router();

const {createOrder,getOrderByNumber,getMyOrders,calculatePrice} = require("../controllers/orderController");


console.log("ORDER ROUTES LOADED");

router.post("/", (req, res, next) => {
    next();
}, createOrder);
router.get("/customer/:customerId", getMyOrders);
router.get("/:orderNumber", getOrderByNumber);
router.post("/calculate-price", calculatePrice);


module.exports = router;