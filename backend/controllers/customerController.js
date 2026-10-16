const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer")


const createCustomer = async (req, res) => {
    
    try {
        const {
            mobile,
            name,
            department,
            year,
            section,
            email,
            password,
        } = req.body;

        if (
            !mobile || !name || !department ||
            !year || !section || !email || !password
        ) {
            return res.status(400).json({
                message: "All required fields must be provided",
            });
        }

        // Validate password on the backend too
        if (
            typeof password !== "string" ||
            !/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{1,6}$/.test(password)
        ) {
            return res.status(400).json({
                message:
                    "Password must be max 6 characters with one capital letter and one special character",
            });
        }

        const existingCustomer = await Customer.findOne({
            $or: [{ mobile }, { email }],
        });

        if (existingCustomer) {
            return res.status(409).json({
                message: "Mobile number or email already registered",
            });
        }

        const customer = new Customer({
            mobile,
            name,
            department,
            year: Number(year),
            section,
            email,
            password, // Customer model's pre-save hook hashes this
        });

        await customer.save();

        return res.status(201).json({
            message: "Customer created successfully",
            customer: {
                _id: customer._id,
                mobile: customer.mobile,
                name: customer.name,
                department: customer.department,
                year: customer.year,
                section: customer.section,
                email: customer.email,
            },
        });
    } catch (error) {
        console.error("Create customer error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Mobile number or email already registered",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};



const loginCustomer = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                message: "Mobile and password are required",
            });
        }

        const customer = await Customer.findOne({ mobile })
            .select("+password");

        if (!customer) {
            return res.status(401).json({
                message: "Invalid mobile number or password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid mobile number or password",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server configuration error",
            });
        }

        const token = jwt.sign(
            { customerId: customer._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            customer: {
                _id: customer._id,
                name: customer.name,
                mobile: customer.mobile,
                email: customer.email,
            },
        });
    } catch (error) {
        console.error("Customer login error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// const getCustomerByMobile = async (req, res) => {
//     try {
//         const { mobile } = req.params;

//         const customer = await Customer.findOne({ mobile })
//             .select("-password");

//         if (!customer) {
//             return res.status(404).json({
//                 message: "Customer not found",
//             });
//         }

//         return res.status(200).json({ customer });
//     } catch (error) {
//         console.error("Get customer error:", error);

//         return res.status(500).json({
//             message: "Internal server error",
//         });
//     }
// };

module.exports = {
    createCustomer,
    loginCustomer,
    // getCustomerByMobile,
};
