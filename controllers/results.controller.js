const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Member, Results } = require('../models/index.js');

module.exports = {
    getResultsById: async (req, res) => {
        try {
            const { monitorId } = req.params;
            // get the whole monitor
            const monitoringSite = await Monitor.findByPk(monitorId);
            // get the website being monitored
            const website = await monitoringSite.getWebsite();
            // console.log("Website being monitored", website);

            const results = await website.getResults();
            // console.log(results);

            res.json({ status: 'success', data: results });
        } catch (error) {
            res.json({ status: 'error', data: `An error occured while fetching results - ${error.message}` });
        }
    }
}