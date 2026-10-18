const Order = require("../models/Order");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const getFileViewUrl = async (req, res) => {
    try {
        const { s3Key } = req.query;

        if (!s3Key) {
            return res.status(400).json({ message: "S3 key is required" });
        }

        // Owner can view files after owner authentication.
        if (req.userRole === "owner") {
            const order = await Order.findOne({
                "files.s3Key": s3Key,
            });

            if (!order) {
                return res.status(404).json({ message: "File not found" });
            }
        } else if (req.userRole === "customer") {
            const order = await Order.findOne({
                customerId: req.customerId,
                "files.s3Key": s3Key,
            });

            if (!order) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
        });

        const url = await getSignedUrl(s3, command, {
            expiresIn: 3600,
        });

        return res.status(200).json({ url });
    } catch (error) {
        console.error("File view URL error:", error);
        return res.status(500).json({ message: "Unable to open file" });
    }
};

module.exports = { getFileViewUrl };