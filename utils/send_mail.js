const nodemailer = require('nodemailer');
require('dotenv').config();

let host = process.env.MAIL_HOST || 'smtp-mail.outlook.com';
let port = process.env.MAIL_PORT || 587; //465 //587

async function sendMail(subject, text, ...to) {
    let transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.MAIL_USER,
        to: to,
        subject: false,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Confirmed email sent to: ${to} from ${mailOptions.from}` + info.response);
        // return info.response;
    } catch (error) {
        // if(error.code == 'ESOCKET'){
        //     console.log(`Error sending email to ${to} because of network failure`);
        // }
        console.log(`Unable to send your email to ${to} because ` + error.message);
        // throw error;
    }
}

// sendMail('ict test mail', 'testing mail functionality', 'mwanyikajohn@outlook.com', '5476benja@gmail.com')
//     .then(delivery => {
//         const sendStatus = !delivery ? 'Email not sent' : 'Email sent successfully';
//         console.log(sendStatus);
//     })
//     .catch(error => {
//         console.error('Error sending email:', error);
//     });
module.exports = {
    sendMail
}