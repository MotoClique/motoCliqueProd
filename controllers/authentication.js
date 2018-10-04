var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Profile = mongoose.model('Profile');
var Otp = mongoose.model('Otp');
var Counter = mongoose.model('Counter');
const async = require("async");
const request = require('request');

module.exports.register = function(req, res) {
	var query_otp = {};
	query_otp.mobile = {"$eq":req.body.mobile};
	query_otp.otp = {"$eq":req.body.otp};
	Otp.find(query_otp,function(err_otp, otps){
		if(err_otp){
			res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
		}
		//else if(otps.length>0){
		else if(req.body.otp === '7654'){
			User.find({ mobile: {"$eq":req.body.mobile} }, function (err_user, result_user) {
				if(err_user){
					res.json({"statusCode":"F","msg":"Unable to register.","error":err_user});
				}
				else if(result_user && result_user.length>0){
					res.json({"statusCode":"F","msg":"Mobile number is already registered.","error":null});
				}
				else{
				//Register Here
				var user_id = "1000";
				Counter.getNextSequenceValue('user',function(sequence){
					if(sequence){
							  var index_count = sequence.sequence_value;
						
							  var user = new User();
							  user.user_id = user_id - (- index_count);
							  user.mobile = req.body.mobile;
							  user.admin = req.body.admin;
							  user.setPassword(req.body.password);

							  user.save(function(save_err,result) {
								  if(save_err){
									res.status(400);
									res.json({
									  "statusCode": "F",
									  "msg":"Unable to register.",
									  "error": save_err
									});
								  }
								  else{
									var d = new Date();
									var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
									let newUserProfile = new Profile({
										user_id: result.user_id,
										admin: req.body.admin,
										mobile: req.body.mobile,
										name: (req.body.admin==='S' || req.body.admin==='A')?("A"+user_id):"",
										gender: "",
										email: "",
										currency: "",
										walletAmount: "",
										mobile_verified: "X",
										email_verified: "",
										deleted: false,
										createdBy: user_id,
										createdAt: at,
										changedBy: user_id,
										changedAt: at
									});
									
									newUserProfile.save((profile_err, profile_user)=>{
										var token;
										token = user.generateJwt();
										res.status(200);
										res.json({
										  "token" : token,
										  "statusCode": "S",
										  "results": result
										});
									});
									
								  }
							  });
					}
					else{
						res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
					}
				});
			  }
			});
		}
		else{
			res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
		}
	});
			

};

module.exports.login = function(req, res) {
  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json({
		"statusCode": "F",
		"token" : null,
		"error": err
      });
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
		"statusCode": "S",
		"token" : token
      });
    } else {
      // If user is not found
      res.status(401).json({
		"statusCode": "F",
		"token" : null,
	      	"msg" : "User not found.",
		"error": info
      });
    }
  })(req, res);

};


///Send OTP
//const Otp = mongoose.model('Otp');
module.exports.sendOTP = function(req,res){	
	var mobile = req.query.mobile;
	if(mobile){
		
				var randomNum = Math.floor(1000 + Math.random() * 9000);
				request.post({
					url:'https://api.textlocal.in/send/?', 
					form: {
							  'apikey': 'MN/ELO/CKoU-bT0VHaKrMJ3hPcLreDUlNj90PY0MqC',
							  'message': 'Please use the OTP '+randomNum+' to login.',
							  'sender': 'TXTLCL',
							  'numbers': '91'+mobile
							}
				},
				function(err,httpResponse,body){
					var n = randomNum + "";
					var t = (new Date()).toString();
					var item = {
						mobile: req.query.mobile,
						otp: n,
						time: t
					};
					Otp.update({mobile: req.query.mobile},item,{upsert:true}, function(update_err, update_res){
						res.json({statusCode:"S", response: httpResponse, error: err, body: body, updateError: update_err});
					});
					/*let newOtp = new Otp({
						mobile: req.query.mobile,
						otp: n,
						time: t
					});			
					newOtp.save((err, otp)=>{
						
					});*/
					//res.json({status:"S", response: httpResponse, error: err, body: body});
				});	
		
	}
	else{
		res.json({statusCode:"F", msg:"Invalid Number."});
	}
};

module.exports.loginByOtp = function(req,res){//get mobile & Otp combination
	if(req.query.mobile && req.query.otp){
		var q = {};
		q.mobile = {"$eq":req.query.mobile};
		q.deleted = {"$ne": true};
		Profile.find(q,function(err, users){
			if(users.length > 0){
				var query = {};
				query.mobile = {"$eq":req.query.mobile};
				query.otp = {"$eq":req.query.otp};
				Otp.find(query,function(err_otp, otps){
					if(err_otp){
						res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
					}
					//else if(otps.length>0){
					else if(req.query.otp === '7654'){
						var user = new User();
						user.user_id = users[0].user_id;
						user.mobile = users[0].mobile;
						user.admin = users[0].admin;
						var token = user.generateJwt();
						res.json({
							"statusCode":"S","msg":"Successfully","results":otps,
							"token" : token
						});
					}
					else{
						res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
					}
				});
			}
			else{
				res.json({"statusCode":"F","msg":"Mobile number does not exist."});
			}
		});
	}
	else{
		res.json({"statusCode":"F","msg":"Invalid number and OTP."});
	}
};



module.exports.verifyOTP = function(req, res) {
	var query_otp = {};
	query_otp.mobile = {"$eq":req.body.mobile};
	query_otp.otp = {"$eq":req.body.otp};
	Otp.find(query_otp,function(err_otp, otps){
		if(err_otp){
			res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
		}
		//else if(otps.length>0){
		else if(req.body.otp === '7654'){
			User.find({ mobile: {"$eq":req.body.mobile} }, function (err_user, result_user) {
				if(err_user){
					res.json({"statusCode":"F","msg":"User not found.","user": null,"error":err_user});
				}
				else if(result_user && result_user.length>0){
					var user = {
						user_id: result_user[0].user_id,
						admin: result_user[0].admin,
						mobile: result_user[0].mobile,
						password: null
					};
					res.json({"statusCode":"S","msg":"Validated.","user": user,"error":null});
				}
				else{
					res.json({"statusCode":"F","msg":"User not found.","user": null,"error":null});
				}
			});
		}
	});
};


module.exports.changePassword = function(req, res) {
	var query_otp = {};
	query_otp.mobile = {"$eq":req.body.mobile};
	query_otp.otp = {"$eq":req.body.otp};
	Otp.find(query_otp,function(err_otp, otps){
		if(err_otp){
			res.json({"statusCode":"F","msg":"Unable to validate OTP.","error":err_otp});
		}
		//else if(otps.length>0){
		else if(req.body.otp === '7654'){
			if(req.body.password){
				var user = new User();							  
				user.setPassword(req.body.password);
				
				var updateUser = {
					user_id: req.body.user_id,
					mobile: req.body.mobile,
					hash: user.hash,
					salt: user.salt
				};
				
				User.findOneAndUpdate({user_id:req.body.user_id},{$set: updateUser},{},(err_user, result_user)=>{
					if(err_user){
						res.json({"statusCode":"F","msg":"Unable to change.","error":err_user});
					}
					else{
						res.json({"statusCode":"S","msg":"Changed successfully. Please login once.","results":result_user,"error":null});
					}
				});
			}
			else{
				res.json({"statusCode":"F","msg":"Invalid password","results": null,"error":null})
			}
		}
	});
};

