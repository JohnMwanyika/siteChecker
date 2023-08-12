const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');
const socket = require("../app");

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
async function startIntervalCheck(siteId) {
    const monitoringSite = await Monitor.findOne({
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
                const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 10000);
                console.log(siteResult);
                if (siteResult.status === true) {
                    console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);

                    socket.ioObject.emit('siteStatus',`${monitoringSite.Website.name} is up`);
                    return {
                        status: 'success',
                        data: `${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`
                    }
                    // Create a success outcome to the result table
                    // res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                } else if (siteResult.status === 'timeout') {
                    console.log(`Mayday! ${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`);
                    return {
                        status: 'warning',
                        data: `${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`
                    }
                } else {
                    console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`);
                    socket.ioObject.emit('siteStatus',`${monitoringSite.Website.name} is down`);
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
                // console.log(`********${createdMonitor.Website.url}****** has stoped monitoring`)
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
    }, monitoringSite.interval * 10 * 1000); //multiply the seconds passed by seconds and again by miliseconds

    console.log(`############## Monitoring has been started for ${monitoringSite.Website.url} ##############`);
    return {
        status: 'success',
        data: `Monitoring started for ${monitoringSite.Website.url} cheking after every ${monitoringSite.interval} minute(s)`,
    }
}

// scheduleSiteCheck()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));


module.exports = { startMonitoringLogic, startIntervalCheck };