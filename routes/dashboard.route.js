const express = require('express');
const profileRouter = require('../routes/profile.route');
const { getDashboard, getSites, newSite, updateSite, createTeam, allTeams, updateTeam, removeTeam, startMonitoring } = require('../controllers/dashboard.controller');

const router = express.Router();

// sites
router.get('/', getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

// Teams
router.post('/teams', createTeam)
router.get('/teams', allTeams);
router.post('/teams/:teamId', updateTeam)
router.get('/teams/remove/:teamId', removeTeam);

router.post('/monitoring/start/:siteId', startMonitoring);
router.delete('/monitoring/:id')

// Profile
router.use('/profile', profileRouter);

module.exports = router;