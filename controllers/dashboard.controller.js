module.exports = {
    getDashboard: (req, res) => {
        res.render('dashboard', { title: "Dashboard" })
    }
}