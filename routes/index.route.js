var express = require('express');
const { checkSession } = require('../middlewares/auth.mid')
var router = express.Router();
const {
  home,
  search,
  signUpForm,
  signInForm
} = require('../controllers/home.controller');
const { signUp } = require('../controllers/signup.controller');
const { login } = require('../controllers/loginLogout.controller');
const dashboardRouter = require('./dashboard.route');
/* GET home page. */
router.get('/', home);
router.post('/search', search);
router.get('/signup', signUpForm);
router.get('/signin', signInForm);
router.post('/signup', signUp);
router.post('/signin', login)

router.use(checkSession);
router.use('/dashboard', dashboardRouter);

module.exports = router;