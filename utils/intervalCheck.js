const axios = require('axios');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');
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

async function membersEmails(url) {
    try {
        // get the site iD of the website being monitored
        const website = await Website.findOne({ where: { url: url } });
        if (!website) { //if not found
            return { status: 'warning', data: `${url} is not not found` }
        }
        // get the ongoing monitor for the site
        const monitor = await Monitor.findOne({
            include: [
                {
                    model: Team, include: [
                        { model: User, attributes: ['email', 'firstName'] }
                    ]
                }
            ],
            where: { siteId: website.id }
        });
        // console.log(monitor)
        if (!monitor) { //if no return the following message
            return { status: 'warning', data: `${url} is not being monitored` }
        }

        const users = monitor.Team.Users;
        // console.log(users)
        const emails = [];
        for (let user of users) {
            emails.push(user.email);
        }
        // console.log('Team notified from function', emails)
        // return `Team notified from function ${emails}`
        return emails;

    } catch (error) {
        console.log(error);
        return { status: 'error', data: 'Oops!! Unkown error occured try again' }
    }

}

async function checkWebsiteStatus(url, timeout = 10000) {
    try {
        const startTime = new Date().getTime(); // Track start time
        const response = await axios.get(url, { timeout });
        const endTime = new Date().getTime(); // Track end time

        const responseTime = (endTime - startTime) / 1000; // Calculate response time in seconds

        if (response.status >= 200 && response.status < 400) {
            return { status: true, responseTime }; // Website is up
        } else {
            membersEmails(url)
                .then((emails) => {
                    if (emails.length < 1) {
                        return { status: 'warning', data: 'No team members to notify' }
                    }
                    sendMail(`${url} is down`, 'The above mentioned service is down', emails)
                        .then(data => console.log(data))
                        .catch(err => console.log(err))
                })
                .then(data => console.log(data))
                .catch(err => console.log(err))
            return { status: false, responseTime }; // Website is down
        }
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            return { status: 'timeout', responseTime: timeout }; // Website is up (timed out)
        } else {
            membersEmails(url)
                .then((emails) => {
                    if (emails.length < 1) {
                        return { status: 'warning', data: 'No team members to notify' }
                    }
                    sendMail(`${url} is down`, 'The above mentioned service is down', emails)
                        .then(delivery => {
                            const sendStatus = !delivery ? 'Email not sent' : 'Email sent successfully';
                            console.log(sendStatus);
                        })
                        .catch(error => {
                            console.error('Error sending email:', error);
                        });
                })
                .then(data => console.log(data))
                .catch(err => console.log(err))
            return { status: false, responseTime: 'An error occured trying again...' }; // Website is down (request error)
        }
    }
}

module.exports = {
    checkWebsiteStatus
}


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