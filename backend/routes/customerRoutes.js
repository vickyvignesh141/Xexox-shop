const express = require("express");
const router = express.Router();

const { createCustomer, loginCustomer, getCustomerByMobile } = require("../controllers/customerController");

router.post("/", createCustomer)
router.post("/login", loginCustomer);
// router.get("/:mobile", getCustomerByMobile)

module.exports = router;