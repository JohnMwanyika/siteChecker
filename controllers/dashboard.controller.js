const { checkWebsiteStatus } = require('../utils/intervalCheck');
const { Website, SiteStatus, User, Team, Monitor, Monitor_Status, Member } = require('../models/index.js');
const { sendMail } = require('../utils/send_mail.js');
const { startIntervalCheck } = require('../utils/monitoringLogic');
const { initializeMonitoring } = require('../utils/autoMonitor');
module.exports = {
    getDashboard: async (req, res) => {
        try {
            // get allwebstires
            const websites = await Website.findAll({
                where: {
                    createdBy: req.user.id
                }
            });
            // get all monitoring teams for the current user
            const teams = await Team.findAll({ where: { createdBy: req.user.id }, });
            // get all sites being monitored
            // const allSites = await Monitor.findAll({
            //     where: {
            //         createdBy: req.user.id
            //     },
            //     include: [
            //         { model: Team, include: [{ model: User }, { model: Member }] }, //include: { model: User, required: true } },
            //         { model: User },
            //         { model: Website, include: [{ model: SiteStatus }] },
            //         { model: Monitor_Status },
            //     ]
            // });

            // console.log(allSites)
            res.render('dashboard', { title: "Dashboard", websites, teams });
        } catch (error) {
            console.log(error)
        }

    },
    getSites: async (req, res) => {
        console.log(Website)
        try {
            const allSites = await Website.findAll({
                where: {
                    createdBy: req.user.id
                },
                order: [
                    ['updatedAt', 'DESC'],
                    // ['name', 'DESC'],
                ],
                include: [
                    { model: SiteStatus, required: true },
                    // { model: User, required: false }
                ]
            })
            const siteData = allSites.map(site => site.toJSON());
            const notify = req.query.notify == 'update_true' ? { info: 'Website updated successfully', type: 'success' } : ''
            // console.log(siteData)
            res.render('websites', { title: "My Sites", sites: allSites, notify, user: req.session.user })
            // res.json({ data: allSites })
        } catch (error) {
            res.json({ status: 'error', data: `An error occured while fetching sites ${error.message}` });
        }

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
        console.log(req.body)
        // Trim leading and trailing spaces from the inputs
        try {
            const trimmedTitle = title.trim();
            let trimmedUserIds;
            if (Array.isArray(userIds)) {
                console.log('Adding multiple memberIds')
                trimmedUserIds = userIds.map((id) => id.trim());
            }
            trimmedUserIds = userIds;

            // Check if the trimmed inputs are empty
            if (!trimmedTitle || !trimmedUserIds) {
                return res.status(400).json({ status: 'error', info: 'Invalid request' });
            }
            // try {

            let email = '0';
            let sms = '0';
            if (req.body.email == 'on') {
                email = '1'
            }
            if (req.body.sms == 'on') {
                sms = '1'
            }
            const newTeam = await Team.create({
                name: trimmedTitle,
                description,
                createdBy: req.user.id,
                email,
                sms
            })
            // await newTeam.addUsers(trimmedUserIds)
            await newTeam.addMembers(trimmedUserIds);
            // console.log(req.body);
            res.redirect('/dashboard/teams');
        } catch (error) {
            console.log(error)
            res.redirect('/dashboard/teams?info=error');
        }

    },
    allTeams: async (req, res) => {
        try {
            // const users = await User.findAll();
            const members = await Member.findAll({ where: { createdBy: req.user.id } })
            const allTeams = await Team.findAll({
                where: { createdBy: req.user.id },
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [
                    { model: User },
                    { model: Member },
                ]
            });
            // console.log(Object.getOwnPropertyNames(Team.prototype))
            // console.log(allTeams[0].Users);
            res.render('teams', { title: 'All Teams', members, allTeams, user: req.session.user });
        } catch (error) {
            console.error(error)
        }

    },
    updateTeam: async (req, res) => {
        const { teamId } = req.params;
        const { title, description, userIds } = req.body;
        console.log(`#### ############ UserIds ${userIds}`);
        const newMembers = [...new Set(userIds)];
        console.log(`New Ids are as follows ${newMembers}`);
        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                return res.redirect('/dashboard/teams?info=not-found'); //team not found
            }

            const allMembers = await Member.findAll({ where: { id: newMembers } });
            console.log("All members include -", allMembers);
            // check if the members exists
            if (allMembers.length === 0) {
                return res.redirect('/dashboard/teams?info=not-found');
            }
            // directly update selected members of the Default team
            if (team.name === 'Default') {
                await team.setMembers(allMembers);
                return res.redirect('/dashboard/teams?info=success');
            }
            // Update title and description of user defined teams if neccessary
            team.name = title.trim();
            team.description = description.trim();
            await team.save();
            // update team members of user defined teams
            await team.setMembers(allMembers);
            res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.redirect('/dashboard/teams?info=error');
        }

    },
    removeTeam: async (req, res) => {
        console.log('############ DELETION REQUEST RECEIVED ############')
        const { teamId } = req.params;
        console.log(teamId)
        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                return res.json({
                    status: 'error',
                    data: 'Team does not exist or has been deleted!'
                })
            }
            if (team.name === 'Default') {
                return res.json({ status: 'error', data: 'This is a system-generated team and cannot be removed' })
            }

            // const hasMonitors = await team.hasMonitors({ where: { id: teamId } });
            const hasMonitors = await team.countMonitors();
            console.log('Weather or not team has monitors', hasMonitors);
            if (hasMonitors > 0) {
                return res.json({
                    status: 'warning',
                    data: `${team.name}, you are about to delete has active monitors stop monitor before deleting team`
                })
            }

            const removedTeam = await Team.destroy({
                where: {
                    id: teamId
                }
            });
            // console.log('#################################', removedTeam);
            res.json({
                status: 'success',
                data: 'Team deleted successfully'
            })
            // res.redirect('/dashboard/teams?info=success');
        } catch (error) {
            console.log(error);
            res.json({
                status: 'error',
                data: 'Team deletion failed, please try again' + error.message
            })
        }
    },
    startMonitoring: async (req, res) => {
        console.log('################### REQUEST HAS BEEN RECEIVED ######################');
        const { siteId, interval, _csrf } = req.body; // Monitor data from client REQUEST BODY
        // console.log(_csrf + "From Client")
        // console.log(req.session.csrfToken + "Original From Server")
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
            const selectedTeam = await Team.findOne({ include: [{ model: User }, { model: Member }], where: { id: teamId } });
            if (selectedTeam) {
                console.log('selected team and users #########', selectedTeam)
                if (selectedTeam.Members.length < 1) { //if the selected team does not contain users throw an equivalent error
                    return res.json({ status: 'error', data: `Add members to '${selectedTeam.name}' team before assigning it!` })
                }
            }

            // #################################################################################3
            // if there is no team selectedm the default team is set automatically
            if (!teamId) {
                const defaultTeam = await Team.findOne({ include: [{ model: User }, { model: Member }], where: { name: 'Default', createdBy: userId } });
                console.log('Default team and users #########', defaultTeam)
                // if for some resons there is no default team, reject the request by throwing an error notification
                if (!defaultTeam) {
                    return res.json({ status: 'error', data: 'Default team is not set or Invalid team selected' });
                }
                // if the default team has no users reject by throwing an equevalent notification
                if (defaultTeam.Members.length < 1) {
                    return res.json({ status: 'error', data: 'Add members to the default team before assigning it!' });
                }
                // set the default team as the one selected since there is none selected
                teamId = defaultTeam.id;
            }

            // Check if there is an ongoing monitor for this website
            const monitor = await Monitor.findOne({ where: { siteId: siteId } });
            if (monitor) {
                return res.json({
                    status: 'warning',
                    data: 'Monitoring for this website is in progress.',
                });
            }

            // Create a new monitor for the website
            const createdMonitor = await Monitor.create({
                siteId,
                teamId, //selectedTeam.id || defaultTeam.id,
                interval,
                statusId: 1, //online by default, this will be activated once the site has been pinged for the first time
                createdBy: userId,
            });

            const updatedWebsite = website.setSiteStatus(2) //change site status to Monitoring

            // re-Initialize the monitoring logic to append the newly created above
            const monitorResults = await initializeMonitoring();
            console.log('Initialize monitoring results', monitorResults)

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
    editMonitor: async (req, res) => {
        const { monitorId } = req.params;
        const { teamId, interval } = req.body;
        console.log('Team Id is ' + teamId)
        try {
            const monitor = await Monitor.findByPk(monitorId);
            if (!monitor) {
                return res.json({ status: 'warning', data: 'Monitor not found' });
            }
            await Monitor.update({ teamId, interval }, {
                where: { id: monitorId }
            })
            res.json({ status: 'success', data: 'Service updated successfully' })
        } catch (error) {
            res.json({ status: 'error', data: 'An error occured while editing monitor' })
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
                data: 'Couldn\'t stop monitoring for this site please try again.',
            })
        }
    },
    allMembers: (req, res) => {
        try {
            res.render('members', {});
        } catch (error) {
            res.redirect('/dashboard/error');
        }
    },
    getMembersApi: async (req, res) => {
        // const { userId } = req.params;
        try {
            const members = await Member.findAll({ where: { createdBy: req.user.id }, order: [['updatedAt', 'DESC']] });
            // res.render('members', { members })
            res.json({ status: 'success', data: members });
        } catch (error) {
            res.json({ status: 'error', data: `An error occured while fetching members -${error.message}` });
        }
    },
    createMemberApi: async (req, res) => {
        const { firstName, lastName, email, phone, avatarPath } = req.body;
        console.log(req.body)
        try {
            // check existing
            const existingMember = await Member.findOne({ where: { email } });
            if (existingMember) {
                return res.json({ status: 'warning', data: 'Member with similar email exists please try another' });
            }

            const newMember = await Member.create({ firstName, lastName, email, phone, createdBy: req.user.id });
            if (newMember) {
                return res.json({ status: 'success', data: `${firstName} has been added successfully` });
            }

        } catch (error) {
            console.log(error)
            return res.json({ status: 'error', data: `An error has occured while creating user -${error.message}` });
        }
    },
    updateMemberApi: async (req, res) => {
        const { memberId } = req.params;
        const { firstName, lastName, email, phone, avatarPath } = req.body;
        try {
            await Member.update({ firstName, lastName, email, phone }, {
                where: { id: memberId }
            })
            return res.json({ status: 'success', data: `${firstName} has been updated successfully` });

        } catch (error) {
            return res.json({ status: 'error', data: `An error has occured while updating user -${error.message}` });
        }
    },
    deleteMemberApi: async (req, res) => {
        const { memberId } = req.params;
        try {
            await Member.destroy({ where: { id: memberId } });

            return res.json({ status: 'success', data: `Member has been deleted successfully` });

        } catch (error) {
            return res.json({ status: 'error', data: `An error has occured while updating user -${error.message}` });
        }
    },
    updateTeamNotification: async (req, res) => {
        const { email, sms } = req.body;
        const { teamId } = req.params;

        console.log(req.body)

        try {
            await Team.update({ email, sms }, {
                where: { id: teamId }
            })
            res.json({ status: 'success', data: 'Notification prefference updated successfully' })
        } catch (error) {
            res.json({ status: 'error', data: 'An error occured while updating team notification' });
        }

    },
    fetchMonitorsApi: async (req, res) => {
        try {
            // get all sites being monitored
            const monitors = await Monitor.findAll({
                where: {
                    createdBy: req.user.id
                },
                include: [
                    { model: Team, include: [{ model: User }, { model: Member }] }, //include: { model: User, required: true } },
                    { model: User },
                    { model: Website, include: [{ model: SiteStatus }] },
                    { model: Monitor_Status },
                ]
            });
            if (!monitors) {
                res.json({ status: 'warning', data: `You currently don't have any ongoing monitored sites. You can create a new monitor for your sites by clicking on the three dots above. ` });
            }

            // console.log(allSites)
            res.json({ status: 'success', data: monitors });
        } catch (error) {
            console.log(error)
            res.json({ status: 'error', data: 'We encountered an error while retrieving your currently monitored sites. To resolve this issue, please try refreshing the page.' })
        }
    }
}