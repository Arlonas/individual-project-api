const nodemailer = require("nodemailer")

const transport = nodemailer.createTransport({
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    },
    host: "smtp.gmail.com"
})

const mailer = async ({
    subject,
    to,
    text,
    html
}) => {
    await transport.sendMail({
        subject: subject || "Test subject",
        to: to || "alfredohemapala1@gmail.com",
        text: text || "test nodemailer",
        html: html || "<h1>GOBLOK</h1>"
    })
}

module.exports = mailer