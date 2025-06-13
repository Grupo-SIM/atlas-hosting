import nodemailer from "nodemailer";

// Create a transporter object using your SMTP server details
const transporter = nodemailer.createTransport({
  host: "atlashosting.com.br", // e.g., 'smtp.gmail.com'
  port: 465, // or 465 for SSL
  secure: true, // true for 465, false for other ports
  auth: {
    user: "norepl@atlashosting.com.br", // your SMTP username
    pass: "oj3gk5eh&H4^zJuf", // your SMTP password
  },
});

// Set up email data
const mailOptions = {
  from: '"Atlas Hosting" <norepl@atlashosting.com.br>', // sender address
  to: "lucasgarrafielo@gmail.com", // list of receivers
  subject: "SMTP Test Email", // Subject line
  text: "This is a test email from your Node.js application.", // plain text body
  html: "<b>This is a test email from your Node.js application.</b>", // html body
};

// Send mail with defined transport object
try {
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (error) {
  console.error("Error sending email: ", error);
}
