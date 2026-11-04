const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer")
const crypto = require("crypto");
const { sendResetOtpEmail } = require("../services/emailService");


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
            !/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,12}$/.test(password)
        ) {
            return res.status(400).json({
                message:
                    "Password must be 6-12 characters with one capital letter and one special character",
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

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const customer = await Customer.findOne({
            email: normalizedEmail
        }).select(
            "+resetOtpHash +resetOtpExpiresAt +resetOtpResendCount +resetOtpBlockedUntil"
        );

        // Always return a generic response if the email is not registered.
        if (!customer) {
            return res.status(200).json({
                message: "If your email is registered, you will receive an OTP."
            });
        }

        const now = new Date();

        // Check whether the customer is blocked from requesting OTPs.
        if (
            customer.resetOtpBlockedUntil &&
            customer.resetOtpBlockedUntil > now
        ) {
            return res.status(200).json({
                message: "If your email is registered, you will receive an OTP."
            });
        }

        const hasActiveOtp =
            customer.resetOtpHash &&
            customer.resetOtpExpiresAt &&
            customer.resetOtpExpiresAt > now;

        // Count repeated requests during an active OTP cycle as resends.
        if (hasActiveOtp && customer.resetOtpResendCount >= 3) {
            customer.resetOtpBlockedUntil = new Date(
                now.getTime() + 24 * 60 * 60 * 1000
            );

            await customer.save();

            return res.status(200).json({
                message: "If your email is registered, you will receive an OTP."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        customer.resetOtpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        customer.resetOtpExpiresAt = new Date(
            now.getTime() + 5 * 60 * 1000
        );

        if (hasActiveOtp) {
            customer.resetOtpResendCount += 1;
        } else {
            customer.resetOtpResendCount = 0;
        }

        customer.resetOtpAttempts = 0;
        customer.resetOtpVerifiedAt = undefined;
        customer.resetPasswordTokenHash = undefined;
        customer.resetPasswordTokenExpiresAt = undefined;

        await customer.save();

        await sendResetOtpEmail(normalizedEmail, otp);

        return res.status(200).json({
            message: "If your email is registered, you will receive an OTP."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to process your request. Please try again."
        });
    }
};


const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const customer = await Customer.findOne({
            email: email.trim().toLowerCase()
        }).select(
            "+resetOtpHash +resetOtpExpiresAt +resetOtpAttempts"
        );

        if (!customer || !customer.resetOtpHash) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        // Check OTP expiry
        if (
            !customer.resetOtpExpiresAt ||
            customer.resetOtpExpiresAt < new Date()
        ) {
            customer.resetOtpHash = undefined;
            customer.resetOtpExpiresAt = undefined;
            customer.resetOtpAttempts = 0;

            await customer.save();

            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Maximum 5 incorrect attempts
        if (customer.resetOtpAttempts >= 5) {
            customer.resetOtpHash = undefined;
            customer.resetOtpExpiresAt = undefined;

            await customer.save();

            return res.status(400).json({
                message: "Maximum OTP attempts reached. Please request a new OTP."
            });
        }

        const enteredOtpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const storedHash = Buffer.from(customer.resetOtpHash, "hex");
        const enteredHash = Buffer.from(enteredOtpHash, "hex");

        const isOtpValid =
            storedHash.length === enteredHash.length &&
            crypto.timingSafeEqual(storedHash, enteredHash);

        if (!isOtpValid) {
            customer.resetOtpAttempts += 1;
            await customer.save();

            return res.status(400).json({
                message: "Incorrect OTP. Please try again."
            });
        }

        // Generate a one-time password-reset authorization token
        const resetToken = crypto.randomBytes(32).toString("hex");

        customer.resetOtpHash = undefined;
        customer.resetOtpExpiresAt = undefined;
        customer.resetOtpAttempts = 0;
        customer.resetOtpVerifiedAt = new Date();

        customer.resetPasswordTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        customer.resetPasswordTokenExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await customer.save();

        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            message: "Unable to verify OTP. Please try again."
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword, confirmPassword } = req.body;

        if (!email || !resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Same password rules as customer registration
        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,12}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "Password must be 6-12 characters with at least one uppercase letter and one special character"
            });
        }

        const customer = await Customer.findOne({
            email: email.trim().toLowerCase()
        }).select(
            "+password +resetPasswordTokenHash +resetPasswordTokenExpiresAt"
        );

        if (!customer || !customer.resetPasswordTokenHash) {
            return res.status(400).json({
                message: "Invalid or expired password reset session"
            });
        }

        if (
            !customer.resetPasswordTokenExpiresAt ||
            customer.resetPasswordTokenExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message: "Password reset session expired. Please verify your OTP again."
            });
        }

        const submittedTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const storedHash = Buffer.from(
            customer.resetPasswordTokenHash,
            "hex"
        );

        const submittedHash = Buffer.from(submittedTokenHash, "hex");

        const isTokenValid =
            storedHash.length === submittedHash.length &&
            crypto.timingSafeEqual(storedHash, submittedHash);

        if (!isTokenValid) {
            return res.status(400).json({
                message: "Invalid or expired password reset session"
            });
        }

        // Assigning and saving triggers your existing bcrypt pre-save hook.
        customer.password = newPassword;

        // Clear password reset data after successful reset.
        customer.resetOtpHash = undefined;
        customer.resetOtpExpiresAt = undefined;
        customer.resetOtpAttempts = 0;
        customer.resetOtpResendCount = 0;
        customer.resetOtpBlockedUntil = undefined;
        customer.resetOtpVerifiedAt = undefined;
        customer.resetPasswordTokenHash = undefined;
        customer.resetPasswordTokenExpiresAt = undefined;

        await customer.save();

        return res.status(200).json({
            message: "Password reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password. Please try again."
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
    forgotPassword,
    verifyResetOtp,
     resetPassword

    // getCustomerByMobile,
};
