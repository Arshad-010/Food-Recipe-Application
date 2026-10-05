const { sendEmail, sendOtpEmail, sendPasswordChangedEmail } = require('./emailService');

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendOtpEmail = sendOtpEmail;
module.exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
