const cron = require("node-cron")
const member = require("../model/member")
const dotenv = require("dotenv")
dotenv.config()
const {transporter} = require("../util/nodemailer")
cron.schedule("0 0 * * *", async () => {
  const members = await member.find({ paymentStatus: "done" });
  const now = new Date();

  for (const m of members) {
    const paymentDate = new Date(m.paydate);
    const validDuration = m.paymentvalidduration;
    const unit = m.durationUnit?.toLowerCase(); // normalize case

    // Clone paymentDate to avoid mutating the original
    const expiryDate = new Date(paymentDate);

    if (unit === "day") {
      expiryDate.setDate(expiryDate.getDate() + validDuration);
    } else if (unit === "week") {
      expiryDate.setDate(expiryDate.getDate() + validDuration * 7);
    } else if (unit === "month") {
      expiryDate.setMonth(expiryDate.getMonth() + validDuration);
    } else if (unit === "year") {
      expiryDate.setFullYear(expiryDate.getFullYear() + validDuration);
    } else {
      console.log(`⚠️ Unknown durationUnit: ${unit} for member ${m.username}`);
      continue;
    }

    // Check if expired
    if (now > expiryDate) {
      m.paymentStatus = "none";
      await m.save();
      const mainOptions = {
          from: process.env.SENDER_EMAIL,
          to: m.email,
          subject: "gym membership  expired",
          text: `Dear ${m.username}, your gym membership has expired. Please renew to continue.`,
        };
        await transporter.sendMail(mainOptions);
      console.log(`❗ Membership expired for ${m.username}`);
    }
  }
});