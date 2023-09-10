const express = require('express');
const { allMembers, getMembersApi, createMemberApi, updateMemberApi, deleteMemberApi } = require('../controllers/dashboard.controller');
const { generateCsrfToken, validateCsrfToken } = require('../middlewares/auth.mid');
const router = express.Router();

router.use(validateCsrfToken);
router.get('/', generateCsrfToken, allMembers);
router.get('/api', getMembersApi);
router.post('/api/', createMemberApi);
router.post('/api/update/:memberId', updateMemberApi);
router.delete('/api/delete/:memberId', deleteMemberApi);
router.get('/new', (req, res) => {
    res.redirect('/dashboard/members');
})

module.exports = router;