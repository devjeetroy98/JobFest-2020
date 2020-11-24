var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var session =require('express-session')
var passport = require('passport')
var flash = require('flash')
const user = require('./schema/authSchema');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var GoogleStrategy = require('passport-google-oauth20').Strategy;
var app = express();

//Database connection
mongoose.connect('mongodb+srv://DevjeetRoy:devjeetroy@21@cluster0.8lpn0.mongodb.net/jobfest?retryWrites=true&w=majority',{
  useUnifiedTopology: true,
  useFindAndModify: true,
  useNewUrlParser: true
}).then(()=>{
  console.log("Database connected!");
}).catch((err)=>{
  console.log("Error occured: "+err);
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  maxAge: 3600000,
  resave: true,
  saveUninitialized: true,
}));
// using passport for authentications 
app.use(passport.initialize());
app.use(passport.session());
// using flash for flash messages 
app.use(flash());

// MIDDLEWARES
// Global variable
app.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/user', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
