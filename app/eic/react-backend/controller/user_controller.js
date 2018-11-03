var test = require('../models/Test');
var User = require('../models/GoogleUser');
var goog_token = require('../utils/token.utils');

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
	if(goog_token.validate_student_call(req))
		res.send('Student');
	else if(goog_token.validate_buddy_call(req))
		res.send('Buddy');
	else if(goog_token.validate_company_call(req))
		res.send('Company');
}
