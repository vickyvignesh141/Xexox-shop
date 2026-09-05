const express = require("express");

const router = express.Router();

const { loginOwner } = require("../controllers/ownerAuthController");

router.post("/login", loginOwner);

module.exports = router;