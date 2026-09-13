const express = require("express");

const router = express.Router();

const {createOrder,getOrderByNumber,getMyOrders} = require("../controllers/orderController");


console.log("ORDER ROUTES LOADED");

router.post("/", (req, res, next) => {
    console.log("CREATE ORDER ROUTE HIT");
    next();
}, createOrder);
router.get("/customer/:customerId", getMyOrders);
router.get("/:orderNumber", getOrderByNumber);


module.exports = router;