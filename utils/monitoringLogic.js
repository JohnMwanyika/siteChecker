const { checkWebsiteStatus, membersEmails } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Results } = require('../models/index.js');
const socket = require("../app");
const { Op } = require('sequelize');
const { sendMail } = require('./send_mail');
const { sendBulkSms } = require('./send_sms');

// This function is responsible for starting monitoring based on the interval specified
async function startIntervalCheck2(siteId, userId) {
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
            console.log(clearedResults);
            // fetch again to check if there are new sites being monitored
            const monitoringSite = await Monitor.findOne({
                include: [
                    { model: Website }
                ],
                where: {
                    siteId: siteId
                }
            });

            // check if this site is still being monitored (is in the list of monitors)
            if (monitoringSite) {
                const websiteUrl = monitoringSite.Website.url;

                // CHECK WEBSITE STATUS FUNCTION #######################################################################
                const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 40000, userId); //userId is used by the memberEmails function only
                console.log(siteResult);
                if (siteResult.status === true) {

                    console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);
                    socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`);

                    // function to update Monitoring status after requesting
                    const updateStatus = await updateSiteStatus(monitoredSite.id, 1);
                    console.log(updateStatus);
                    // emitToUser('siteStatus', `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`, userId);

                    // if the site was down initially it should notify members that it is now back online
                    if (previousStatus == "Down") {
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
                    // if the site was down initially it should notify members that it is now back online
                    if (previousStatus == "Timeout") {
                        console.log(`Hurray!! ${websiteUrl} has no delays and operational.`);
                        // send notification to connected clients
                        socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is operational.`);
                        // send emails and sms
                        const results = await membersEmails(websiteUrl, userId);
                        const [recipients, phoneNumbers] = results.data;
                        const mailResponse = await sendMail(`Site Availability Restored: ${websiteUrl}`, `Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, recipients);
                        const smsResult = await sendBulkSms(`Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, ...phoneNumbers);
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

                    // function to update Monitoring status after requesting
                    const updateStatus = await updateSiteStatus(monitoredSite.id, 2)
                    console.log(updateStatus);

                    // send emails
                    const results = await membersEmails(websiteUrl, userId);
                    const [recipients, phoneNumbers] = results.data;
                    const mailResponse = await sendMail(`Urgent: Downtime Alert for ${websiteUrl}`, `Dear Team Member,\n\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minutes.\n\nBest regards,\nWebWatch.`, recipients);
                    const smsResult = await sendBulkSms(`Dear Team Member,\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minutes.\nBest regards,\nWebWatch.`, ...phoneNumbers);
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

// function to auto delete  up results that are past five minutes
async function autoCleanUpResults(model) {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime - 5 * 60 * 1000); // 5 minutes in milliseconds

    try {
        let results = await model.destroy({
            where: {
                createdAt: {
                    [Op.lt]: fiveMinutesAgo, //destroy where created less than 5 minutes ago
                },
                type: 'Up'
            },
        });
        console.log("Deletion of old records results" + results)
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
}
// const createdResult = createResult(monitoringSite.siteId,'Up');
// scheduleSiteCheck()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));

async function updateSiteStatus(monitorId, statusId) {
    try {
        await Monitor.update({ statusId }, { where: { id: monitorId } });

        return {
            status: 'success',
            data: '',
            msg: 'Monitor status updated successfully'
        }

    } catch (error) {
        console.log('An error occured while updating Monitor status');
        return {
            status: 'error',
            data: '',
            msg: 'An error occured while updating Monitor status' + error.message
        }
    }
}

async function getMonitoredSite(siteId) {
    try {
        const monitoredSite = await Monitor.findOne({
            where: { siteId },
            include: [
                { model: Website },
                { model: Monitor_Status }
            ],
        });
        return monitoredSite;
    } catch (error) {
        console.log("An error occured while fetching Monitored site")
        return {
            status: 'warning',
            data: 'An error occured while fething monitored site' + error.message,
        };
    }
}

// getMonitoredSite(1).then(data => console.log(data)).catch(error => console.log(error));

let previousStatus = null; // Track the previous status of the site
let siteResult = null;

async function startIntervalCheck(siteId, userId) {
    const monitoredSite = await getMonitoredSite(siteId);

    if (!monitoredSite) {
        return {
            status: 'warning',
            data: 'Site is not being monitored',
        };
    }

    const monitoringInterval = setInterval(async () => {
        try {
            const clearedResults = await autoCleanUpResults(Results);
            console.log(clearedResults);

            const monitoringSite = await getMonitoredSite(siteId);

            if (!monitoringSite) {
                clearInterval(monitoringInterval);
                return {
                    status: 'warning',
                    data: 'Site has stopped monitoring',
                };
            }

            const websiteUrl = monitoringSite.Website.url;
            siteResult = await checkWebsiteStatus(websiteUrl);
            // console.log("Monitoring##", monitoredSite.toJSON())

            if (siteResult.status === true) {
                await handleUpStatus(websiteUrl, userId, monitoringSite);
            } else if (siteResult.status == 'timeout') {
                await handleTimeoutStatus(websiteUrl, userId, monitoringSite);
            } else if (siteResult.status == false) {
                await handleDownStatus(websiteUrl, userId, monitoringSite);
            } else {
                console.log(siteResult)
            }
        } catch (error) {
            console.error(error);
        }
    }, monitoredSite.interval * 60 * 1000);

    console.log(`############## Monitoring has been started for ${monitoredSite.Website.url} ##############`);
    return {
        status: 'success',
        data: `Monitoring started for ${monitoredSite.Website.url} checking every ${monitoredSite.interval} minute(s)`,
    };
}

