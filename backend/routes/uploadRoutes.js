const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadFile } = require("../controllers/uploadController");
const customerAuth = require("../middleware/customerAuth");

router.post("/", customerAuth,upload.single("file"), uploadFile);

module.exports = router;