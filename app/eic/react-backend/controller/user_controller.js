var test = require('../models/Test');
var googleUser = require('../models/GoogleUser');
var user = require('../models/User');
var student = require('../models/Student');
var buddy = require('../models/Buddy');
var userProfileImage = require('../models/UserProfileImage');
var goog_token = require('../utils/token.utils');
var { findEmailByToken } = require('../models/GoogleUser');
const {body,validationResult} = require('express-validator/check');
exports.list_users = function(req, res, next) {
  //res.send('respond with a resource');

  // And insert something like this instead:
  res.json([{
  	id: 1,
  	username: "samsepi0l"
  }, {
  	id: 2,
  	username: "D0loresH4ze"
  }]);
}

exports.list_db = function(req, res, next) {
	test.find()
	.exec(function(err,list_test){
	if(err){return next(err)};
 	res.json([{list_test}]);
	});
}

//return user type
exports.get_user_type = function(req,res,next){
  // TODO: refactor and implement the token validation calls
  if(!goog_token.validate_student_call(req)
     && !goog_token.validate_buddy_call(req)
     && !goog_token.validate_comany_call(req)) {
       res.send('401 ERROR UNAUTHORISED TOKEN');
  }
  var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
  token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
  //console.log(token_to_find_in_db)
  findEmailByToken(token_to_find_in_db, function(err, contact) {
    console.log(contact);
    user.findOne({'contact': contact})
    .exec(function(err, account){
      res.send(account.itemtype);
    });
  });
}

//this is the post request to add/update a user's profile image
exports.addUserImage = [
  (res, req, next) => {
    if(!goog_token.validate_student_call(req)){
      res.send('401 ERROR UNAUTHORISED TOKEN');
    }
    else{
      var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
      token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
      findEmailByToken(token_to_find_in_db, function(err, contact) {
        var user = user.findOne({'contact': contact}).exec(function(err, user){
          userProfileImage.findOne({'id': user.userProfileImageId},function(err, userImage){
            if(err){return err};
            //this checks if there's no image for the user if there isn't then create new image
            if(!userImage){
              var newUserProfileImage = new userProfileImage({
                UserImage: req.body.image
            });
            newUserProfileImage.save(function(err){
              if(err) return handleError(err);
            });
            user.userProfileImageId = newUserProfileImage.id;
            user.save();
          }
          //if theres an image it will update with new image
          else{
            userImage.UserImage= req.body.image;
            userImage.save();
          }
        })

        });
       
      });
    };
  }
]
/*
exports.add_user_image = [
  (res, req, next) => {
    if(!goog_token.validate_student_call(req)){
      res.send('401 ERROR UNAUTHORISED TOKEN');
    }
    else{
      var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
      token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
      findEmailByToken(token_to_find_in_db, function(err, contact) {
        var user = user.findOne({'contact': contact});
        userProfileImage.findOne({'id': user.userProfileImageId},function(err, userImage){
          if(err){return err};
          //this checks if there's no image for the user if there isn't then create new image
          if(!userImage){
            var newUserProfileImage = new userProfileImage({
              userImage: req.body.image
            });
            newUserProfileImage.save(function(err){
              if(err) return handleError(err);
            });
            user.userProfileImageId = newUserProfileImage.id;
            user.save();
          }
          //if theres an image it will update with new image
          else{
            userImage.userImage= req.body.image;
            userImage.save();

          }
        })
      });
    };
  }
]
*/
exports.getUserProfileImage = function(req, res, next){
  if(!goog_token.validate_buddy_call(req)){
    res.send('401 ERROR UNAUTHORISED TOKEN');
  }
  else{
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
    token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      var user = user.findOne({'contact': contact},function(err, user){
        userProfileImageId.findById(user.userProfileImageId,function(err, userImage){
          res.contentType(userImage.UserImage.contentType);
        })

      });  

    });
  }
}