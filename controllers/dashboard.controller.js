const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');

module.exports = {
    getDashboard: async (req, res) => {
        try {
            // get allwebstires
            const websites = await Website.findAll();
            // get all monitoring team
            const teams = await Team.findAll();
            // get all sites being monitored
            const allSites = await Monitor.findAll({
                include: [
                    { model: Team, include: [{ model: User }] }, //include: { model: User, required: true } },
                    { model: User },
                    { model: Website, include: [{ model: SiteStatus }] },
                    { model: Monitor_Status }
                ]
            });

            // console.log(allSites)
            res.render('dashboard', { title: "Dashboard", allSites, websites, teams });
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
        try {
            const newTeam = await Team.create({
                name: title,
                description
            })
            await newTeam.addUsers(userIds)
            console.log(req.body)
            res.redirect('/dashboard/teams');
        } catch (error) {
            console.log(error)
        }

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
        console.log(`#### ############ UserIds ${userIds}`)
        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                // return res.json({ status: 'error', data: 'Team does not exist' })
                return res.redirect('/dashboard/teams?info=not-found')
            }
            const updatedTeam = await Team.update({ name: title, description }, {
                // include:[{model:User}],
                where: {
                    id: teamId
                }
            })
            const existingUsers = await team.getUsers();
            const newUsers = userIds
            console.log(existingUsers.id);
            await team.setUsers(userIds);
            // res.json({status: 'success', data: `Team '${team.name}' has been updated successfully.`})
            res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.redirect('/dashboard/teams?info=error');
        }
    },
    removeTeam: async (req, res) => {
        console.log('############ DELETION REQUEST RECEIVED ############')
        const { teamId } = req.params;
        try {
            const team = await Team.findOne({ where: { id: teamId } });
            if (!team) {
                return res.json({
                    status: 'error',
                    data: 'Team does not exist or has been deleted!'
                })
            }
            if (team.name === 'Default Team') {
                return res.json({ status: 'warning', data: 'This is a system-generated team and cannot be removed' })
            }
            const removedTeam = await Team.destroy({
                where: {
                    id: teamId
                }
            });
            console.log('#################################', removedTeam);
            res.json({
                status: 'success',
                data: 'Team deleted successfully'
            })
            // res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.json({
                status: 'error',
                data: 'Team deletion failed, please try again'
            })
            // res.redirect('/dashboard/teams?info=error');
        }
    },
    startMonitoring: async (req, res) => {
        console.log('################### REQUEST HAS BEEN RECEIVED ######################');
        const { siteId } = req.params; // websiteId for monitoring
        const { teamId, interval } = req.body; // Monitor data from client REQUEST BODY
        const userId = req.session.user.id; // Currently logged-in user

        try {
            // Find the website based on siteId
            const website = await Website.findByPk(siteId);
            if (!website) {
                return res.json({
                    status: 'error',
                    data: 'Website not found',
                });
            }

            // Check if there is an ongoing monitor for this website
            const monitor = await Monitor.findOne({ where: { siteId } });
            if (monitor) {
                return res.json({
                    status: 'warning',
                    data: 'Monitoring for this website is already in progress.',
                });
            }

            // Create a new monitor for the website
            const createdMonitor = await Monitor.create({
                siteId,
                teamId,
                interval,
                statusId: 2,
                createdBy: userId,
            });

            const updatedWebsite = website.setSiteStatus(2)
            // Start monitoring logic
            const monitoringInterval = setInterval(async () => {


                try {
                    // getting the site details from the Monitoring lists
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
                        // const updatedWebsite = website.setSiteStatus(2);

                        // Check the website status
                        const isUp = await checkWebsiteStatus(websiteUrl);

                        if (isUp) {
                            console.log(`Hurray!! ${websiteUrl} is up and operational.`);
                            res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                        } else {
                            console.log(`Mayday! Mayday! ${websiteUrl} has just collapsed.`);
                            res.json({ status: 'success', data: `${websiteUrl} is up and operational.` });
                        }
                    } else {
                        clearInterval(monitoringInterval);
                        console.log(`##Site has stoped monitoring`)
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
            res.json({
                status: 'success',
                data: `Monitoring started for ${website.url}`,
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: 'error',
                data: error.message, // Return default error
            });
        }
    },
    stopMonitoring: async (req, res) => {
        const { siteId } = req.params
        try {
            // get current website
            const currentSite = await Website.findByPk(siteId);
            const monitoredSite = await Monitor.findOne({ where: { siteId: siteId } });
            if (!monitoredSite) {
                return res.json({
                    status: 'warning',
                    data: 'This site is not being monitored.'
                })
            }
            const removedMonitor = await Monitor.destroy({ where: { siteId: siteId } });
            await currentSite.setSiteStatus(1) //Not monitoring anymore
            res.json({
                status: 'success',
                data: 'Site has stopped monitoring.'
            })
        } catch (error) {
            console.log(error);
            res.json({
                status: 'error',
                data: 'Couldn\'t stop monitoring for this site.',
            })
        }
    }
}