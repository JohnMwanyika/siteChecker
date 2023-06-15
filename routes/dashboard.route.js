const express = require('express');
const { getDashboard, getSites, newSite } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', getDashboard);
router.get('/sites', getSites);
router.post('/sites', newSite);

module.exports = router;