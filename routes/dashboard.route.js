const express = require('express');
const { getDashboard, getSites, newSite, updateSite, createTeam, allTeams } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

// Teams
router.post('/teams', createTeam)
router.get('/teams', allTeams);

module.exports = router;