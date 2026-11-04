const express = require("express");
const router = express.Router();

const { createCustomer, loginCustomer, forgotPassword, verifyResetOtp, resetPassword, getCustomerByMobile } = require("../controllers/customerController");

router.post("/", createCustomer)
router.post("/login", loginCustomer);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
// router.get("/:mobile", getCustomerByMobile)

module.exports = router;