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
        subject: subject,
        text: text,
        to: to
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

const { sendBulkSms } = require('./send_sms');

class Notification {
    constructor(message, ...recipients) {
        this.recipients = recipients;
        this.message = message;
    };
    getRecipients() {
        return this.recipients
    };
};

class Sms extends Notification {
    constructor(message, ...recipients) {
        super(message, ...recipients);
    }
    async sendSms() {
        try {
            let response = await sendBulkSms(this.message, this.recipients);
            return { status: 'success', message: response };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    };
};

class Email extends Notification {
    constructor(subject, message, ...recipients) {
        super(message, ...recipients);
        this.subject = subject;
    };

    async sendEmail() {
        try {
            let response = await sendMail(this.subject, this.message, this.recipients);
            return { status: 'success', message: response };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    };
};


// const emailJohn = new Email('Hello John', 'Greetings John from test email notification object', 'mwanyikajohn@outlook.com', '5476benja@gmail.com');
// console.log(emailJohn)
// // console.log(emailJohn.sendEmail().then(data=>console.log(data)).catch(error=>console.log(error)));
// const textJohn = new Sms('Hello John from Notification object', '0707438654', '0773946048');
// // console.log(textJohn.sendSms().then(data=>console.log(data)).catch(error=>console.log(error)));


module.exports = {
    sendMail
}