const { Website, SiteStatus, User, Team } = require('../models/index.js');

module.exports = {
    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.session.user.id);
            res.render('profile', { title: 'My Profile', user })
        } catch (error) {
            console.log(error);
            res.redirect('/error');
        }

    },
    updateProfile: async (req, res) => {
        const { firstName, lastName, email, phone } = req.body;
        try {
            const updatedProfile = await User.update({ firstName, lastName, email, phone }, {
                where: {
                    id: req.session.user.id
                }
            })
            res.redirect('/dashboard/profile');
        } catch (error) {
            console.log(error);
            res.redirect('/error');
        }
    },
    uploadAvatar: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const avatarPath = req.file.path // path where multer stored the file
            console.log(avatarPath)
            // Update the user's avatarPath field in the database
            await User.update({ avatarPath:`/${avatarPath}` }, { where: { id: userId } });

            console.log({status:'success',data:'Uploaded file successful'})
            res.json({status:'success',data:'Uploaded file successful'})
            // res.redirect('/dasboard/profile?info=success');
        } catch (error) {
            console.log({status:'error',data:'Failed uploading avatar'})
            res.json({status:'error',data:'Failed uploading avatar'})
            // res.redirect('/dasboard/profile?info=error');
            throw error
        }
    },
}