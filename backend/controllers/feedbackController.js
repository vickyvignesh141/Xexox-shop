const submitFeedback = async (req, res) => {
    try {
        const { email, description } = req.body;

        if (!email || !description) {
            return res.status(400).json({
                message: "Email and feedback are required"
            });
        }

        // Send email using AWS SES
        const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

        const ses = new SESv2Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        const command = new SendEmailCommand({
            FromEmailAddress: process.env.FEEDBACK_FROM_EMAIL,
            Destination: {
                ToAddresses: [process.env.FEEDBACK_TO_EMAIL]
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: "New Student Feedback - STUDENTXEXOX"
                    },
                    Body: {
                        Text: {
                            Data:
                                `Student Email: ${email}\n\n` +
                                `Feedback:\n${description}`
                        }
                    }
                }
            }
        });

        await ses.send(command);

        return res.status(200).json({
            message: "Feedback submitted successfully"
        });

    } catch (error) {
        console.error("Feedback error:", error);

        return res.status(500).json({
            message: "Unable to send feedback"
        });
    }
};

module.exports = {
    submitFeedback
};