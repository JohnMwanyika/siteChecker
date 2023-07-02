var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
// function to resume monitoring when server restarts
const { initializeMonitoring } = require('./utils/autoMonitor')
// const { checkSession } = require('./middlewares/auth.mid')
// define the connection string
const { sequelize } = require('./config/config');
// getting routers from reouter folder
const indexRouter = require('./routes/index.route');
// const dashboardRouter = require('./routes/dashboard.route');
const usersRouter = require('./routes/users');

const app = express();
// configure session middleware
app.use(session({
  secret: ' THIS$is@my%littleSecret.Iwanna/SHareiTWithYouGuys,DoYouWann@He@rIt.com',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: sequelize,
  }),
}))

// sequelize.sync().then(data=>console.log(data)).catch(err=>console.log(err));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
// app.use('/dashboard', checkSession, dashboardRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // Call the initialization logic for monitoring
  initializeMonitoring();
});
// module.exports = app;