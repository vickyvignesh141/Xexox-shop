const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Owner = require("../models/owner");

const loginOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const owner = await Owner.findOne({
            email: email.toLowerCase()
        });

        if (!owner) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            owner.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                ownerId: owner._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Owner login successful",
            token
        });

    } catch (error) {
        console.error("Owner login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    loginOwner
};