
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();



const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
const Owner = require("./models/owner");

const MONGO_URI = process.env.MONGODB_URI;

const createOwner = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        const hashedPassword = await bcrypt.hash("Owner@123", 10);

        await Owner.create({
            name: "Shop Owner",
            email: "owner@shop.com",
            password: hashedPassword
        });

        console.log("Owner created successfully");

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createOwner();