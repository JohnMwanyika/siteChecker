const { startMonitoringLogic, startIntervalCheck } = require('../utils/monitoringLogic');
// const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Member } = require('../models/index.js');
// Server startup initialization logic
async function initializeMonitoring() {
    try {
        // Retrieve active monitors from the database
        const activeMonitors = await Monitor.findAll({ include: [{ model: Website }] });
        if (activeMonitors.length < 1) {
            console.log('There are no services being monitored at the moment')
            return {
                status: 'warnign',
                data: 'There are no services being monitored at the moment'
            }
        }
        // Start monitoring for each active monitor
        activeMonitors.forEach(async (monitor) => {
            console.log(`-----------------------Start monitoring ${monitor.Website.url}-------------------------------`);
            // obtaining siteId and userId from the current monitoring site
            const { siteId, createdBy } = monitor;
            // passing all sites to the interval check function which starts the monitor again after server restarts
            const monitorStatus = await startIntervalCheck(siteId, createdBy);
            console.log(`Interval check results`, monitorStatus);
        });
        return {
            status: 'sucess',
            data: 'Monitoring in progress'
        }
    } catch (error) {
        console.error('Error initializing monitoring:', error);
        return {
            status: 'error',
            data: `An error occured while initializing monitors - ${error.message}`
        }
    }
}
// Call the initialization logic during server startup
// initializeMonitoring()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));

module.exports = { initializeMonitoring }