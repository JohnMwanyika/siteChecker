const express = require('express');

const profileRouter = require('../routes/profile.route');
const usersRouter = require('../routes/users');
const membersRouter = require('./members.route');
const { getDashboard, getSites, newSite, updateSite, createTeam, allTeams, updateTeam, removeTeam, startMonitoring, stopMonitoring, updateTeamNotification, fetchMonitorsApi } = require('../controllers/dashboard.controller');
const { generateCsrfToken, validateCsrfToken } = require('../middlewares/auth.mid');

const router = express.Router();

// router.use(generateCsrfToken);
router.use(validateCsrfToken);
// sites
router.get('/', generateCsrfToken, getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

// Teams
router.post('/teams', createTeam)
router.get('/teams', generateCsrfToken, allTeams);
router.post('/teams/:teamId', updateTeam)
router.delete('/teams/remove/:teamId', removeTeam);

router.post('/monitoring/start', startMonitoring);
router.get('/monitoring/stop/:siteId', stopMonitoring);

router.post('/teams/notification_update/:teamId', updateTeamNotification);

router.get('/api/monitors', fetchMonitorsApi);

// Profile route handler
router.use('/profile', profileRouter);

// Users route handler
router.use('/users', usersRouter);

// Member route handler
router.use('/members', membersRouter);

module.exports = router;
