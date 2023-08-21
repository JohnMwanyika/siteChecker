const express = require('express');
const { allMembers, getMembersApi, createMemberApi, updateMemberApi, deleteMemberApi } = require('../controllers/dashboard.controller');
const router = express.Router();

router.get('/', allMembers);
router.get('/api', getMembersApi);
router.post('/api/', createMemberApi);
router.post('/api/update/:memberId', updateMemberApi);
router.delete('/api/delete/:memberId', deleteMemberApi);

module.exports = router;