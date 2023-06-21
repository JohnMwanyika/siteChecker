const express = require('express');
const { upload } = require('../middlewares/upload.mid');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profile.controller');
const router = express.Router();

router.get('/', getProfile);
router.post('/update/:id', updateProfile);
router.post('/update/avatar', upload.single('file'), uploadAvatar);

module.exports = router;