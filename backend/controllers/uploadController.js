const { PDFDocument } = require("pdf-lib");

const {
    uploadToS3,
    getPdfUrl
} = require("../services/s3Service");

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "File is required"
            });
        }

        const pdfDoc = await PDFDocument.load(req.file.buffer);

        const pageCount = pdfDoc.getPageCount();

        const s3Key = await uploadToS3(req.file);

        const fileUrl = await getPdfUrl(s3Key);

        return res.status(201).json({
            message: "File uploaded successfully",

            file: {
                filename: req.file.originalname,
                originalFilename: req.file.originalname,
                fileSize: req.file.size,
                pageCount: pageCount,
                s3Key: s3Key,
                fileUrl: fileUrl
            }
        });

    } catch (error) {
        console.error("File upload error:", error);

        return res.status(400).json({
            message: "Invalid or corrupted PDF file"
        });
    }
};

module.exports = {
    uploadFile
};