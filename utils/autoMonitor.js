const { startMonitoringLogic, startIntervalCheck } = require('../utils/monitoringLogic');
// const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');
// Server startup initialization logic
async function initializeMonitoring() {
    try {
        // Retrieve active monitors from the database
        const activeMonitors = await Monitor.findAll({ include: { model: Website } });
        if (activeMonitors.length < 1) {
            console.log('There are no services being monitored at the moment')
            return {
                status: 'warnign',
                data: 'There are no services being monitored at the moment'
            }
        }
        // console.log(activeMonitors)
        // Start monitoring for each active monitor
        activeMonitors.forEach((monitor) => {
            console.log(`-----------------------Start monitoring ${monitor.Website.url}-------------------------------`);
            const { siteId } = monitor;
            // passing all sites to the interval check function which starts the monitor again after server restarts
            startIntervalCheck(siteId)
                .then(data => {
                    console.log('monitoring status', data)
                })
                .catch(error => {
                    console.log('monitoring error', error)
                });
        });

        console.log('Monitoring resumed after server restart.');
    } catch (error) {
        console.error('Error initializing monitoring:', error);
    }
}
// Call the initialization logic during server startup
// initializeMonitoring()
//     .then(data => console.log(data))
//     .catch(err => console.log(err));

module.exports = { initializeMonitoring }