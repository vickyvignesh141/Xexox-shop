const express = require("express");
const router = express.Router();

const { createCustomer, getCustomerByMobile } = require("../controllers/customerController");

router.post("/", createCustomer)
router.get("/:mobile", getCustomerByMobile)
module.exports = router;