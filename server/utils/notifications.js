const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send email verification
const sendEmailVerification = async (email, token) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@earningwebsite.com',
      to: email,
      subject: 'Verify Your Email - Earning Website',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Earning Website!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email verification sent to:', email);
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

// Send SMS verification
const sendSMSVerification = async (phoneNumber, code) => {
  try {
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${code}. Valid for 10 minutes. - Earning Website`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS verification sent to:', phoneNumber, 'Message SID:', message.sid);
  } catch (error) {
    console.error('SMS verification error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@earningwebsite.com',
      to: user.email,
      subject: 'Welcome to Earning Website!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${user.firstName}!</h2>
          <p>Thank you for joining Earning Website. Here's what you can do to start earning:</p>
          <ul>
            <li>Complete surveys and earn points</li>
            <li>Install apps and get rewarded</li>
            <li>Watch videos for points</li>
            <li>Refer friends and earn 10% of their earnings</li>
          </ul>
          <p>Your referral code: <strong>${user.referralCode}</strong></p>
          <p>Share this code with friends to earn bonus points!</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Earning</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

// Send payout notification
const sendPayoutNotification = async (user, payout) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@earningwebsite.com',
      to: user.email,
      subject: 'Payout Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payout Status Update</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your payout request has been <strong>${payout.status}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Amount:</strong> ${payout.amount.points} points (${payout.amount.usdValue} USD)</p>
            <p><strong>Payment Method:</strong> ${payout.paymentMethod.type.toUpperCase()}</p>
            <p><strong>Account:</strong> ${payout.paymentMethod.accountId}</p>
          </div>
          ${payout.status === 'completed' ? '<p>Your payment has been processed successfully!</p>' : ''}
          ${payout.status === 'rejected' ? `<p>Reason: ${payout.rejectionReason}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/payouts" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Payouts</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Payout notification sent to:', user.email);
  } catch (error) {
    console.error('Payout notification error:', error);
  }
};

// Send daily bonus reminder
const sendDailyBonusReminder = async (user) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@earningwebsite.com',
      to: user.email,
      subject: 'Claim Your Daily Bonus!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Daily Bonus Available!</h2>
          <p>Hello ${user.firstName},</p>
          <p>Don't forget to claim your daily bonus today!</p>
          <p>Current streak: <strong>${user.dailyBonusStreak} days</strong></p>
          <p>Login now to keep your streak alive and earn bonus points!</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Claim Bonus</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Daily bonus reminder sent to:', user.email);
  } catch (error) {
    console.error('Daily bonus reminder error:', error);
  }
};

// Send referral notification
const sendReferralNotification = async (referrer, newUser) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@earningwebsite.com',
      to: referrer.email,
      subject: 'New Referral!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Referral!</h2>
          <p>Hello ${referrer.firstName},</p>
          <p>Congratulations! ${newUser.firstName} ${newUser.lastName} has joined using your referral code.</p>
          <p>You'll earn 10% of their lifetime earnings!</p>
          <a href="${process.env.CLIENT_URL}/referrals" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Referrals</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Referral notification sent to:', referrer.email);
  } catch (error) {
    console.error('Referral notification error:', error);
  }
};

module.exports = {
  sendEmailVerification,
  sendSMSVerification,
  sendWelcomeEmail,
  sendPayoutNotification,
  sendDailyBonusReminder,
  sendReferralNotification
};
