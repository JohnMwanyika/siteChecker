const express = require('express');
const { getDashboard, getSites, newSite, updateSite, createTeam, allTeams, updateTeam, removeTeam } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

// Teams
router.post('/teams', createTeam)
router.get('/teams', allTeams);
router.post('/teams/:teamId', updateTeam)
router.get('/teams/remove/:teamId', removeTeam);

module.exports = router;