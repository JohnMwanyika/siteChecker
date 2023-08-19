const { checkWebsiteStatus, membersEmails } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Results } = require('../models/index.js');
const socket = require("../app");
const { Op } = require('sequelize');
const { sendMail } = require('./send_mail');
async function startMonitoringLogic(siteId, teamId, interval, userId) {
    try {
        // getting website details
        const website = await Website.findByPk(siteId);
        if (!website) {
            return {
                status: 'error',
                data: 'Website not found',
            }
        }

        // find team details
        const selectedTeam = await Team.findOne({ include: [{ model: User }], where: { id: teamId } });
        console.log('selected team and users #########', selectedTeam);

        // finddefault team and respective users
        const defaultTeam = await Team.findOne({ include: [{ model: User }], where: { name: 'Default' } });
        console.log('Default team and users #########', defaultTeam);

        // if there is no default team or selected team throw an error
        if (!defaultTeam || !selectedTeam) {
            return {
                status: 'error', data: 'Default team is not set or Invalid team selected'
            }
        }
        // check if team has members to notify before starting monitoring
        if (defaultTeam.Users.length < 1) {
            return { status: 'error', data: 'Add members to the selected team before starting a monitor!' }
        }
        // if (selectedTeam.Users.length < 1) {
        //     return { status: 'error', data: 'Add members to the selected team before starting a monitor!' }
        // }

        // Check if there is an ongoing monitor for this website
        const monitor = await Monitor.findOne({ where: { siteId }, include: [{ model: Website }] });
        if (monitor) {
            return {
                status: 'warning',
                data: `Monitoring for ${monitor.Website.url} website is already in progress.`, //***************************888 */
            };
        }
        // else Create a new monitor for the website
        const createdMonitor = await Monitor.create({
            siteId,
            teamId: teamId || defaultTeam.id,
            interval,
            statusId: 2,
            createdBy: userId,
        });

        // change website status to monitoring
        const updatedWebsite = website.setSiteStatus(2);


        // Start monitoring logic
        const monitoringInterval = setInterval(async () => {

            try {
                // getting the site details to aquire url
                const monitoringSite = await Monitor.findOne({
                    include: [
                        { model: Website }
                    ],
                    where: {
                        siteId: createdMonitor.siteId
                    }
                })

                // check if this site is still being monitored
                if (monitoringSite) {
                    const monitorUrl = monitoringSite.Website.url
                    const websiteUrl = `https://${monitorUrl}`;

                    // CHECK WEBSITE STATUS FUNCTION#######################################################################
                    const isUp = await checkWebsiteStatus(websiteUrl);
                    if (isUp) {
                        console.log(`Hurray!! ${websiteUrl} is up and operational.`);
                        // Create a success outcome to the result table
                        // res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                    } else {
                        console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed.`);
                        // res.json({ status: 'error', data: `${websiteUrl} is down and unreachable.` });
                    }
                    // CHECK WEBSITE STATUS FUNCTION#######################################################################

                } else {
                    // const stoppedMonitor = website.url
                    console.log(`********${website.url}****** has stoped monitoring`)
                    clearInterval(monitoringInterval);
                    // console.log(`********${createdMonitor.Website.url}****** has stoped monitoring`)
                    return {
                        status: 'warning',
                        data: `${website.url} has stopped monitoring`
                    }
                }

            } catch (error) {
                console.log(error);
                // return res.json({
                //     status: 'error',
                //     data: error.message, // Return default error
                // });
            }
        }, createdMonitor.interval * 10 * 1000); //multiply the seconds passed by seconds and again by miliseconds

        console.log(`############## Monitoring has been started for ${website.url} ##############`);
        return {
            status: 'success',
            data: `Monitoring started for ${website.url} cheking after every ${createdMonitor.interval} minute(s)`,
        }
    } catch (error) {
        console.log(error)
        return {
            status: 'error',
            data: error.message, // Return default error
        }
    }

}

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

            // check if this site is still being monitored
            if (monitoringSite) {
                const websiteUrl = monitoringSite.Website.url;

                // CHECK WEBSITE STATUS FUNCTION #######################################################################
                const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 10000, userId); //userId is used by the memberEmails function only
                console.log(siteResult);
                if (siteResult.status === true) {

                    console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);
                    socket.ioObject.emit('siteStatus', `${monitoringSite.Website.name} is up took ${siteResult.responseTime} seconds.`);

                    // if the site was down initially it should notify members that it is now back online
                    if (previousStatus == "Down" || previousStatus == "Timeout") {
                        console.log(`Hurray!! ${websiteUrl} is back online and operational.`);
                        // send emails
                        const recipients = await membersEmails(websiteUrl, userId);
                        const mailResponse = await sendMail(`Hurray!! ${websiteUrl} is back online and operational.`, recipients);
                        console.log('This is the email response', mailResponse)
                        // send notification to connected clients
                        socket.ioObject.emit('siteStatus', `${monitoringSite.Website.name} is back online.`);
                    }
                    // update preveous status with current status
                    previousStatus = "Up"
                    // set results to UP
                    const createdResult = createResult(monitoringSite.siteId, 'Up');

                    return {
                        status: 'success',
                        data: `${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`
                    }
                    // Create a success outcome to the result table
                    // res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                } else if (siteResult.status === 'timeout') {
                    socket.ioObject.emit('siteStatus', `${monitoringSite.Website.name} is taking longer than expected, request took more than ${siteResult.responseTime} seconds. Trying again in ${monitoringSite.interval} minutes.`);

                    console.log(`Mayday! ${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`);
                    // set results to timeout
                    const createdResult = createResult(monitoringSite.siteId, 'Timeout');
                    // update previos status
                    previousStatus = "Timeout";

                    return {
                        status: 'warning',
                        data: `${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`
                    }
                } else {
                    previousStatus = 'Down'; // set 

                    console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`);
                    socket.ioObject.emit('siteStatus', `${monitoringSite.Website.name} is down`);

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
    }, monitoredSite.interval * 10 * 1000); //multiply the seconds passed by seconds and again by miliseconds

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