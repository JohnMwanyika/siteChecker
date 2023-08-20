const express = require('express');
const { allMembers, getMembers } = require('../controllers/dashboard.controller');
const router = express.Router();

router.get('/', allMembers);
router.get('/api', getMembers)

module.exports = router;