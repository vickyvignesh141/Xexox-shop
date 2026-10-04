const Customer = require("../models/Customer")


const createCustomer = async (req, res) => {
    
    try {
        const {
            mobile,
            name,
            department,
            year,
            section,
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
            
            email
        });

        await customer.save();
        console.log("REGISTER BODY:", req.body);

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
const getCustomerByMobile = async (req, res) => {
    try {
        const { mobile } = req.params;
        const customer = await Customer.findOne({ mobile });
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        return res.status(200).json({
            customer
        });
    }
    catch (error) {
        console.error("Get customer error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = { createCustomer, getCustomerByMobile};