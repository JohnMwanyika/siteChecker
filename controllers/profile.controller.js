const { Website, SiteStatus, User, Team } = require('../models/index.js');

module.exports = {
    getProfile: async (req, res) => {
        res.render('profile', { title: 'My Profile' })
    },
    updateProfile: async (req, res) => {
        const { firstName, lastName, email, phone, } = req.body;
        res.redirect('/dasboard/profile');
    },
    uploadAvatar: async (req, res) => {
        try {
            const { userId } = req.params;
            const avatarPath = req.file.path // path where multer stored the file

            // Update the user's avatarPath field in the database
            await User.update({ avatarPath }, { where: { id: userId } });
            res.redirect('/dasboard/profile?info=success');
        } catch (error) {
            res.redirect('/dasboard/profile?info=error');
        }
    },
}