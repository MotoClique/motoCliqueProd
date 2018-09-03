//const express = require('express');
//const router = express.Router();
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var Counter = mongoose.model('Counter');
var Sell = mongoose.model('Sell');
var Bid = mongoose.model('Bid');
var Buy = mongoose.model('Buy');
var Service = mongoose.model('Service');
var Parameter = mongoose.model('Parameter');
var cltrAddress = this;

//////////////////////////User Address////////////////////////////////
const UserAddress = mongoose.model('UserAddress');

module.exports.getUserAddress = function(req,res){//Fetch
	var query = {};
	if(req.query.user_id){
		query.user_id = {"$eq":req.query.user_id};
	}
	if(req.query.address_id){
		query.address_id = {"$eq":req.query.address_id};
	}
	if(req.query.deleted){
		query.deleted = {"$eq":req.query.deleted};
	}
	else{
		query.deleted = {"$ne": true};
	}
	UserAddress.find(query,function(err, userAddress){
		res.json({results: userAddress, error: err});
	});
};
module.exports.addUserAddress = function(req,res){//Add New
	var address_id = "0";
	Counter.getNextSequenceValue('address',function(sequence){
		if(sequence){
			var index_count = sequence.sequence_value;
			var d = new Date();
			var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
			let newUserAddress = new UserAddress({
				user_id: req.body.user_id,
				address_id: address_id - (-index_count),
				address: req.body.address,
				name: req.body.name,
				mobile: req.body.mobile,
				pin_code: req.body.pin_code,
				country: req.body.country,
				state: req.body.state,
				city: req.body.city,
				locality: req.body.locality,
				map_point: req.body.map_point,
				default_flag: req.body.default_flag,
				deleted: req.body.deleted,
				createdBy: req.payload.user_id,
				createdAt: at,
				changedBy: req.payload.user_id,
				changedAt: at
			});
			
			if(req.body.default_flag){
				UserAddress.update({user_id:req.body.user_id}, {$set:{default_flag:false}}, {multi: true}, (update_err, update_address)=>{
					if(update_err){
						res.json({statusCode: 'F', msg: 'Failed to add', error: update_err});
					}
					else{
						newUserAddress.save((err, address)=>{
							if(err){
								res.json({statusCode: 'F', msg: 'Failed to add', error: err});
							}
							else{
								res.json({statusCode: 'S', msg: 'Entry added', address: address});
							}
						});
					}
				});
			}
			else{
				newUserAddress.save((err, address)=>{
							if(err){
								res.json({statusCode: 'F', msg: 'Failed to add', error: err});
							}
							else{
								res.json({statusCode: 'S', msg: 'Entry added', address: address});
							}
						});
			}
		}
		else{
			res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
		}
	});
};
module.exports.updateUserAddress = function(req,res){//Update
	if(req.body.deleted){
		var posts = [];
		var query = {};
		query.user_id = {"$eq":req.payload.user_id};
		query.address_id = {"$eq":req.body.address_id};
		query.deleted = {"$ne": true};
		query.active = {"$eq": "X"};
		Parameter.find({parameter:{"$eq":"extra_life_time"}},function(params_err, params_result){
			Sell.find(query,function(sell_err, sell_result){
				if(sell_result && sell_result.length>0)
					posts = posts.concat(sell_result);
				Buy.find(query,function(buy_err, buy_result){
					if(buy_result && buy_result.length>0)
						posts = posts.concat(buy_result);
					
					var extr_dy = new Date();
					if(params_result && params_result.length>0){
						var newDate = extr_dy.getDate() - (params_result[0].value);
						extr_dy.setDate(newDate);
					}
					query.bid_valid_to = {"$gte": extr_dy};
					delete query.active;
					Bid.find(query,function(bid_err, bid_result){
						if(bid_result && bid_result.length>0)
							posts = posts.concat(bid_result);
						
						query.active = {"$eq": "X"};
						delete query.bid_valid_to;
						Service.find(query,function(service_err, service_result){
							if(service_result && service_result.length>0)
								posts = posts.concat(service_result);
							
							if(posts && posts.length>0){
								res.json({statusCode: 'F', msg: 'This particular address is being used in your existing posts. Please deactivate or change the address in those post and try again.', error: {}, posts: posts});
							}
							else{
								cltrAddress.updateUserAddressMethod(req,res);
							}
						});
					});
				});
			});
		});
	}
	else{
		cltrAddress.updateUserAddressMethod(req,res);
	}
};

module.exports.updateUserAddressMethod = function(req,res){//
		var d = new Date();
		var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
		let updateUserAddress = {
			_id:req.body._id,
			user_id: req.body.user_id,
			address_id: req.body.address_id,
			address: req.body.address,
			name: req.body.name,
			mobile: req.body.mobile,
			pin_code: req.body.pin_code,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			locality: req.body.locality,
			map_point: req.body.map_point,
			default_flag: req.body.default_flag,
			deleted: req.body.deleted,
			//createdBy: req.body.createdBy,
			//createdAt: req.body.createdAt,
			changedBy: req.payload.user_id,
			changedAt: at
		};
	
		if(req.body.default_flag){
			UserAddress.update({user_id:req.body.user_id}, {$set:{default_flag:false}}, {multi: true}, (update_err, update_address)=>{
				if(update_err){
					res.json({statusCode: 'F', msg: 'Failed to update', error: update_err});
				}
				else{
					UserAddress.findOneAndUpdate({_id:req.body._id},{$set: updateUserAddress},{},(err, updated)=>{
						if(err){
							res.json({statusCode: 'F', msg: 'Failed to update', error: err});
						}
						else{
							res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
						}
					});
				}
			});
		}
		else{
			UserAddress.findOneAndUpdate({_id:req.body._id},{$set: updateUserAddress},{},(err, updated)=>{
				if(err){
					res.json({statusCode: 'F', msg: 'Failed to update', error: err});
				}
				else{
					res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
				}
			});
		}
};

module.exports.deleteUserAddress = function(req,res){//Delete
	UserAddress.remove({_id: req.params.id}, function(err,result){
		if(err){
			res.json(err);
		}
		else{
			res.json(result);
		}
	});
};
