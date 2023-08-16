var express = require('express');
const { getAll } = require('../controllers/users.controller');
var router = express.Router();

/* GET users listing. */
router.get('/', getAll);


module.exports = router;
