const express = require("express");
console.log("ownerRoutes.js loaded");
const router = express.Router();

const ownerAuth = require("../middleware/ownerAuth");

const {
    verifyPayment,
    updateOrderStatus,
    getAllOrders,getPdfUrl
} = require("../controllers/ownerController");


router.use((req, res, next) => {
    console.log("OWNER ROUTE HIT:", req.method, req.originalUrl);
    next();
});

console.log("PATCH ROUTE REGISTERING");

router.patch(
    "/orders/:orderNumber/payment",
    ownerAuth,
    verifyPayment
);

router.patch(
    "/orders/:orderNumber/status",
    ownerAuth,
    updateOrderStatus
);

router.get("/orders", ownerAuth, getAllOrders);

router.get(
    "/pdf-url",
    ownerAuth,
    getPdfUrl
);


module.exports = router;