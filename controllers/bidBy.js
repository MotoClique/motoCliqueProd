
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var Profile = mongoose.model('Profile');
var ctrlBid = require('./bid');
var ctrlCommon = require('./common');

//////////////////////////Bid By////////////////////////////////
const BidBy = mongoose.model('BidBy');

module.exports.getBidBy = function(req,res){//Fetch
	var query = {};
	if(req.query.bid_id){
		query.bid_id = {"$eq":req.query.bid_id};
	}
	if(req.query.bid_by_user_id){
		query.bid_by_user_id = {"$eq":req.query.bid_by_user_id};
	}
	if(req.query.deleted){
		query.deleted = {"$eq":req.query.deleted};
	}
	else{
		query.deleted = {"$ne": true};
	}
	BidBy.find(query,function(err, result){
		if(err){
			res.json({statusCode:"F", msg:"Unable to fetch bid participants.", results: null, error: err});
		}
		else if(result.length>0){
			var loopCount = 0;
			var formatted_results = [];
			result.forEach(function(item,index,arr){
				ctrlCommon.convertFromUTC(item.bid_date_time,"IST",function(newDate,timeDiff){
					loopCount = loopCount - (-1);
					if(newDate){
						var clone = JSON.parse(JSON.stringify(item));
						var hrs = (newDate.getHours()<10)?("0"+newDate.getHours()):newDate.getHours();
						var mins = (newDate.getMinutes()<10)?("0"+newDate.getMinutes()):newDate.getMinutes();
						var secs = (newDate.getSeconds()<10)?("0"+newDate.getSeconds()):newDate.getSeconds();
						clone.bid_date_time = newDate.getDate()+'/'+(newDate.getMonth() - (-1))+'/'+newDate.getFullYear()+' '+hrs+':'+mins+':'+secs;
						formatted_results.push(clone);
					}
					
					if(loopCount === result.length){
					   res.json({statusCode:"S", msg:"Successfully fetched.", results: formatted_results, error: null});
					}
				});
			});
			
		}
		else{
			res.json({statusCode:"S", msg:"No bid participants.", results: result, error: err});
		}
	});
};
module.exports.addBidBy = function(req,res){//Add New
	// If no user ID exists in the JWT return a 401
	if (!req.payload.user_id) {
		res.status(401).json({
			"statusCode": 'F',
			"msg" : "Unauthorized Access."
		});
	} else {		
		var Bid = mongoose.model('Bid');
		var query_bid = {};
		query_bid.bid_id = {"$eq":req.body.bid_id};
		query_bid.deleted = {"$ne": true};		
		Bid.find(query_bid,function(err_bid, result_bid){
			if(result_bid.length > 0){
				//var date_split = [];
				//var time_split = [];
				var validTo = new Date();
										
				if(result_bid[0].bid_valid_to){
					/*var date_part = ((result_bid[0].bid_valid_to).split('T'))[0];
					var time_part = ((result_bid[0].bid_valid_to).split('T'))[1];
					if(date_part)
						date_split = (date_part).split('/');
					if(time_part)
						time_split = (time_part).split(':');
							
					if(date_split[0] && date_split[1] && date_split[2] && time_split[0] && time_split[1])
						validTo = new Date(date_split[1]+'/'+date_split[0]+'/'+date_split[2] +' '+ time_split[0]+':'+time_split[1]+':00');*/
					validTo = result_bid[0].bid_valid_to;
				}
				
				//var to = (result_bid[0].bid_valid_to).split('/');
				//var toDateObj = new Date(to[2]+'-'+to[1]+'-'+to[0]);
				console.log(validTo);
				
				var currentDateObj = new Date();
				console.log(currentDateObj);
				if(validTo>currentDateObj && result_bid[0].bid_status === 'Active'){	
					var query = {};
					query.user_id = {"$eq":req.payload.user_id};
					Profile.find(query,function(profile_err, users){
						if(users.length > 0){
							var d = new Date();
							var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
							
							var doc = req.body;
							doc.bid_by_user_id = req.payload.user_id;
							doc.bid_by_name = users[0].name;
							doc.bid_date_time = d; //at +" "+ d.toTimeString();
							doc.createdAt = at;
							doc.changedAt = at;
							doc.createdBy = req.payload.user_id;
							doc.changedBy = req.payload.user_id;
							
							let newBid = new BidBy(doc);
							
							newBid.save((err, result)=>{
								if(err){
									res.json({statusCode: 'F', msg: 'Failed to add', error: err});
								}
								else{
									var updatedBid = result_bid[0];
									updatedBid.current_bid_amount = doc.current_bid_amount;
									updatedBid.current_bid_by = req.payload.user_id;
									updatedBid.current_bid_at = at;
									/*var bidValidDateObj = result_bid[0].bid_valid_to;
									var bidValidHrs = (bidValidDateObj.getHours()<10)?('0'+bidValidDateObj.getHours()):bidValidDateObj.getHours();
									var bidValidMins = (bidValidDateObj.getMinutes()<10)?('0'+bidValidDateObj.getMinutes()):bidValidDateObj.getMinutes();
									var bidValidSecs = (bidValidDateObj.getSeconds()<10)?('0'+bidValidDateObj.getSeconds()):bidValidDateObj.getSeconds();
									updatedBid.bid_valid_to = bidValidDateObj.getDate() +"/"+ (bidValidDateObj.getMonth() - (-1)) +"/"+ bidValidDateObj.getFullYear() +"T"+ bidValidHrs +":"+ bidValidMins +":"+ bidValidSecs;*/
									ctrlBid.updateBid({body:updatedBid, payload:req.payload, bidValidTo: (updatedBid.bid_valid_to).getTime()},res);
									//res.json({statusCode: 'S', msg: 'Entry added', result: result});
								}
							});
						}
						else{
							res.json({statusCode: 'F', msg: 'Failed to add', error: profile_err});
						}
					});
				}
				else{
					res.json({statusCode: 'F', msg: 'The Bid has either Expired or Closed'});
				}
			}
			else{
				res.json({statusCode: 'F', msg: 'Bid details unavailable', error: err_bid});
			}
		});
				
	}
};
module.exports.updateBidBy = function(req,res){//Update
	var d = new Date();
	var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
	var doc = req.body;
		delete doc.createdAt;
		delete doc.createdBy;
		doc.changedAt = at;
		doc.changedBy = req.payload.user_id;
		
	BidBy.findOneAndUpdate({_id:doc._id},{$set: doc},{},(err, updated)=>{
		if(err){
			res.json({statusCode: 'F', msg: 'Failed to update', error: err});
		}
		else{
			res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
		}
	});
};

module.exports.deleteBidBy = function(req,res){//Delete
	BidBy.remove({_id: req.params.id}, function(err,result){
		if(err){
			res.json(err);
		}
		else{
			res.json(result);
		}
	});
};
