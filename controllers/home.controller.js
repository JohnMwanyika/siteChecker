const {
    checkWebsiteStatus
} = require('../utils/intervalCheck')
// import Spin from 'spin.js';

module.exports = {
    home: async (req, res) => {
        res.render('home', {
            title: 'Home'
        })
    },
    search: (req, res) => {
        const {
            site
        } = req.body;

        checkWebsiteStatus(site)
            .then((isUp) => {
                if (isUp) {
                    console.log(isUp)
                    res.json({
                        status: 'success',
                        data: `Success ${site} is up and fuctioning properly`
                    })
                } else {
                    console.log(isUp)
                    res.json({
                        status: 'danger',
                        data: `Sorry ${site} cant be reached at the moment`
                    })
                }

            })
            .catch((error) => {
                console.log(error);
                res.json({
                    status: 'error',
                    data: 'Error checking website status'
                })
            })

    }
}