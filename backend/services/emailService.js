
const {
    SESv2Client,
    SendEmailCommand
} = require("@aws-sdk/client-sesv2");

const sesClient = new SESv2Client({
    region: process.env.AWS_REGION,

});

const sendResetOtpEmail = async (email, otp) => {

    const command = new SendEmailCommand({
        FromEmailAddress: process.env.SES_FROM_EMAIL,

        Destination: {
            ToAddresses: [email]
        },

        Content: {
            Simple: {
                Subject: {
                    Data: "Print Cafe - Password Reset OTP",
                    Charset: "UTF-8"
                },

                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2 style="color: #D4AF37;">Print Cafe</h2>

                                <h3>Password Reset Verification</h3>

                                <p>Your 6-digit verification code is:</p>

                                <h1 style="letter-spacing: 8px; color: #D4AF37;">
                                    ${otp}
                                </h1>

                                <p>This OTP expires in 5 minutes.</p>

                                <p>Do not share this code with anyone.</p>

                                <p>If you did not request this, please ignore this email.</p>

                                <br/>

                                <p>Regards,<br/>Print Cafe Team</p>
                            </div>
                        `,
                        Charset: "UTF-8"
                    }
                }
            }
        }
    });

try {
    console.log("OTP EMAIL FUNCTION CALLED:", email);
    const result = await sesClient.send(command);

    console.log("OTP EMAIL SENT:", result.MessageId);

} catch (error) {
    console.error("SES ERROR NAME:", error.name);
    console.error("SES ERROR MESSAGE:", error.message);
    console.error("SES ERROR METADATA:", error.$metadata);
    console.error("SES ERROR DETAILS:", error);

    throw error;
}};

module.exports = {
    sendResetOtpEmail
};
