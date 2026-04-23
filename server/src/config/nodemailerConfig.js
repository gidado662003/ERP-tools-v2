const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // REQUIRED for 587 (STARTTLS)

  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },

  requireTLS: true,

  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
    ciphers: "SSLv3", // Add cipher suite
  },

  // ⭐ Connection pooling settings - prevents connection reuse issues
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
  rateDelta: 1000,
  rateLimit: 5,

  // ⭐ Force new connection for each email
  // pool: false, // Alternative: disable pooling entirely
});

// Prevent crash if socket closes weirdly
transporter.on("error", (err) => {
  console.error("SMTP transporter error (handled):", err.message);
});

// Add event listeners for debugging
transporter.on("idle", () => {
  console.log("Transporter is idle");
});

transporter.on("token", (token) => {
  console.log("Got authentication token:", token.user);
});

transporter
  .verify()
  .then(() => console.log("Email transporter is ready ✅"))
  .catch((err) => console.error("Transport verify error:", err));

module.exports = transporter;
