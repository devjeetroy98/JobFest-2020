var express = require('express');
var router = express.Router();
// const passport= require('passport');
// var GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('../passport2');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
