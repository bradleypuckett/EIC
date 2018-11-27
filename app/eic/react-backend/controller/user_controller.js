var test = require("../models/Test");
var User = require("../models/GoogleUser");
var eic_user = require("../models/User");
var googleUser = require("../models/GoogleUser");
var user = require("../models/User");
var student = require("../models/Student");
var buddy = require("../models/Buddy");
var userProfileImage = require("../models/UserProfileImage");
var goog_token = require("../utils/token.utils");
var fs = require("fs");
var User = require("../models/User");
var Student = require("../models/Student");
var Buddy = require("../models/Buddy");
var token_utils = require("../utils/token.utils");
var { findEmailByToken } = require("../models/GoogleUser");
const { body, validationResult } = require("express-validator/check");

exports.list_users = function(req, res, next) {
  //res.send('respond with a resource');

  // And insert something like this instead:
  res.json([
    {
      id: 1,
      username: "samsepi0l"
    },
    {
      id: 2,
      username: "D0loresH4ze"
    }
  ]);
};

exports.list_db = function(req, res, next) {
  test.find().exec(function(err, list_test) {
    if (err) {
      return next(err);
    }
    res.json([{ list_test }]);
  });
};

exports.log_in_user = function(req, res, next) {
  let user_info = JSON.parse(JSON.stringify(req.user));
  let user_email = user_info.email;
  eic_user.findOne({ contact: user_email }, function(err, result) {
    if (err) {
      return res.status(406).send();
    } else {
      if (result === null) {
        return res.status(406).send();
      }
      res.locals.eicUserType = result.itemtype;
      return next();
    }
  });
};

//this is the post request to add/update a user's profile image
exports.addUserProfileImage = [
  (req, res, next) => {
      var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
        " "
      )[1];
      token_to_find_in_db = token_to_find_in_db.substring(
        0,
        token_to_find_in_db.length - 1
      );

      findEmailByToken(token_to_find_in_db, function(err, contact) {
        user.findOne({ contact: contact }).exec(function(err, user) {
          if (!user.userProfileImageId) {
            var newUserImage = new userProfileImage();
            newUserImage.userImage.data = fs.readFileSync(req.file.path);
            newUserImage.save(function(err) {
              if (err) return handleError(err);
            });
            user.userProfileImageId = newUserImage.id;
            user.save(function(err) {
              if (err) return handleError(err);
            });
            fs.unlink(req.file.path, err => {
              if (err) throw err;
            });
          } else {
            userProfileImage.findById(user.userProfileImageId, function(
              err,
              userProfileImage
            ) {
              userProfileImage.userImage.data = fs.readFileSync(req.file.path);
              userProfileImage.save();
              fs.unlink(req.file.path, err => {
                if (err) throw err;
              });
            });
          }
          res.send();
        });
      });
  }
];

exports.getUserProfileImage = function(req, res, next) {
    user.findOne({ contact: req.params.id }).exec(function(err, user) {
      userProfileImage.findById(user.userProfileImageId, function(
        err,
        userProfileImage
      ) {
        if (!userProfileImage) {
          res.send("404 ERROR IMAGE NOT FOUND");
        } else {
          //res.send(userProfileImage.userImage.data);
          //res.writeHead(200, {'Content-Type': 'image/jpeg'});
          //res.end(userProfileImage.userImage.data)
          res.send(
            Buffer.from(userProfileImage.userImage.data).toString("base64")
          );
        }
      });
    });
};
