const { checkWebsiteStatus, membersEmails } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Results } = require('../models/index.js');
const socket = require("../app");
const { Op } = require('sequelize');
const { sendMail } = require('./send_mail');
const { sendBulkSms } = require('./send_sms');

// This function is responsible for starting monitoring based on the interval specified
async function startIntervalCheck(siteId, userId) {
    let previousStatus = null; // Track the previous status of the site
    const monitoredSite = await Monitor.findOne({
        include: [
            { model: Website }
        ],
        where: {
            siteId: siteId
        }
    })
    // Start monitoring logic
    const monitoringInterval = setInterval(async () => {

        try {
            const clearedResults = await autoCleanUpResults(Results);
            console.log(clearedResults)
            // fetch again to check if there are new sites being monitored
            const monitoringSite = await Monitor.findOne({
                include: [
                    { model: Website }
                ],
                where: {
                    siteId: siteId
                }
            })

            // check if this site is still being monitored (is in the list of monitors)
            if (monitoringSite) {
                const websiteUrl = monitoringSite.Website.url;

                // CHECK WEBSITE STATUS FUNCTION #######################################################################
                const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 16000, userId); //userId is used by the memberEmails function only
                console.log(siteResult);
                if (siteResult.status === true) {

                    console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);
                    socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`);
                    // emitToUser('siteStatus', `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`, userId);

                    // if the site was down initially it should notify members that it is now back online
                    if (previousStatus == "Down" || previousStatus == "Timeout") {
                        console.log(`Hurray!! ${websiteUrl} is back online and operational.`);
                        // send notification to connected clients
                        socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is back online.`);
                        // send emails
                        const results = await membersEmails(websiteUrl, userId);
                        const [recipients, phoneNumbers] = results.data;
                        const mailResponse = await sendMail(`Site Availability Restored: ${websiteUrl}`, `Dear Team Member,\nWe are pleased to inform you that ${websiteUrl} is back online and fully operational.\nBest regards,\nWebWatch.`, recipients);
                        const smsResult = await sendBulkSms(`Dear Team Member,\nWe are pleased to inform you that ${websiteUrl} is back online and fully operational.\nBest regards,\nWebWatch.`, ...phoneNumbers);
                        console.log(smsResult);
                    }
                    // update preveous status with current status
                    previousStatus = "Up"
                    // set results to UP
                    const createdResult = createResult(monitoringSite.siteId, 'Up');

                    return {
                        status: 'success',
                        data: `${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`
                    }
                } else if (siteResult.status === 'timeout') {
                    // update previos status
                    previousStatus = "Timeout";

                    socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is taking longer than expected, request took more than ${siteResult.responseTime} seconds. Trying again in ${monitoringSite.interval} minutes.`);

                    console.log(`Mayday! ${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`);
                    // send emails
                    const results = await membersEmails(websiteUrl, userId);
                    const [recipients, phoneNumbers] = results.data;
                    const mailResponse = await sendMail(`Site Response Delay Alert: ${websiteUrl}`, `Dear Team Member,\n\nWe have detected a delay in the response time for ${websiteUrl}. Our monitoring system has detected this issue, and we will recheck the status in ${monitoringSite.interval} minutes.\nRest assured, we are actively monitoring the situation.\n\nBest regards,\nWebWatch.`, recipients);
                    const smsResult = await sendBulkSms(`Dear Team Member,\n\nWe have detected a delay in the response time for ${websiteUrl}. Our monitoring system has detected this issue, and we will recheck the status in ${monitoringSite.interval} minutes.\nRest assured, we are actively monitoring the situation.\n\nBest regards,\nWebWatch.`, ...phoneNumbers);
                    console.log(smsResult);
                    // set results to timeout
                    const createdResult = createResult(monitoringSite.siteId, 'Timeout');

                    return {
                        status: 'warning',
                        data: `${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`
                    }
                } else {
                    previousStatus = 'Down'; // set 

                    console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`);

                    socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is down`);

                    // send emails
                    const results = await membersEmails(websiteUrl, userId);
                    const [recipients, phoneNumbers] = results.data;
                    const mailResponse = await sendMail(`Urgent: Downtime Alert for ${websiteUrl}`, `Dear Team Member,\n\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minute.\n\nBest regards,\nWebWatch.`, recipients);
                    const smsResult = await sendBulkSms(`Dear Team Member,\n\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minute.\n\nBest regards,\nWebWatch.`, ...phoneNumbers);
                    console.log(smsResult);
                    // set results to Down
                    const createdResult = createResult(monitoringSite.siteId, 'Down');

                    return {
                        status: 'error',
                        data: `${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`
                    }
                }
                // CHECK WEBSITE STATUS FUNCTION #######################################################################

            } else {
                // if the site is removed from mnitoring state clear its interval
                console.log(`******** Site has stoped monitoring`);
                clearInterval(monitoringInterval);
                // clear previos status
                previousStatus = null;

                return {
                    status: 'warning',
                    data: `Site has stopped monitoring`
                }
            }

        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                data: error.message, // Return default error
            };
        }
    }, monitoredSite.interval * 60 * 1000); //multiply the minutes passed by seconds and again by miliseconds

    console.log(`############## Monitoring has been started for ${monitoredSite.Website.url} ##############`);
    return {
        status: 'success',
        data: `Monitoring started for ${monitoredSite.Website.url} cheking after every ${monitoredSite.interval} minute(s)`,
    }
}

// Function to create Website status Results
async function createResult(siteId, type) {
    try {
        const newResult = await Results.create({
            siteId,
            type: type
        });
        console.log('Result created is ', newResult.type)
        return {
            status: 'success',
            data: `New result has been recorded as - ${newResult.type}`
        }
    } catch (error) {
        return {
            status: 'error',
            data: `An error occured while creating new result - ${error.message}`
        }
    }
}

// function to auto delete  up results 
async function autoCleanUpResults(model) {
    // Schedule the task
    // setInterval(async () => {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime - 5 * 60 * 1000); // 5 minutes in milliseconds

    try {
        await model.destroy({
            where: {
                createdAt: {
                    [Op.lt]: fiveMinutesAgo,
                },
                type: 'Up'
            },
        });
        return {
            status: 'success',
            data: 'Destroyed old records successfully.',
        }
    } catch (error) {
        console.error('Error destroying old records:', error);
        return {
            status: 'error',
            data: `An error occured while destroying old records. ${error.message}`,
        }
    }
    // }, 60 * 60 * 1000); // Run every hour
}
// const createdResult = createResult(monitoringSite.siteId,'Up');
// scheduleSiteCheck()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));




module.exports = { startIntervalCheck };