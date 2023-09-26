const express = require('express');

const profileRouter = require('../routes/profile.route');
const usersRouter = require('../routes/users');
const membersRouter = require('./members.route');
const monitorRouter = require('./monitor.route');

const { getDashboard, getSites, newSite, updateSite, createTeam, allTeams, updateTeam, removeTeam, startMonitoring, editMonitor, stopMonitoring, updateTeamNotification, fetchMonitorsApi, singleMonitor } = require('../controllers/dashboard.controller');
const { generateCsrfToken, validateCsrfToken } = require('../middlewares/auth.mid');
const { getResultsById } = require('../controllers/results.controller');

const router = express.Router();


// router.use(generateCsrfToken);
router.use(validateCsrfToken);
// monitor Router
router.use('/monitor', monitorRouter);

// sites
router.get('/', generateCsrfToken, getDashboard);
router.get('/sites', generateCsrfToken, getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

// Teams
router.post('/teams', createTeam)
router.get('/teams', generateCsrfToken, allTeams);
router.post('/teams/:teamId', updateTeam)
router.delete('/teams/remove/:teamId', removeTeam);
// monitoring activities
router.post('/monitoring/start', startMonitoring);
router.post('/monitoring/update/:monitorId', generateCsrfToken, editMonitor);
router.get('/monitoring/stop/:siteId', stopMonitoring);

router.post('/teams/notification_update/:teamId', updateTeamNotification);
// fetch all monitors
router.get('/api/monitors', fetchMonitorsApi);

// get results
router.get('/monitor/results/:monitorId', getResultsById);



// Profile route handler
router.use('/profile', profileRouter);

// Users route handler
router.use('/users', usersRouter);

// Member route handler
router.use('/members', membersRouter);


module.exports = router;
