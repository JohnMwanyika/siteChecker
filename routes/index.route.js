var express = require('express');
var router = express.Router();
const {
  home,
  search
} = require('../controllers/home.controller')
/* GET home page. */
router.get('/', home);
router.post('/search', search)

module.exports = router;