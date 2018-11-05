var test = require('../models/Test');
var buddy = require('../models/Buddy');
var student = require('../models/Student');
var googleUser = require('../models/GoogleUser');
var goog_token = require('../utils/token.utils');
var { findEmailByToken } = require('../models/GoogleUser')
var mongoose = require('mongoose');
var ObjectId = mongoose.ObjectId;

//Gets all buddies in the db
exports.get_buddy_info = function(req,res,next){
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		buddy.find()
		.exec(function(err,buddy){
		if(err){return next(err)};
		res.json([{buddy}]);
		});
	}
}
//Gets buddy based on email
exports.get_buddy_email = function(req,res,next){
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		buddy.find({contact:req.params.id})
		.exec(function(err,buddy){
		if(err){return next(err)};
		res.json([{buddy}]);
		});
	}
}
//Gets buddy based on partial matches
exports.get_buddy_partial = function(req,res,next){
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		console.log(req.params.id);
		buddy.find({"user_name":{"$regex":req.params.id,"$options":"i"}})
		.limit(10)
		.exec(function(err,buddy){
		if(err){return next(err)};
		res.json([{buddy}]);
	});
  }
}
/*
//Adds student to this buddy's pending_student[]
exports.add_pending_student = function(req, res, next) {
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		googleUser.find({ eic_token : req.params.goog_token })
		.exec(function(err,a_user){
		if(err){return next(err)};
			buddy.find({ 'contact': a_user.contact})
     			.exec(function(err, a_buddy){
         			if (err) return err;
         			student.find({ 'contact': req.params.student_email }
				.exec(function(err, a_student){
             			if(err) return err;
             			a_buddy.pending_student.push(a_student);
         			})
     			});
		});
	}
}
*/
// Adds student to this buddy's student[] from pending_student[]
// Also adds buddy to student's buddy[]
exports.accept_pending_student = function(req, res, next) {
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
		token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
		findEmailByToken(token_to_find_in_db, function(err,contact){
		if(err){return next(err)};
		buddy.findOne({'contact': contact})
		.exec(function(err, a_buddy){
			if (err) return err;
			student.findOne({ 'contact': req.params.student_email })
			.exec(function(err, a_student){
				if(err) return err;
				student.findOneAndUpdate(
					{ _id: a_student._id },
					{ $pull: {pending_buddy: a_buddy._id}}
				).exec();
				student.findOneAndUpdate(
					{ _id: a_student.id },
					{ $push: {buddy: a_buddy._id}}
				).exec();
				buddy.findOneAndUpdate(
					{ _id: a_buddy._id },
					{ $pull: {pending_student: a_student._id}}
				).exec();
				buddy.findOneAndUpdate(
					{ _id: a_buddy.id },
					{ $push: {student: a_student._id}}
				).exec();
			})
		});
		res.send();
		});
	}
}


//Delete student from this buddy's pending_student[]
exports.reject_pending_student = function(req, res, next) {
	if(!goog_token.validate_buddy_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
		token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
		findEmailByToken(token_to_find_in_db, function(err,contact){
		if(err){return next(err)};
		buddy.findOne({'contact': contact})
		.exec(function(err, a_buddy){
			if (err) return err;
			student.findOne({ 'contact': req.params.student_email })
			.exec(function(err, a_student){
				if(err) return err;
				student.findOneAndUpdate(
					{ _id: a_student._id },
					{ $pull: {pending_buddy: a_buddy._id}
				}).exec();
				buddy.findOneAndUpdate(
					{ _id: a_buddy._id },
					{ $pull: {pending_student: a_student._id}
				}).exec();
			})
		});
		res.send();
		});
	}
}

//View this buddy's pending students
exports.get_pending_student = function(req, res, next) {
	if(!goog_token.validate_student_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		var token_to_find_in_db = JSON.stringify(req.headers.authorization).split(" ")[1];
		token_to_find_in_db = token_to_find_in_db.substring(0,token_to_find_in_db.length - 1);
		findEmailByToken(token_to_find_in_db, function(err, contact) {
		if(err){return next(err)};
			buddy.findOne({ 'contact': contact})
     	.exec(function(err, a_buddy){
        if (err) return err;
				student.find({"_id": {$in: a_buddy.pending_student}})
				.exec(function(err, a_student){
        	if(err) return err;
          res.json([{a_student}]);
         	})
     	});
		});
	}
}
/*
//View this buddy's accepted students
exports.get_student = function(req, res, next) {
	if(!goog_token.validate_student_call(req)){
		res.send('401 ERROR UNAUTHORISED TOKEN');
	}
	else{
		googleUser.find({ eic_token : req.params.goog_token })
		.exec(function(err,a_user){
		if(err){return next(err)};
			buddy.find({ 'contact': a_user.contact})
     			.exec(function(err, a_buddy){
         			if (err) return err;
         			a_buddy.student.find()
				.exec(function(err, a_student){
             			if(err) return err;
             			res.json({a_student});
         			})
     			});
		});
	}
}
*/
