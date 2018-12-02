var company = require("../models/Company");
var { findEmailByToken } = require("../models/GoogleUser");

//Insert new company into database
//Token validation not needed due to registration workflow
exports.createCompanyAccount = function(req, res, next) {
  new company({
    user_name: req.header("x-user-name"),
    contact: req.user.contact,
  }).save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    return next();
  });
};

//Returns all companies and their info
exports.getCompanyInfo = function(req, res, next) {
    company.find().exec(function(err, company) {
      if (err) {
        return next(err);
      }
      res.json([{ company }]);
    });
};

//Gets information based on the specific email
exports.getCompanyEmail = function(req, res, next) {
    tokenUtils.validate_company_call(req, res);
    company.find({ contact: req.params.id }).exec(function(err, company) {
      if (err) {
        return next(err);
      }
      res.json([{ company }]);
    });
};

exports.editCompanyProfile = [
  (req, res, next) => {
      var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(
        " "
      )[1];
      token_to_find_in_db = token_to_find_in_db.substring(
        0,
        token_to_find_in_db.length - 1
      );
      findEmailByToken(token_to_find_in_db, function(err, contact) {
        company
          .findOneAndUpdate(
            { contact: contact },
            {
              biography: req.body.company_name,
              interests: req.body.contracts
            }
          )
          .exec();
      });
  }
];
