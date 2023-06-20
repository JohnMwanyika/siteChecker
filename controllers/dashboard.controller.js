const { Website, SiteStatus, User, Team } = require('../models/index.js');
module.exports = {
    getDashboard: (req, res) => {
        res.render('dashboard', { title: "Dashboard" });
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
            const newSite = await Website.create({ name, url, organization, statusId: 3, createdBy: req.session.user.id })
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
    }
}