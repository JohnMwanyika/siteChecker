var express = require('express');
var router = express.Router();
const {
  home,
  search,
  signUpForm,
  signInForm
} = require('../controllers/home.controller');
const { signUp } = require('../controllers/signup.controller');
const { login } = require('../controllers/loginLogout.controller');
/* GET home page. */
router.get('/', home);
router.post('/search', search);
router.get('/signup', signUpForm);
router.get('/signin', signInForm);
router.post('/signup', signUp);
router.post('/signin', login)

module.exports = router;