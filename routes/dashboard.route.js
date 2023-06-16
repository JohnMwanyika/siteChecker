const express = require('express');
const { getDashboard, getSites, newSite, updateSite } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);
router.post('/sites/:id', updateSite);

module.exports = router;