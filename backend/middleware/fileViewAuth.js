const jwt = require("jsonwebtoken");

const fileViewAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.ownerId) {
            req.userRole = "owner";
            req.ownerId = decoded.ownerId;
        } else if (decoded.customerId) {
            req.userRole = "customer";
            req.customerId = decoded.customerId;
        } else {
            return res.status(401).json({
                message: "Invalid token",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = fileViewAuth;