
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var Counter = mongoose.model('Counter');
var Profile = mongoose.model('Profile');

//////////////////////////User Alerts////////////////////////////////
const UserAlert = mongoose.model('UserAlert');

module.exports.getUserAlert = function(req,res){//Fetch
	var query = {};
	if(req.query.alert_id){
		query.alert_id = {"$eq":req.query.alert_id};
	}
	if(req.query.user_id){
		query.user_id = {"$eq":req.query.user_id};
	}
	if(req.query.deleted){
		query.deleted = {"$eq":req.query.deleted};
	}
	else{
		query.deleted = {"$ne": true};
	}
	UserAlert.find(query,function(err, result){
		res.json({results: result, error: err});
	});
};
module.exports.addUserAlert = function(req,res){//Add New
	var query_profile = {};
	query_profile.user_id = {"$eq": req.payload.user_id};
	query_profile.deleted = {"$ne": true};
	Profile.find(query_profile,function(profile_err, profiles){
		if(!profile_err && profiles.length > 0){
			if(req.body.email && !(profiles[0].email)){
				res.json({statusCode: 'F', msg: 'Please maintain email id.'});
			}
			else{
				var alert_id = "0";
				Counter.getNextSequenceValue('alert',function(sequence){
					if(sequence){
						var index_count = sequence.sequence_value;
						var d = new Date();
						var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
						var doc = req.body;
						//let newUserAlert = new UserAlert({
							doc.user_id = req.payload.user_id;
							doc.alert_id =  alert_id - (-index_count);
							doc.bid_sell_buy= (req.body.bid_sell_buy)?req.body.bid_sell_buy:"";
							doc.individual_dealer= (req.body.individual_dealer)?req.body.individual_dealer:"";
							doc.owner_type= (req.body.owner_type)?req.body.owner_type:"";
							doc.product_type_name= (req.body.product_type_name)?req.body.product_type_name:"";
							doc.brand_name= (req.body.brand_name)?req.body.brand_name:"";
							doc.model= (req.body.model)?req.body.model:"";
							doc.variant= (req.body.variant)?req.body.variant:"";
							doc.fuel_type= (req.body.fuel_type)?req.body.fuel_type:"";
							doc.color= (req.body.color)?req.body.color:"";
							doc.transmission= (req.body.transmission)?req.body.transmission:"";
							doc.country= (req.body.country)?req.body.country:"";
							doc.state= (req.body.state)?req.body.state:"";
							doc.city= (req.body.city)?req.body.city:"";
							doc.location= (req.body.location)?req.body.location:"";
							doc.price_from= (req.body.price_from)?req.body.price_from:"";
							doc.price_to= (req.body.price_to)?req.body.price_to:"";
							doc.discount_from= (req.body.discount_from)?req.body.discount_from:"";
							doc.discount_to= (req.body.discount_to)?req.body.discount_to:"";
							doc.km_run_from= (req.body.km_run_from)?req.body.km_run_from:"";
							doc.km_run_to= (req.body.km_run_to)?req.body.km_run_to:"";
							doc.year_of_reg_from= (req.body.year_of_reg_from)?req.body.year_of_reg_from:"";
							doc.year_of_reg_to= (req.body.year_of_reg_to)?req.body.year_of_reg_to:"";
							doc.sms= req.body.sms;
							doc.email= req.body.email;
							doc.app= req.body.app;
							doc.active= req.body.active;
							doc.deleted= req.body.deleted;
							doc.createdBy = req.payload.user_id;
							doc.createdAt = d;
							doc.changedBy = req.payload.user_id;
							doc.changedAt = d;
						//});
						let newUserAlert = new UserAlert(doc);
						newUserAlert.save((err, result)=>{
							if(err){
								res.json({statusCode: 'F', msg: 'Failed to add', error: err});
							}
							else{
								res.json({statusCode: 'S', msg: 'Entry added', result: result});
							}
						});
					}
					else{
						res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
					}
				});
			}
		}
		else{
			res.json({statusCode: 'F', msg: 'Unable to find your profile detail.'});
		}
	});
};
module.exports.updateUserAlert = function(req,res){//Update
	var query_profile = {};
	query_profile.user_id = {"$eq": req.payload.user_id};
	query_profile.deleted = {"$ne": true};
	Profile.find(query_profile,function(profile_err, profiles){
		if(!profile_err && profiles.length > 0){
			if(req.body.email && !(profiles[0].email)){
				res.json({statusCode: 'F', msg: 'Please maintain email id.'});
			}
			else{
				var d = new Date();
				var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
				var doc = req.body;				
				doc.bid_sell_buy= (req.body.bid_sell_buy)?req.body.bid_sell_buy:"";
				doc.individual_dealer= (req.body.individual_dealer)?req.body.individual_dealer:"";
				doc.owner_type= (req.body.owner_type)?req.body.owner_type:"";
				doc.product_type_name= (req.body.product_type_name)?req.body.product_type_name:"";
				doc.brand_name= (req.body.brand_name)?req.body.brand_name:"";
				doc.model= (req.body.model)?req.body.model:"";
				doc.variant= (req.body.variant)?req.body.variant:"";
				doc.fuel_type= (req.body.fuel_type)?req.body.fuel_type:"";
				doc.color= (req.body.color)?req.body.color:"";
				doc.transmission= (req.body.transmission)?req.body.transmission:"";
				doc.country= (req.body.country)?req.body.country:"";
				doc.state= (req.body.state)?req.body.state:"";
				doc.city= (req.body.city)?req.body.city:"";
				doc.location= (req.body.location)?req.body.location:"";
				doc.price_from= (req.body.price_from)?req.body.price_from:"";
				doc.price_to= (req.body.price_to)?req.body.price_to:"";
				doc.discount_from= (req.body.discount_from)?req.body.discount_from:"";
				doc.discount_to= (req.body.discount_to)?req.body.discount_to:"";
				doc.km_run_from= (req.body.km_run_from)?req.body.km_run_from:"";
				doc.km_run_to= (req.body.km_run_to)?req.body.km_run_to:"";
				doc.year_of_reg_from= (req.body.year_of_reg_from)?req.body.year_of_reg_from:"";
				doc.year_of_reg_to= (req.body.year_of_reg_to)?req.body.year_of_reg_to:"";
				doc.sms= req.body.sms;
				doc.email= req.body.email;
				doc.app= req.body.app;
				doc.active= req.body.active;
				doc.deleted= req.body.deleted;
				delete doc.createdBy;
				delete doc.createdAt;
				doc.changedBy = req.payload.user_id;
				doc.changedAt = d;
				//};
				
				UserAlert.findOneAndUpdate({_id:req.body._id},{$set: doc},{},(err, updated)=>{
					if(err){
						res.json({statusCode: 'F', msg: 'Failed to update', error: err});
					}
					else{
						res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
					}
				});
			}
		}
		else{
			res.json({statusCode: 'F', msg: 'Unable to find your profile detail.'});
		}
	});
};

module.exports.deleteUserAlert = function(req,res){//Delete
	UserAlert.remove({_id: req.params.id}, function(err,result){
		if(err){
			res.json(err);
		}
		else{
			res.json(result);
		}
	});
};
