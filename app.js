var createError = require('http-errors');
var express = require('express');
// include helmet
const helmet = require('helmet');

// include socketio
const http = require('http');
const socketIO = require('socket.io');
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
const { activePage } = require('./middlewares/activePage.mid');
// const dashboardRouter = require('./routes/dashboard.route');
// const usersRouter = require('./routes/users');

const app = express();
// configure session middleware
app.use(session({
  secret: ' THIS$is@my%littleSecret.Iwanna/SHareiTWithYouGuys,DoYouWann@He@rIt.com',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: sequelize,
  }),
}));

// app.disable('x-powered-by');
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

// include helmet------------------------------------------------------------
// app.use(helmet());
// include helmet------------------------------------------------------------
// statics files folder
app.use(express.static(path.join(__dirname, '/public')));
// app.use("assets", express.static("/public/assets/"));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// middleware to set active sidebar link
app.use(activePage);
// index router
app.use('/', indexRouter);

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

// server
const server = http.createServer(app);
// initialize websocket server
const io = socketIO(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // This function Calls the initialization logic for monitoring which restarts all the monitors
  initializeMonitoring()
    .then(data => console.log('Monitoring resumed after server restart.'))
    .catch(error => console.log(error))
});

// Check client connection activity
io.on('connection', (socket) => {
  console.log('Someone is connected?');
  socket.on('newLogin', (data) => { console.log(data) })

  socket.on('disconnect', () => {
    console.log('Some user disconnected');
    socket.disconnect();
  });
});

const socketIoObject = io;
module.exports.ioObject = socketIoObject;