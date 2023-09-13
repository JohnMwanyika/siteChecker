const express = require('express');
const { upload } = require('../middlewares/upload.mid');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profile.controller');
const { generateCsrfToken } = require('../middlewares/auth.mid');
const router = express.Router();

router.get('/',generateCsrfToken, getProfile);
router.post('/update', updateProfile);
router.post('/upload/avatar', upload.single('file'), uploadAvatar);

module.exports = router;