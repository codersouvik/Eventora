const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const Otp = require("../models/Otp");

dotenv.config();

const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
    port: 2525,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
    },
})

const sendOtpEmail = async (email, Otp, type) => {
    try {

        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora booking Verification';

        const msg = type === 'account-verification' ?
            'Please use the following Otp to verify your Eventora account'
            :
            'Please use the following Otp to verify and confirm your event booking'

        const mailOptions = {
            from: `"Eventora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: title,
            text: `Your OTP code is :${Otp} `
        }

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email} for ${type}`)
    }
    catch (error) {
        console.log(`Error sending Otp email to ${email} for ${type}:`, error)
    }
}

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: `"Eventora" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Confirmed : ${eventTitle}`,
            html: `
                 <h2>Hi ${userName}</h2>
                 <p>Your Booking for the event <strong>${eventTitle}</strong> is Successfully completed</p>.
                 <p>Thank You for choosing Eventora</p>
                `
        }

        await transporter.sendMail(mailOptions);
        console.log("Email sent Successfully to ", userEmail);
    }
    catch (error) {
        console.error("Error sending email:", error)
    }
}

module.exports = { sendOtpEmail, sendBookingEmail };