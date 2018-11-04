var express = require('express');
var router = express.Router();
var { generateToken, putTokenInDB, sendToken } = require('../utils/token.utils');
var passport = require('passport');
var config = require('../config');
var request = require('request');
require('../passport')();

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

router.route('/auth/google')
    .post(passport.authenticate('google-token', {session: false}), function(req, res, next) {
        if (!req.user) {
            return res.send(401, 'User Not Authenticated');
        }
        req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, putTokenInDB, sendToken);


module.exports = router;
