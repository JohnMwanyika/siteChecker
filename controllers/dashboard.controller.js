const { Website, SiteStatus, User } = require('../models/index.js');
module.exports = {
    getDashboard: (req, res) => {
        res.render('dashboard', { title: "Dashboard" })
    },
    getSites: async (req, res) => {
        console.log(Website)
        const allSites = await Website.findAll({
            include: [
                { model: SiteStatus, required: true },
                { model: User, required: true }
            ]
        })
        const siteData = allSites.map(site => site.toJSON());
        console.log(siteData)
        res.render('websites', { title: "My Sites", sites: allSites })
    },
    newSite: async (req, res) => {
        console.log(req.body)
        const { name, url, organization } = req.body;
        try {
            const newSite = await Website.create({ name, url, organization })
            res.redirect('/dashboard/sites')
        } catch (error) {
            console.log(error)
        }
    }
}