const activePage = (req, res, next) => {
    res.locals.activePage = req.url;
    next();
};







module.exports = { activePage };