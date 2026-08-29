const Customer = require("../models/Customer")


const createCustomer = async (req, res) => {
    try {
        const {
            mobile,
            name,
            department,
            year,
            section,
            registerNumber,
            email
        } = req.body;

        if (!mobile || !name || !department || !year || !section || !email) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }
        const existingCustomer = await Customer.findOne({ mobile });

        if (existingCustomer) {
            return res.status(409).json({
                message: "Customer already exists"
            });
        }

        const customer = new Customer({
            mobile,
            name,
            department,
            year,
            section,
            registerNumber,
            email
        });

        await customer.save();
        return res.status(201).json({
            message: "Customer created successfully",
            customer
        });
    }
    catch (error) {
        console.error("Create customer error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }

}

module.exports = { createCustomer };