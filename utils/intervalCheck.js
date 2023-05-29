const axios = require('axios');
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
async function checkWebsiteStatus(url) {
    try {
        const response = await axios.get(url);
        if (response.status >= 200 && response.status < 400) {
            return true; // Website is up
        } else {
            return false; // Website is down
        }
    } catch (error) {
        return false; // Website is down (request error)
    };
};

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