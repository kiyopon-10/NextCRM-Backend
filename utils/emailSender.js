const nodemailer = require('nodemailer');
const { google } = require('googleapis');

require('dotenv').config();

const createGmailTransport = async (user) => {
  // const oAuth2Client = new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID,
  //   process.env.GOOGLE_CLIENT_SECRET,
  //   'http://localhost:5000/auth/google/callback'
  // );

  // if (!user.refreshToken) {
  //   throw new Error('No refresh token found');
  // }

  // oAuth2Client.setCredentials({
  //   access_token: user.accessToken,
  //   refresh_token: user.refreshToken,
  // });

  // try {
  //   const accessToken = await oAuth2Client.getAccessToken();
  //   oAuth2Client.setCredentials({
  //     access_token: accessToken.token,
  //     refresh_token: user.refreshToken,
  //   });
  // } catch (error) {
  //   console.error("Error refreshing access token:", error);
  //   // Handle error (e.g., prompt user to re-authenticate)
  //   return null;
  // }

  const gmailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.email,
      pass: process.env.APP_PASSWORD
    },
  });

  return gmailTransport;
};

const sendEmail = async (user, recipientEmail, subject, message) => {


  try {
    const gmailTransport = await createGmailTransport(user);
    const mailOptions = {
      from: user.email,
      to: recipientEmail,
      subject,
      text: message,
    };

    await gmailTransport.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
