const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const ownerAuthRoutes = require("./routes/ownerAuthRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("GLOBAL:", req.method, req.originalUrl);
    next();
});

// Home
app.get("/", (req, res) => {
    res.send("Xerox Shop API is running!");
});

// Uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/owner", ownerAuthRoutes);
app.use("/api/upload", uploadRoutes);

// Error handling - MUST be last
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.message);

    return res.status(400).json({
        message: err.message
    });
});

// MongoDB + Server
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });