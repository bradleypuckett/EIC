var test = require("../models/Test");
var buddy = require("../models/Buddy");
var student = require("../models/Student");
var googleUser = require("../models/GoogleUser");
var tokenUtils = require("../utils/token.utils");
var { findEmailByToken } = require("../models/GoogleUser");
var mongoose = require("mongoose");

const { body, validationResult } = require("express-validator/check");

//Insert new student into database
//Token validation not needed due to registration workflow
exports.create_student_account = function(req, res, next) {
  new student({
    user_name: req.header("x-user-name"),
    contact: JSON.parse(JSON.stringify(req.user)).email,
    userProfileImageId: "5bfd8e869525d02037349b53"
  }).save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    return next();
  });
};

//Returns all students and their info
exports.get_student_info = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    student.find().exec(function(err, student) {
      if (err) {
        return next(err);
      }
      res.json([{ student }]);
    });
};

//Gets information based on the specific email
exports.get_student_email = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    student.find({ contact: req.params.id }).exec(function(err, student) {
      if (err) {
        return next(err);
      }
      res.json([{ student }]);
    });
};

// Gets buddy profile info based off of token
exports.get_student_profile = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    console.log("Made it past token verify");
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];


    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );

    console.log("Token is", token_to_find_in_db);

    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      console.log("Searching for contact", contact);
      student
        .findOne({ contact: contact })
        // this is a_user to make front end logic easier
        .exec(function(err, a_user) {
            console.log("Found result", a_user);
          res.json([{ a_user }]);
        });
    });

};

//Get students who have partial matches based on the user name
exports.get_student_partial = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    student
      .find({ user_name: { $regex: req.params.id, $options: "i" } })
      .limit(10)
      .exec(function(err, student) {
        if (err) {
          return next(err);
        }
        res.json([{ student }]);
      });
};

//Adds buddy to this student's pending_buddy[],
exports.add_pending_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .findOne({ contact: req.params.buddy_email })
          .exec(function(err, a_buddy) {
            if (err) return err;
            student
              .findOneAndUpdate(
                { _id: a_student._id },
                { $push: { pending_buddy: a_buddy._id } }
              )
              .exec();
          });
      });
    });
};

//Adds student to this buddy's student[] from pending_student[]
exports.accept_pending_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .find({ _id: { $in: a_student.pending_buddy } })
          .exec(function(err, a_buddy) {
            if (err) return err;
            student
              .findOneAndUpdate(
                { _id: a_student._id },
                { $pull: { pending_buddy: a_buddy._id } }
              )
              .exec();
            student
              .findOneAndUpdate(
                { _id: a_student._id },
                { $push: { buddy: a_buddy._id } }
              )
              .exec();
            //**this next call shouldn't be necessary**
            buddy
              .findOneAndUpdate(
                { _id: a_buddy._id },
                { $pull: { pending_student: a_student._id } }
              )
              .exec();
            buddy
              .findOneAndUpdate(
                { _id: a_buddy._id },
                { $push: { student: a_student._id } }
              )
              .exec();
          });
      });
    });
};

//Delete buddy from this student's pending_buddy[]
exports.reject_pending_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .findOne({ contact: req.params.buddy_email })
          .exec(function(err, a_buddy) {
            if (err) return err;
            student
              .findOneAndUpdate(
                { _id: a_student._id },
                { $pull: { pending_buddy: a_buddy._id } }
              )
              .exec();
            //**this next call shouldn't be necessary**
            buddy
              .findOneAndUpdate(
                { _id: a_buddy._id },
                { $pull: { pending_student: a_student._id } }
              )
              .exec();
          });
      });
      res.send();
    });
};

//Delete buddy/student connection
exports.reject_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .findOne({ contact: req.params.buddy_email })
          .exec(function(err, a_buddy) {
            if (err) return err;
            student
              .findOneAndUpdate(
                { _id: a_student._id },
                { $pull: { buddy: a_buddy._id } }
              )
              .exec();
            buddy
              .findOneAndUpdate(
                { _id: a_buddy._id },
                { $pull: { student: a_student._id } }
              )
              .exec();
          });
      });
      res.send();
    });
};

//View this student's pending buddies
exports.get_pending_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .find({ _id: { $in: a_student.pending_buddy } })
          .exec(function(err, a_buddy) {
            if (err) return err;
            res.json([{ a_buddy }]);
          });
      });
    });
};

//View this student's accepted buddies
exports.get_buddy = function(req, res, next) {
    tokenUtils.validate_student_call(req, res);
    var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
      " "
    )[1];
    token_to_find_in_db = token_to_find_in_db.substring(
      0,
      token_to_find_in_db.length - 1
    );
    findEmailByToken(token_to_find_in_db, function(err, contact) {
      if (err) {
        return next(err);
      }
      student.findOne({ contact: contact }).exec(function(err, a_student) {
        if (err) return err;
        buddy
          .find({ _id: { $in: a_student.buddy } })
          .exec(function(err, a_buddy) {
            if (err) return err;
            res.json([{ a_buddy }]);
          });
      });
    });
};

exports.edit_student_profile = [
  (req, res, next) => {
     tokenUtils.validate_student_call(req, res);
     var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
        " "
      )[1];
      token_to_find_in_db = token_to_find_in_db.substring(
        0,
        token_to_find_in_db.length - 1
      );
      findEmailByToken(token_to_find_in_db, function(err, contact) {
        student
          .findOneAndUpdate(
            { contact: contact },
            {
              biography: req.body.biography,
              interests: req.body.interests
            }
          )
          .exec();
      });
  }
];
