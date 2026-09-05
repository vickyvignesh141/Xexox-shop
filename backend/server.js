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





const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Xerox Shop API is running!");
});

app.use((req, res, next) => {
    console.log("GLOBAL:", req.method, req.originalUrl);
    next();
});

app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
console.log("OWNER ROUTES REGISTERING");
app.use("/api/owner", ownerRoutes);
app.use("/api/owner", (req, res, next) => {
    console.log("OWNER REQUEST HIT:", req.method, req.originalUrl);
    next();
});

app.use((req, res, next) => {
    console.log("GLOBAL:", req.method, req.originalUrl);
    next();
});
app.use("/api/owner", ownerAuthRoutes);
app.use((err, req, res, next) => {
    console.log("SERVER ERROR:", err.message);
    res.status(400).json({
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


    