const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');

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


async function startIntervalCheck(siteId, teamId) {
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
            // getting the site details to aquire url
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
                const monitorUrl = monitoringSite.Website.url
                // const websiteUrl = `https://${monitorUrl}`;
                const websiteUrl = `${monitorUrl}`;

                // CHECK WEBSITE STATUS FUNCTION #######################################################################
                const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 10000);
                console.log(siteResult)
                if (siteResult.status === true) {
                    console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);
                    // Create a success outcome to the result table
                    // res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                } else if (siteResult.status === 'timeout') {
                    console.log(`Mayday! ${websiteUrl} is taking too long to respond trying again in ${monitoringSite.interval} minutes.`);
                } else {
                    console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed trying again in ${monitoringSite.interval} minutes.`);
                    // res.json({ status: 'error', data: `${websiteUrl} is down and unreachable.` });
                }
                // CHECK WEBSITE STATUS FUNCTION #######################################################################

            } else {
                // const stoppedMonitor = website.url
                console.log(`******** Site has stoped monitoring`)
                clearInterval(monitoringInterval);
                // console.log(`********${createdMonitor.Website.url}****** has stoped monitoring`)
                return {
                    status: 'warning',
                    data: `SIe has stopped monitoring`
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

var interval;
async function scheduleSiteCheck(siteIdw, teamId) {
    try {

        const monitoringInterval = setInterval(async () => {

            const activeMonitors = await Monitor.findAll();
            if (activeMonitors.length < 1) {
                console.log('There are no services being monitored at the moment')
                return {
                    status: 'warning',
                    data: 'There are no services being monitored at the moment'
                }
            }
            console.log(activeMonitors)
            // Start monitoring for each active monitor
            activeMonitors.forEach(async (monitor) => {
                // console.log(monitor)
                const { siteId } = monitor;

                try {
                    // getting the site details to aquire url
                    const monitoringSite = await Monitor.findOne({
                        include: [
                            { model: Website }
                        ],
                        where: {
                            siteId: siteId
                        }
                    })
                    interval = monitoringSite.interval;
                    // check if this site is still being monitored
                    if (monitoringSite) {
                        const monitorUrl = monitoringSite.Website.url
                        const websiteUrl = `https://${monitorUrl}`;

                        console.log('Current monitoring site interval is ', interval)

                        // CHECK WEBSITE STATUS FUNCTION#######################################################################
                        const siteResult = await checkWebsiteStatus(websiteUrl, timeout = 10000);

                        // console.log(siteResult)
                        if (siteResult.status === true) {
                            console.log(`Hurray!! ${websiteUrl} is up and operational took ${siteResult.responseTime} seconds.`);
                            // Create a success outcome to the result table
                            // res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                        } else if (siteResult.status === 'timeout') {
                            console.log(`Mayday! ${websiteUrl} seems to be up but its taking too long to respond try again, took over 10 seconds.`);
                        } else {
                            console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed.`);
                            // res.json({ status: 'error', data: `${websiteUrl} is down and unreachable.` });
                        }
                        // CHECK WEBSITE STATUS FUNCTION#######################################################################

                    } else {
                        // const stoppedMonitor = website.url
                        console.log(`******** Site has stoped monitoring`)
                        clearInterval(monitoringInterval);
                        // console.log(`********${createdMonitor.Website.url}****** has stoped monitoring`)
                        return {
                            status: 'warning',
                            data: `SIe has stopped monitoring`
                        }
                    }

                } catch (error) {
                    console.log(error);
                    return {
                        status: 'error',
                        data: error.message, // Return default error
                    };
                }

            })

        }, interval * 60 * 1000); //multiply the seconds passed by seconds and again by miliseconds
        console.log(`############## Monitoring has been started for ${monitoringSite.Website.url} ##############`);
        return {
            status: 'success',
            data: `Monitoring started for ${monitoringSite.Website.url} cheking after every ${interval} minute(s)`,
        }

    } catch (error) {
        console.log('Oops!! An error occured', error)
    }

}

// scheduleSiteCheck()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));


module.exports = { startMonitoringLogic, startIntervalCheck };