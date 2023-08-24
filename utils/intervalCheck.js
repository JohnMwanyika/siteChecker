const axios = require('axios');
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

const websiteUrl = 'https://mailrecovery.onrender.com'; // Replace with the website URL you want to monitor
const checkInterval = 5 * 60 * 1000; // Check every 5 minutes


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
                        // { model: User, attributes: ['email', 'firstName'] },
                    ]
                }
            ],
            where: { siteId: website.id }
        });
        if (!monitor) {
            return { status: 'warning', data: `${url} is not being monitored` }
        }
        // Collect all the member's mails
        const members = monitor.Team.Members;
        const emails = [];
        const phoneNumbers = [];
        for (let member of members) {
            emails.push(member.email);
            phoneNumbers.push(`0${member.phone}`); //add zero to the phone number to make it complete
        }
        // Return the list of all emails to receive notifications
        console.log('##########RECIPIENTS Emails INCLUDE', emails);
        console.log('##########RECIPIENTS phone numbers INCLUDE', phoneNumbers);

        return [emails, phoneNumbers];

    } catch (error) {
        console.log(error);
        return { status: 'error', data: 'Oops! Unkown error occured while fetching recipients please try again' }
    }

}

async function checkWebsiteStatus(url, timeout = 15000, userId) { //TImeout has been set to 15 seconds
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
        if (error.code === 'ECONNABORTED') {
            return { status: 'timeout', responseTime: timeout }; // Website is up but took longer to respond
        } else {
            return { status: false, responseTime: 'An error occured while checking site status please trying again...', }; // Website is down (request error)
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