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

// startMonitoringLogic(2, 45, 1, 1)
//     .then(data => console.log(data))
//     .catch(error => console.error(error))

module.exports = { startMonitoringLogic };