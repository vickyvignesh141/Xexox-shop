const express = require("express");
const router = express.Router();

const fileViewAuth = require("../middleware/fileViewAuth");
const { getFileViewUrl } = require("../controllers/fileController");

router.get("/view-url", fileViewAuth, getFileViewUrl);

module.exports = router;