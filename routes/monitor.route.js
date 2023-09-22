const express = require('express');
const { singleMonitor } = require('../controllers/dashboard.controller');
const router = express.Router();

router.get('/',(req,res)=>{
    res.json({status:'warning',data:'Nothing to see here'})
})
router.get('/:monitorId', singleMonitor);








module.exports = router;