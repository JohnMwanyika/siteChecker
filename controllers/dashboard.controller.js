const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');

module.exports = {
    getDashboard: async (req, res) => {
        try {
            const allSites = await Monitor.findAll({
                include: [
                    { model: Team, include: [{ model: User }] }, //include: { model: User, required: true } },
                    { model: User },
                    { model: Website, include: [{ model: SiteStatus }] },
                    { model: Monitor_Status }
                ]
            });
            // console.log(allSites)
            res.render('dashboard', { title: "Dashboard", allSites });
        } catch (error) {
            console.log(error)
        }

    },
    getSites: async (req, res) => {
        console.log(Website)
        const allSites = await Website.findAll({
            include: [
                { model: SiteStatus, required: true },
                { model: User, required: false }
            ]
        })
        const siteData = allSites.map(site => site.toJSON());
        const notify = req.query.notify == 'update_true' ? { info: 'Website updated successfully', type: 'success' } : ''
        // console.log(siteData)
        res.render('websites', { title: "My Sites", sites: allSites, notify })
    },
    newSite: async (req, res) => {
        console.log(req.body)
        const { name, url, organization } = req.body;
        try {
            const newSite = await Website.create({ name, url, organization, statusId: 1, createdBy: req.session.user.id })
            res.redirect('/dashboard/sites')
        } catch (error) {
            console.log(error)
        }
    },
    updateSite: async (req, res) => {
        const { name, url, organization } = req.body;
        try {
            const updatedSite = await Website.update({
                name, url, organization
            }, {
                where: {
                    id: req.params.id
                }
            });
            res.redirect('/dashboard/sites?notify=update_true')
        } catch (error) {
            console.log(error);
        }

    },
    createTeam: async (req, res) => {
        const { title, description, userIds } = req.body;

        const newTeam = await Team.create({
            name: title,
            description
        })
        await newTeam.addUsers(userIds)
        console.log(req.body)
        res.redirect('/dashboard/teams');
    },
    allTeams: async (req, res) => {
        try {
            const users = await User.findAll();
            const allTeams = await Team.findAll({
                orderBy: {
                    createdAt: 'DESC'
                },
                include: {
                    model: User,
                    required: true,
                }
            });
            // console.log(Object.getOwnPropertyNames(Team.prototype))
            // console.log(allTeams[0].Users);
            res.render('teams', { title: 'All Teams', users, allTeams });
        } catch (error) {
            console.error(error)
        }

    },
    updateTeam: async (req, res) => {
        const { teamId } = req.params; // teamId received from request parameters
        const { title, description, userIds } = req.body;
        try {
            const updatedTeam = await Team.update({ name: title, description }, {
                where: {
                    id: teamId
                }
            })
            const team = await Team.findByPk(teamId);
            await team.setUsers(userIds);
            res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.redirect('/dashboard/teams?info=error');
        }
    },
    removeTeam: async (req, res) => {
        const { teamId } = req.params;
        try {
            const removedTeam = await Team.destroy({
                where: {
                    id: teamId
                }
            });
            res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.redirect('/dashboard/teams?info=error');
        }
    },
    startMonitoring: async (req, res) => {
        const { siteId, teamId, interval, statusId } = req.body;
        const userId = req.session.user.id;
        try {
            const newMonitor = await Monitor.create({
                siteId, teamId, interval, statusId: 1, userId
            })
            const website = await Website.findByPk(1);
            // update the website status to Monitoring
            await website.setSiteStatus(2);
            console.log(website.url)
            const websiteUrl = `https://${website.url}`;
            const checkInterval = interval * 10 * 1000; // Check every 5 minutes

            setInterval(() => {
                checkWebsiteStatus(websiteUrl)
                    .then((isUp) => {
                        if (!isUp) {
                            // sendEmailNotification();
                            console.log('Website has just collapsed')
                        } else {
                            console.log('Hurray!! Website is back online')
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking website status:', error);
                    });
            }, checkInterval);

            console.log(`@@@@######@@@@@@@ Website monitoring started. Checking ${websiteUrl} every ${checkInterval / 1000} seconds...`);
            res.json({
                status: 'success',
                data: 'Selected service has started monitoring successfully'
            })
        } catch (error) {
            res.json({
                status: 'error',
                data: 'An error occurred while monitoring'
            })
            console.log(error);
        }
    }
}