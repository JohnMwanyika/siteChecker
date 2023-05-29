const http = require('http');
const https = require('https');

function checkWebsiteStatus(url) {
    // Determine the appropriate module based on the URL protocol
    const module = url.startsWith('https://') ? https : http;

    return new Promise((resolve, reject) => {
        const request = module.get(url, (response) => {
            // Check the response status code
            if (response.statusCode >= 200 && response.statusCode < 400) {
                resolve(true); // Website is up
            } else {
                resolve(false); // Website is down
            }
        });

        // Handle request errors
        request.on('error', (error) => {
            reject(error);
        });
    });
}

// Usage example
const websiteUrl = 'http://localhost:3000';

checkWebsiteStatus(websiteUrl)
    .then((isUp) => {
        if (isUp) {
            console.log(`${websiteUrl} is up`);
        } else {
            console.log(`${websiteUrl} is down`);
        }
    })
    .catch((error) => {
        console.error('Error checking website status:', error);
    });