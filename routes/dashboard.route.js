const express = require('express');
const { getDashboard } = require('../controllers/dashboard.controller');

const router = express.Router();


router.get('/', (req,res)=>{
    res.render('dashboard')
});

module.exports = router;