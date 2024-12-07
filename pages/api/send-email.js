import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("=== API Request Details ===");
    console.log("1. Request method:", req.method);
    console.log("2. Request headers:", req.headers);
    console.log("3. Request body keys:", Object.keys(req.body));

    const { fromEmail, toEmail, message, attachment } = req.body;

    console.log("4. fromEmail:", fromEmail);
    console.log("5. toEmail:", toEmail);
    console.log("6. message:", message);
    console.log("7. Attachment exists:", !!attachment);

    // Create transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
    });

    // Convert base64 to buffer directly
    const base64Data = attachment.split("base64,")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");

    let mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: "New Drawing from Website",
      text: message,
      attachments: [
        {
          filename: "drawing.png",
          content: imageBuffer,
          encoding: "base64",
          contentType: "image/png",
          contentDisposition: "attachment",
        },
      ],
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to send email: " + error.message });
  }
}
