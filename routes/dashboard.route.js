const express = require('express');
const { getDashboard, getSites } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', getDashboard);
router.get('/sites', getSites);

module.exports = router;