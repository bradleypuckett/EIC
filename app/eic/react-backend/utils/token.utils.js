var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var googleUser = require('../models/GoogleUser');
var { addEICToken } = require('../models/GoogleUser');
var eic_user = require('../models/User');
var user_controller = require('../controller/user_controller');
var buddy_controller = require('../controller/buddy_controller');
var db_functions = require('../db_input');

var createToken = function(auth) {
	return jwt.sign({
            id: auth.id
        }, 'my-secret',
        {
            expiresIn: 60 * 120
        });
};

module.exports = {
	generateToken: function(req, res, next) {
     	req.token = createToken(req.auth);
     	return next();
  	},
    ensureUserExists: function(req, res, next) {
      let user_info = JSON.parse(JSON.stringify(req.user));
	  let user_email = user_info.email;
      console.log("Checking if user exists", user_email);
      if(user_controller.check_user_exists(user_email)) {
        console.log("User exists in user db", user_email);
        return next();
      } else {
        console.log("User doesnt exist in db", user_email);
        return res.status(406).send();
      }
    },
    putTokenInDB: function(req, res, next) {
      addEICToken(req, res, next);
      return next();
    },
    registerUser: function(req, res, next) {
      let account_type = req.header("x-account-type");
      let user_name = req.header("x-user-name");
      let user_email = JSON.parse(JSON.stringify(req.user)).email;
      console.log("Insert into database", account_type, user_name, user_email);

      if(account_type === "Buddy"){
        return db_functions.buddy_create(user_name,user_email, next());
      } else if (account_type == "Student") {
        return db_functions.student_create(user_name,user_email,"", "",next());
      } else if (account_type == "Company") {
        return next();
      } else {
        return res.status(500);
      }
    },
  	sendToken: function(req, res) {
      	res.setHeader('x-auth-token', req.token);
      	return res.status(200).send(JSON.stringify(req.user));
  	},
    validate_student_call: function(req) {
      return true;
    },

    validate_buddy_call: function(req) {
      return true;
    },

    validate_company_call: function (req) {
      return true;
    }
};
