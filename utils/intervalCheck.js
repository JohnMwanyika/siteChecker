const axios = require('axios');
const { Op } = require('sequelize');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Member } = require('../models/index.js');
const { sendMail } = require('./send_mail.js');
// const {
//     sendMail
// } = require('../utils/send_mail');


// const mails = ['mwanyikajohn@outlook.com', '5476benja@outlook.com'];

// sendMail('Application letter', 'Applying for the above mentioned post', mails)
//     .then(() => {
//         console.log('Sent mail')
//     })
//     .catch((err) => {
//         console.log('Error sending Mail');
//     });

// Function to check the website status
// async function checkWebsiteStatus(url) {
//     try {

//         const response = await axios.get(url);
//         if (response.status >= 200 && response.status < 400) {
//             return true; // Website is up
//         } else {
//             return false; // Website is down
//         }
//     } catch (error) {
//         return false; // Website is down (request error)
//     };
// };
membersEmails('https://gebeya.com', 1)
    .then(data => console.log(data))
    .catch(error => console.log(error))

async function membersEmails(url, userId) {
    try {
        // obtain the site iD of the website being monitored by passing the url as a parameter
        const website = await Website.findOne({ where: { url: url, createdBy: userId } }); //fetch only the site for the  current user
        if (!website) {
            return { status: 'warning', data: `${url} is not not found` }
        }
        // get the ongoing monitor for the site by the id obtained above
        const monitor = await Monitor.findOne({
            include: [
                {
                    model: Team, include: [
                        { model: Member, attributes: ['email', 'firstName', 'phone'] },
                    ],
                }
            ],
            where: { siteId: website.id }
        });
        if (!monitor) {
            return { status: 'warning', data: `${url} is not being monitored` }
        }

        const emails = [];
        const phoneNumbers = [];
        // if no notification service selected
        if (monitor.Team.email == '0' && monitor.Team.sms == '0') {
            return { status: 'warning', data: [emails, phoneNumbers], msg: `A new activity for ${url}; no action taken due to missing default notification service.` }
        }
        // if only email selected
        if (monitor.Team.email == '1' && monitor.Team.sms == '0') {
            const members = monitor.Team.Members;
            for (let member of members) {
                emails.push(member.email);
            }
            return { status: 'success', data: [emails, phoneNumbers], msg: 'Sending emails to all members' }
        }
        // if only sms selected
        if (monitor.Team.email == '0' && monitor.Team.sms == '1') {
            const members = monitor.Team.Members;
            for (let member of members) {
                phoneNumbers.push(`0${member.phone}`);
            }
            return { status: 'success', data: [emails, phoneNumbers], msg: 'Sending SMS to all members' }
        }
        // if all options are true
        if (monitor.Team.email == '1' && monitor.Team.sms == '1') {
            const members = monitor.Team.Members;
            for (let member of members) {
                emails.push(member.email);
                phoneNumbers.push(`0${member.phone}`); //add zero to the phone number to make it complete
            }
            console.log('##########RECIPIENTS Emails INCLUDE', emails);
            console.log('##########RECIPIENTS phone numbers INCLUDE', phoneNumbers);
            return { status: 'success', data: [emails, phoneNumbers], msg: 'Sending both email and sms to all members in the team' }
        }

    } catch (error) {
        console.log(error);
        return { status: 'error', data: [], msg: `Oops! Unkown error occured while fetching recipients please try again -${error.message}` }
    }

}

async function checkWebsiteStatus(url, timeout = 40000, userId) { //TImeout has been set 40 seconds
    try {
        const startTime = new Date().getTime(); // Track start time
        const response = await axios.get(url, { timeout });
        const endTime = new Date().getTime(); // Track end time

        const responseTime = (endTime - startTime) / 1000; // Calculate response time in seconds

        if (response.status >= 200 && response.status < 400) {
            return { status: true, responseTime }; // Website is up
        } else {
            return { status: false, responseTime, }; // Website is down
        }
    } catch (error) {
        // console.log(error)
        if (error.code === 'ECONNABORTED') {
            return { status: 'timeout', responseTime: timeout }; // Website is up but took longer to respond
        } else {
            return { status: false, responseTime: `An error occured while checking site status please trying again -${error.message}`, }; // Website is down (request error)
        }
    }
}

module.exports = {
    checkWebsiteStatus,
    membersEmails
};


// Start periodic website status checks
// setInterval(() => {
//     checkWebsiteStatus(websiteUrl)
//         .then((isUp) => {
//             if (!isUp) {
//                 sendEmailNotification();
//             }
//         })
//         .catch((error) => {
//             console.error('Error checking website status:', error);
//         });
// }, checkInterval);

// console.log(`Website monitoring started. Checking ${websiteUrl} every ${checkInterval / 1000} seconds.`);