async function handleUpStatus(websiteUrl, userId, monitoringSite) {
    try {
        if (previousStatus == "Down" && monitoringSite.Monitor_Status.name == 'Offline') {
            previousStatus = "Up";
            const updatedStatus = await updateSiteStatus(monitoringSite.id, 1);
            console.log(updatedStatus);
            await createResult(monitoringSite.siteId, 'Up');
            // send emails and sms
            const results = await membersEmails(websiteUrl, userId);
            const [recipients, phoneNumbers] = results.data;
            const mailResponse = await sendMail(`Site Availability Restored: ${websiteUrl}`, `Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, recipients);
            const smsResult = await sendBulkSms(`Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, ...phoneNumbers);
            console.log(smsResult);

            console.log(`Hurray!! ${websiteUrl} is back online and operational.`);
            socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is back online.`);
            return;
        }
        if (previousStatus == "Timeout" && monitoringSite.Monitor_Status.name == 'Timeout') {
            previousStatus = "Up";
            const updatedStatus = await updateSiteStatus(monitoringSite.id, 1);
            console.log(updatedStatus);
            await createResult(monitoringSite.siteId, 'Up');
            // send emails and sms
            const results = await membersEmails(websiteUrl, userId);
            const [recipients, phoneNumbers] = results.data;
            const mailResponse = await sendMail(`Site Availability Restored: ${websiteUrl}`, `Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, recipients);
            const smsResult = await sendBulkSms(`Dear Team Member,\nWe are pleased to inform you that the response time for ${websiteUrl} is within the expected range and everything appears to be functioning smoothly.\nBest regards,\nWebWatch.`, ...phoneNumbers);
            console.log(smsResult);

            console.log(`Hurray!! ${websiteUrl} has no delays and operational.`);
            socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is now responding.`);
            return;
        }

        previousStatus = "Up";

        console.log(`Hurray!! ${websiteUrl} is up and operational.`);
        socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`);
        const updatedStatus = await updateSiteStatus(monitoringSite.id, 1);
        console.log(updatedStatus);

        await createResult(monitoringSite.siteId, 'Up');

    } catch (error) {
        console.log("Error while handling Up status", error)
        return { status: 'error', data: error.message };
    }
}

async function handleTimeoutStatus(websiteUrl, userId, monitoringSite) {
    try {
        previousStatus = "Timeout";

        console.log(`Mayday! ${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`);
        socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is taking longer than expected, request took more than ${siteResult.responseTime} seconds. Trying again in ${monitoringSite.interval} minutes.`);
        const updatedStatus = await updateSiteStatus(monitoringSite.id, 3);
        console.log(updatedStatus);

        // send emails
        const results = await membersEmails(websiteUrl, userId);
        const [recipients, phoneNumbers] = results.data;
        const mailResponse = await sendMail(`Site Response Delay Alert: ${websiteUrl}`, `Dear Team Member,\n\nWe have detected a delay in the response time for ${websiteUrl}. Our monitoring system has detected this issue, and we will recheck the status in ${monitoringSite.interval} minutes.\nRest assured, we are actively monitoring the situation.\n\nBest regards,\nWebWatch.`, recipients);
        const smsResult = await sendBulkSms(`Dear Team Member,\nWe have detected a delay in the response time for ${websiteUrl}. Our monitoring system has detected this issue, and we will recheck the status in ${monitoringSite.interval} minutes.\nBest regards,\nWebWatch.`, ...phoneNumbers);
        console.log(smsResult);

        await createResult(monitoringSite.siteId, 'Timeout');
    } catch (error) {
        console.log("Error while handling Timeout status", error)
        return { status: 'error', data: error.message };
    }
}

async function handleDownStatus(websiteUrl, userId, monitoringSite) {
    try {
        previousStatus = "Down";

        console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`);
        socket.ioObject.emit('siteStatus_' + userId, `${monitoringSite.Website.name} is down`);
        const updatedStatus = await updateSiteStatus(monitoringSite.id, 2);
        console.log(updatedStatus);

        // send emails
        const results = await membersEmails(websiteUrl, userId);
        const [recipients, phoneNumbers] = results.data;
        const mailResponse = await sendMail(`Urgent: Downtime Alert for ${websiteUrl}`, `Dear Team Member,\n\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minutes.\n\nBest regards,\nWebWatch.`, recipients);
        const smsResult = await sendBulkSms(`Dear Team Member,\nKindly be informed that there is an issue with ${websiteUrl} as it is currently experiencing downtime or is unreachable. We will conduct another assessment in ${monitoringSite.interval} minutes.\nBest regards,\nWebWatch.`, ...phoneNumbers);
        console.log(smsResult);

        await createResult(monitoringSite.siteId, 'Down');
    } catch (error) {
        console.log("Error while handling Down status", error)
        return { status: 'error', data: "Error while handling Down status " + error.message };
    }
}

async function sendNotifications(subject, message, results) {
    const [recipients, phoneNumbers] = results.data;
    const mailResponse = await sendMail(subject, message, recipients);
    const smsResult = await sendBulkSms(message, ...phoneNumbers);
    console.log(smsResult);
}

// startIntervalCheck(1, 1).then(data => console.log(data));
module.exports = { startIntervalCheck, updateSiteStatus };