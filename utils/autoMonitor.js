const { startMonitoringLogic, startIntervalCheck } = require('../utils/monitoringLogic');
// const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');
// Server startup initialization logic
async function initializeMonitoring() {
    try {
        // Retrieve active monitors from the database
        const activeMonitors = await Monitor.findAll();
        if (activeMonitors.length < 1) {
            console.log('There are no services being monitored at the moment')
            return {
                status: 'warnign',
                data: 'There are no services being monitored at the moment'
            }
        }
        console.log(activeMonitors)
        // Start monitoring for each active monitor
        activeMonitors.forEach((monitor) => {
            console.log(monitor)
            const { siteId, teamId, interval } = monitor;
            // Start monitoring logic for the monitor
            // startMonitoringLogic(siteId, teamId, interval, 1)
            //     .then(data => console.log(data))
            //     .catch(err => console.log(err));
            startIntervalCheck(siteId)
                .then(data => console.log(data))
                .catch(err => console.log(err));
        });

        console.log('Monitoring resumed after server restart.');
    } catch (error) {
        console.error('Error initializing monitoring:', error);
    }
}
// Call the initialization logic during server startup
initializeMonitoring()
    .then(data => console.log(data))
    .catch(err => console.log(err));

module.exports = { initializeMonitoring }