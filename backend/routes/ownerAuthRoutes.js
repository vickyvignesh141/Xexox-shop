const express = require("express");

const router = express.Router();

const { loginOwner, registerOwner } = require("../controllers/ownerAuthController");


router.post("/register",registerOwner)
router.post("/login", loginOwner);

module.exports = router;