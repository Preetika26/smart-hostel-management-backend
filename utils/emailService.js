const sgMail = require("@sendgrid/mail");

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SendGrid not configured: missing SENDGRID_API_KEY");
}

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error(
        "Email service not configured. Add SENDGRID_API_KEY and SENDGRID_SENDER_EMAIL."
      );
    }

    const recipients = Array.isArray(to)
      ? to.filter(Boolean)
      : String(to || "")
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean);

    if (recipients.length === 0) {
      return null;
    }

    const mailOptions = {
      to: recipients,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      html,
    };

    const [response] = await sgMail.send(mailOptions, false);
    console.log("Email sent via SendGrid:", response.statusCode);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
