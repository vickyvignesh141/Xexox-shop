const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadToS3 = async (file) => {
    const key = `pdfs/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);

    return key;
};

const getPdfUrl = async (key) => {

    // IMPORTANT: dynamic import
    const { getSignedUrl } =
        await import("@aws-sdk/s3-request-presigner");

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    const url = await getSignedUrl(s3, command, {
        expiresIn: 3600
    });

    return url;
};

module.exports = {
    uploadToS3,
    getPdfUrl
};