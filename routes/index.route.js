var express = require('express');
var router = express.Router();
const {
  home,
  search,
  signUpForm,
  signInForm
} = require('../controllers/home.controller')
/* GET home page. */
router.get('/', home);
router.post('/search', search);
router.get('/sign-up', signUpForm);
router.get('/sig-in', signInForm);

module.exports = router;