const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendMail({ to, subject, text, html }) {
  const toStr = Array.isArray(to) ? to.join(",") : to;
  await transporter.sendMail({
    from: `"${process.env.APP_NAME || "CartMate"}" <${process.env.EMAIL_USER}>`,
    to: toStr,
    subject,
    text,
    html,
  });
}

module.exports = sendMail;
