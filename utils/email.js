const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
})


const sendEmail = async (options) => {

  const mailOptions = {
    from: 'Najib bala najib@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  await transporter.sendMail(mailOptions)

}


module.exports = sendEmail
