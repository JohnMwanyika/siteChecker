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

async function checkWebsiteStatus(url, timeout = 5000) {
    try {
      const startTime = new Date().getTime(); // Track start time
      const response = await axios.get(url, { timeout });
      const endTime = new Date().getTime(); // Track end time
  
      const responseTime = (endTime - startTime)/1000; // Calculate response time in seconds
  
      if (response.status >= 200 && response.status < 400) {
        return { status: true, responseTime }; // Website is up
      } else {
        return { status: false, responseTime }; // Website is down
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return { status: true, responseTime: timeout }; // Website is up (timed out)
      } else {
        return { status: false, responseTime: null }; // Website is down (request error)
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