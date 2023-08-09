const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status } = require('../models/index.js');
const { sendMail } = require('../utils/send_mail.js');
const { startIntervalCheck } = require('../utils/monitoringLogic');
const { initializeMonitoring } = require('../utils/autoMonitor');
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
            res.render('dashboard', { title: "Dashboard", allSites, websites, teams, user: req.session.user });
        } catch (error) {
            console.log(error)
        }

    },
    getSites: async (req, res) => {
        console.log(Website)
        const allSites = await Website.findAll({
            order: [
                ['name', 'ASC']
            ],
            include: [
                { model: SiteStatus, required: true },
                { model: User, required: false }
            ]
        })
        const siteData = allSites.map(site => site.toJSON());
        const notify = req.query.notify == 'update_true' ? { info: 'Website updated successfully', type: 'success' } : ''
        // console.log(siteData)
        res.render('websites', { title: "My Sites", sites: allSites, notify, user: req.session.user })
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
        // Trim leading and trailing spaces from the inputs
        const trimmedTitle = title.trim();
        const trimmedUserIds = userIds.map((id) => id.trim());

        // Check if the trimmed inputs are empty
        if (!trimmedTitle || !trimmedUserIds.length) {
            return res.status(400).json({ status: 'error', info: 'Invalid request' });
        }
        try {
            const newTeam = await Team.create({
                name: trimmedTitle,
                description
            })
            await newTeam.addUsers(trimmedUserIds)
            console.log(req.body)
            res.redirect('/dashboard/teams');
        } catch (error) {
            console.log(error)
            res.redirect('/dashboard/teams?info=error');
        }

    },
    allTeams: async (req, res) => {
        try {
            const users = await User.findAll();
            const allTeams = await Team.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                include: {
                    model: User,
                }
            });
            // console.log(Object.getOwnPropertyNames(Team.prototype))
            // console.log(allTeams[0].Users);
            res.render('teams', { title: 'All Teams', users, allTeams, user: req.session.user });
        } catch (error) {
            console.error(error)
        }

    },
    updateTeam: async (req, res) => {
        const { teamId } = req.params; // teamId received from request parameters
        const { title, description, userIds } = req.body;
        console.log(`#### ############ UserIds ${userIds}`)
        const newMembers = [...new Set(userIds)];
        console.log(`New Ids are as follows ${newMembers}`);
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
            // const existingUsers = await team.getUsers();
            // const newUsers = userIds
            // console.log(existingUsers.id);
            await team.setUsers(newMembers);
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
            if (team.name === 'Default') {
                return res.json({ status: 'error', data: 'This is a system-generated team and cannot be removed' })
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
        // const { siteId } = req.params; // websiteId for monitoring
        const { siteId, interval } = req.body; // Monitor data from client REQUEST BODY
        let { teamId } = req.body;
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
            // find team details
            const selectedTeam = await Team.findOne({ include: [{ model: User }], where: { id: teamId } });
            if (selectedTeam) {
                console.log('selected team and users #########', selectedTeam)
                if (selectedTeam.Users.length < 1) { //if the selected team does not contain users throw an equivalent error
                    return res.json({ status: 'error', data: `Add members to '${selectedTeam.name}' team before assigning it!` })
                }
            }

            // #################################################################################3
            // if there is no team selectedm the default team is set automatically
            if (!teamId) {
                const defaultTeam = await Team.findOne({ include: [{ model: User }], where: { name: 'Default' } });
                console.log('Default team and users #########', defaultTeam)
                // if for some resons there is no default team, reject the request by throwing an error notification
                if (!defaultTeam) {
                    return res.json({ status: 'error', data: 'Default team is not set or Invalid team selected' });
                }
                // if the default team has no users reject by throwing an equevalent notification
                if (defaultTeam.Users.length < 1) {
                    return res.json({ status: 'error', data: 'Add members to the default team before assigning it!' });
                }
                teamId = defaultTeam.id;
                // else { //throw the error team not found
                //     return res.json({ status: 'error', data: 'Team selected does not exist' })
                // }
            }


            // Check if there is an ongoing monitor for this website
            const monitor = await Monitor.findOne({ where: { siteId: siteId } });
            if (monitor) {
                return res.json({
                    status: 'warning',
                    data: 'Monitoring for this website is already in progress.',
                });
            }

            // Create a new monitor for the website
            const createdMonitor = await Monitor.create({
                siteId,
                teamId, //selectedTeam.id || defaultTeam.id,
                interval,
                statusId: 2,
                createdBy: userId,
            });

            const updatedWebsite = website.setSiteStatus(2) //change site status to Monitoring

            // re-Initialize the monitoring logic to append the newly created above
            initializeMonitoring()
                .then(data => console.log(data))
                .catch(error => console.log(error));

            console.log(`############## Monitoring has been started for ${website.url} ##############`);
            res.json({
                status: 'success',
                data: `Monitoring started for ${website.url}`,
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: 'error',
                data: `${error.message} ${error.stack}`, // Return default error
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