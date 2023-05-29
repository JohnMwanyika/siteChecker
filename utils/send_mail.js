const nodemailer = require('nodemailer');
require('dotenv').config();

let host = process.env.MAIL_HOST //|| 'mail.govmail.ke';
let port = process.env.MAIL_PORT || 465;

async function sendMail(subject, text, ...to) {
    let transporter = nodemailer.createTransport({
        host,
        port,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.MAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Confirmed email sent to: ${to} from ${mailOptions.from}` + info.response);
        return info.response;
    } catch (error) {
        console.log('Error sending email: ' + error.message);
        throw error;
    }
}

// sendMail('ict test mail', 'testing mail functionality', 'mwanyikajohn@outlook.com', '5476benja@gmail.com')
//     .then(response => {
//         console.log('Email sent successfully:', response);
//     })
//     .catch(error => {
//         console.error('Error sending email:', error);
//     });
module.exports = {
    sendMail
}