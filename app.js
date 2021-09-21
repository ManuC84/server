var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var cors = require('cors');
var { connectionUrl } = require('./config/config.js');
var session = require('express-session');

var indexRouter = require('./routes');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var notificationsRouter = require('./routes/notifications');

// Initalize express
var app = express();
dotenv.config();

// Initalize DB
mongoose
  .connect(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log(err));

// Middleware
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/notifications', notificationsRouter);

module.exports = app;
