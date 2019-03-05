
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var ctrlNotification = require('./notification');
const UserSubMap = mongoose.model('UserSubMap');
const Counter = mongoose.model('Counter');
const Parameter = mongoose.model('Parameter');
var ctrlCommon = require('./common');
const Thumbnail = mongoose.model('Thumbnail');
const Image = mongoose.model('Image');
const BidBy = mongoose.model('BidBy');
const ChatInbox = mongoose.model('ChatInbox');
const Fav = mongoose.model('Fav');

//////////////////////////Bid////////////////////////////////
const Bid = mongoose.model('Bid');

module.exports.getBid = function(req,res){//Fetch
	Parameter.find({parameter:{"$in":["bid_slot_from","bid_slot_to","extra_life_time"]}},function(params_err, params_result){
		var query = {};
		if(req.query.bid_id){
			query.bid_id = {"$eq":req.query.bid_id};
		}
		
		if(req.query.city){
			query.city = {"$eq":req.query.city};
		}
		if(req.query.deleted){
			query.deleted = {"$eq":req.query.deleted};
		}
		else{
			query.deleted = {"$ne": true};
		}
		//query.active = {"$eq": "X"};
		var config_params = {};
		params_result.forEach(function(val,indx,arr){
			config_params[val.parameter] = val.value;
		});
		var extr_dy = new Date();
		if(config_params['extra_life_time']){
			var newDate = extr_dy.getDate() - (config_params['extra_life_time']);
			extr_dy.setDate(newDate);
		}
		query.bid_valid_to = {"$gte": extr_dy};
		
		if(req.query.user_id){
			query.user_id = {"$eq":req.query.user_id};
			
			Bid.count(query,function(err_count,res_count){
				var count = res_count;
				if(req.query.count && !isNaN(req.query.count))
					count = parseInt(req.query.count);
				
				var skip = (req.query.skip && !isNaN(req.query.skip))?req.query.skip:0;
				if(count && res_count>count && req.query.skip)
					skip = (res_count - count) - (- req.query.skip);
				
				var limit = (req.query.limit && !isNaN(req.query.limit))?req.query.limit:10;
							
				Bid.find(query).sort({"index_count":-1}).skip(parseInt(skip)).limit(parseInt(limit))
				.exec(function(err, result){
					if(err){
						res.json({results: null, error: err, params:{count:count, skip:skip, limit:limit}});
					}
					else{
						var results = [];
						var loopCount = 0;
						
						result.forEach(function(currentValue, index, arr){							
							ctrlCommon.convertFromUTC(currentValue.bid_valid_to,"IST",function(newDate,timeDiff){
								loopCount = loopCount - (-1);
								if(newDate){
									var diffSplit = timeDiff.split(':');
									var hrs = diffSplit[0]; var mins = diffSplit[1];
									
									if(currentValue.bid_valid_from <= (new Date()) && currentValue.bid_valid_to >= (new Date())){
										currentValue.live = true;
										var bidSlotFromDateObj = currentValue.bid_valid_from;
										bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
										bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
									}
									else if(currentValue.bid_valid_from > (new Date())){
										currentValue.live = false;
										var bidSlotFrom = config_params['bid_slot_from'];
										var bidSlotFromDateObj = currentValue.bid_valid_from; //new Date();
										//bidSlotFromDateObj.setHours(parseInt(bidSlotFrom.split(":")[0]));
										//bidSlotFromDateObj.setMinutes(parseInt(bidSlotFrom.split(":")[1]));
										bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
										bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
										bidSlotFrom = bidSlotFromDateObj.getHours() +":"+ ((bidSlotFromDateObj.getMinutes() < 10)?('0'+bidSlotFromDateObj.getMinutes()):bidSlotFromDateObj.getMinutes());
										if(parseInt(bidSlotFrom.split(":")[0]) > 12)
											bidSlotFrom = (parseInt(bidSlotFrom.split(":")[0]) - 12) +":"+ bidSlotFrom.split(":")[1] +"PM";
										else
											bidSlotFrom += "AM";
										var bidStartDate = bidSlotFromDateObj.getDate() +'/'+ (bidSlotFromDateObj.getMonth() - (-1)) +'/'+ bidSlotFromDateObj.getFullYear();
										
										var bidSlotTo = config_params['bid_slot_to'];
										var bidSlotToDateObj = currentValue.bid_valid_to; //new Date();
										//bidSlotToDateObj.setHours(parseInt(bidSlotTo.split(":")[0]));
										//bidSlotToDateObj.setMinutes(parseInt(bidSlotTo.split(":")[1]));
										bidSlotToDateObj.setHours(bidSlotToDateObj.getHours() - (- hrs));
										bidSlotToDateObj.setMinutes(bidSlotToDateObj.getMinutes() - (- mins));
										bidSlotTo = bidSlotToDateObj.getHours() +":"+ ((bidSlotToDateObj.getMinutes() < 10)?('0'+bidSlotToDateObj.getMinutes()):bidSlotToDateObj.getMinutes());
										if(parseInt(bidSlotTo.split(":")[0]) > 12)
											bidSlotTo = (parseInt(bidSlotTo.split(":")[0]) - 12) +":"+ bidSlotTo.split(":")[1] +"PM";
										else
											bidSlotTo += "AM";
										currentValue.liveMsg = "Live on "+bidStartDate+" from "+bidSlotFrom+" to "+bidSlotTo+"!";
									}
									else{
										currentValue.live = false;
										currentValue.liveMsg = "";
										var bidSlotFromDateObj = currentValue.bid_valid_from;
										bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
										bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
									}
									
									currentValue.bid_valid_to = newDate;
									
									var currentDate = new Date();
									currentDate.setHours(currentDate.getHours() - (- hrs));
									currentDate.setMinutes(currentDate.getMinutes() - (- mins));
									if(currentValue.bid_valid_to >= currentDate){//Bids in current date n above
										var clone = JSON.parse(JSON.stringify(currentValue));
										var bid_valid_to = currentValue.bid_valid_to;
										var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
										var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
										var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
										clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
										clone.type = "Bid";
										clone.live = currentValue.live;
										clone.liveMsg = currentValue.liveMsg;
										results.push(clone);
									}
									else{//Bids within extra life time	
										if(currentValue.current_bid_at){	
											var clone = JSON.parse(JSON.stringify(currentValue));
											var bid_valid_to = currentValue.bid_valid_to;
											var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
											var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
											var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
											clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
											clone.type = "Bid";
											clone.sold = true;
											clone.live = currentValue.live;
											clone.liveMsg = currentValue.liveMsg;
											results.push(clone);													
										}
									}
								}
								
								if(loopCount === result.length)
									res.json({results: results, error: err, params:{count:count, skip:skip-(-result.length), limit:limit}});
							});
						},this);
						if(result.length<=0)
							res.json({results: results, error: null, params:{count:count, skip:skip-(-result.length), limit:limit}});
					}
				});
			});
		}
		else{	
			Bid.find(query,function(err, result){
				var results = [];
				var loopCount = 0;
				if(err)
					res.json({results: null, error: err, params:{}});
				else if(result.length<=0)
					res.json({results: results, error: null, params:{}});
				//for(var i=0; i<result.length; i++){
				result.forEach(function(currentValue, index, arr){							
					ctrlCommon.convertFromUTC(currentValue.bid_valid_to,"IST",function(newDate,timeDiff){
						loopCount = loopCount - (-1);
						if(newDate){
							var diffSplit = timeDiff.split(':');
							var hrs = diffSplit[0]; var mins = diffSplit[1];
							if(currentValue.bid_valid_from <= (new Date()) && currentValue.bid_valid_to >= (new Date())){
								currentValue.live = true;
								var bidSlotFromDateObj = currentValue.bid_valid_from;
								bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
								bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
							}
							else if(currentValue.bid_valid_from > (new Date())){
								currentValue.live = false;
								var bidSlotFrom = config_params['bid_slot_from'];
								var bidSlotFromDateObj = currentValue.bid_valid_from; //new Date();
								//bidSlotFromDateObj.setHours(parseInt(bidSlotFrom.split(":")[0]));
								//bidSlotFromDateObj.setMinutes(parseInt(bidSlotFrom.split(":")[1]));
								bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
								bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
								bidSlotFrom = bidSlotFromDateObj.getHours() +":"+ ((bidSlotFromDateObj.getMinutes() < 10)?('0'+bidSlotFromDateObj.getMinutes()):bidSlotFromDateObj.getMinutes());
								if(parseInt(bidSlotFrom.split(":")[0]) > 12)
									bidSlotFrom = (parseInt(bidSlotFrom.split(":")[0]) - 12) +":"+ bidSlotFrom.split(":")[1] +"PM";
								else
									bidSlotFrom += "AM";
								var bidStartDate = bidSlotFromDateObj.getDate() +'/'+ (bidSlotFromDateObj.getMonth() - (-1)) +'/'+ bidSlotFromDateObj.getFullYear();
								
								var bidSlotTo = config_params['bid_slot_to'];
								var bidSlotToDateObj = currentValue.bid_valid_to; //new Date();
								//bidSlotToDateObj.setHours(parseInt(bidSlotTo.split(":")[0]));
								//bidSlotToDateObj.setMinutes(parseInt(bidSlotTo.split(":")[1]));
								bidSlotToDateObj.setHours(bidSlotToDateObj.getHours() - (- hrs));
								bidSlotToDateObj.setMinutes(bidSlotToDateObj.getMinutes() - (- mins));
								bidSlotTo = bidSlotToDateObj.getHours() +":"+ ((bidSlotToDateObj.getMinutes() < 10)?('0'+bidSlotToDateObj.getMinutes()):bidSlotToDateObj.getMinutes());
								if(parseInt(bidSlotTo.split(":")[0]) > 12)
									bidSlotTo = (parseInt(bidSlotTo.split(":")[0]) - 12) +":"+ bidSlotTo.split(":")[1] +"PM";
								else
									bidSlotTo += "AM";
								currentValue.liveMsg = "Live on "+bidStartDate+" from "+bidSlotFrom+" to "+bidSlotTo+"!";
							}
							else{
								currentValue.live = false;
								currentValue.liveMsg = "";
								var bidSlotFromDateObj = currentValue.bid_valid_from;
								bidSlotFromDateObj.setHours(bidSlotFromDateObj.getHours() - (- hrs));
								bidSlotFromDateObj.setMinutes(bidSlotFromDateObj.getMinutes() - (- mins));
							}
							currentValue.bid_valid_to = newDate;
							
							var currentDate = new Date();
							currentDate.setHours(currentDate.getHours() - (- hrs));
							currentDate.setMinutes(currentDate.getMinutes() - (- mins));		
							if(currentValue.bid_valid_to >= currentDate){
								var clone = JSON.parse(JSON.stringify(currentValue));
								var bid_valid_to = currentValue.bid_valid_to;
								var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
								var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
								var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
								clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
								var bid_valid_from = currentValue.bid_valid_from;
								var hrs = (bid_valid_from.getHours()<10)?("0"+bid_valid_from.getHours()):bid_valid_from.getHours();
								var mins = (bid_valid_from.getMinutes()<10)?("0"+bid_valid_from.getMinutes()):bid_valid_from.getMinutes();
								var secs = (bid_valid_from.getSeconds()<10)?("0"+bid_valid_from.getSeconds()):bid_valid_from.getSeconds();
								clone.bid_valid_from = bid_valid_from.getDate()+'/'+(bid_valid_from.getMonth() - (-1))+'/'+bid_valid_from.getFullYear()+'T'+hrs+':'+mins+':'+secs;
								clone.type = "Bid";
								clone.live = currentValue.live;
								clone.liveMsg = currentValue.liveMsg;
								results.push(clone);
							}
							else{												
								if(currentValue.current_bid_at){	
									var clone = JSON.parse(JSON.stringify(currentValue));
									var bid_valid_to = currentValue.bid_valid_to;
									var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
									var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
									var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
									clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
									var bid_valid_from = currentValue.bid_valid_from;
									var hrs = (bid_valid_from.getHours()<10)?("0"+bid_valid_from.getHours()):bid_valid_from.getHours();
									var mins = (bid_valid_from.getMinutes()<10)?("0"+bid_valid_from.getMinutes()):bid_valid_from.getMinutes();
									var secs = (bid_valid_from.getSeconds()<10)?("0"+bid_valid_from.getSeconds()):bid_valid_from.getSeconds();
									clone.bid_valid_from = bid_valid_from.getDate()+'/'+(bid_valid_from.getMonth() - (-1))+'/'+bid_valid_from.getFullYear()+'T'+hrs+':'+mins+':'+secs;
									clone.type = "Bid";
									clone.sold = true;
									clone.live = currentValue.live;
									clone.liveMsg = currentValue.liveMsg;
									results.push(clone);													
								}
							}
						}
								
						if(loopCount === result.length)
							res.json({results: results, error: err, params:{}});
					});
				},this);
				
			});
		}
	});
};
module.exports.addBid = function(req,res){//Add New
	var query_sub = {}
	query_sub.user_id = {"$eq":req.payload.user_id};
	query_sub.active = {"$eq": "X"};
	query_sub.deleted = {"$ne": true};
	UserSubMap.find(query_sub,function(err_sub, result_sub){
		if(result_sub.length>0){						
			var to = (result_sub[0].valid_to).split('/');
			var toDateObj = new Date(to[2]+'-'+to[1]+'-'+to[0]);
			var currentDateObj = new Date();
			if(toDateObj>currentDateObj && parseInt(result_sub[0].remain_post) > 0){
				Counter.getNextSequenceValue('bid',function(sequence){
					if(sequence){
						Parameter.find({parameter:{"$in":["bid_slot_from","bid_slot_to","bid_slot_days"]}},function(params_err, params_result){
							if(params_result && params_result.length>1){
								var config_params = {};
								params_result.forEach(function(val,indx,arr){
									config_params[val.parameter] = val.value;
								});
								var bidSlotFrom = new Date();
								if(config_params['bid_slot_from']){
									bidSlotFrom.setHours(Number(config_params['bid_slot_from'].split(':')[0]));
									bidSlotFrom.setMinutes(Number(config_params['bid_slot_from'].split(':')[1]));
									bidSlotFrom.setSeconds(00);
								}
								var bidSlotTo = new Date();
								if(config_params['bid_slot_to']){
									bidSlotTo.setHours(Number(config_params['bid_slot_to'].split(':')[0]));
									bidSlotTo.setMinutes(Number(config_params['bid_slot_to'].split(':')[1]));
									bidSlotTo.setSeconds(00);
								}
								var bidValidFrom = bidSlotFrom;
								var bidValidTo = bidSlotTo;
								var daysInWeeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
								if(bidSlotFrom <= (new Date())){
									bidValidFrom.setDate(bidValidFrom.getDate() - (-1));
									bidValidTo.setDate(bidValidTo.getDate() - (-1));
									
									while(config_params['bid_slot_days'].indexOf(daysInWeeks[bidValidFrom.getDay()]) == -1){
										bidValidFrom.setDate(bidValidFrom.getDate() - (-1));
										bidValidTo.setDate(bidValidTo.getDate() - (-1));
									}
								}
								
								var index_count = sequence.sequence_value;//1;
								var d = new Date();
								var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
								
								var doc = req.body;
								doc.index_count = index_count;
								doc.bid_id = "BID_"+index_count;//bid_id;
								doc.bid_valid_from = bidValidFrom;
								doc.createdAt = d;
								doc.changedAt = d;
								doc.createdBy = req.payload.user_id;
								doc.changedBy = req.payload.user_id;
								doc.active = "X";
								doc.bid_status = 'Active';
								doc.bid_valid_to = bidValidTo;	
								
								
								if(doc.current_bid_amount && !isNaN(doc.current_bid_amount)){
									if(parseFloat(doc.current_bid_amount) >= 10000000){//Crore
										var amt = (parseFloat(doc.current_bid_amount)/10000000).toFixed(2);
										doc.display_amount = amt + "Cr";
									}
									else if(parseFloat(doc.current_bid_amount) >= 100000){//Lakhs
										var amt = (parseFloat(doc.current_bid_amount)/100000).toFixed(2);
										doc.display_amount = amt + "L";
									}
									else{//Thousands
										var amt = (parseFloat(doc.current_bid_amount)/1000).toFixed(2);
										doc.display_amount = amt + "K";
									}
								}
							
								var postLife = 0;
								for(var i = 0; i<result_sub.length; i++){
									if(postLife < parseInt(result_sub[i].post_day)){
										postLife = parseInt(result_sub[i].post_day);
									}
								}
																
								let newBid = new Bid(doc);
								newBid.save((err, result)=>{
											if(err){
												res.json({statusCode: 'F', msg: 'Failed to add', error: err});
											}
											else{
												res.json({statusCode: 'S', msg: 'Entry added', result: result});
												//Deduct Post Remains
												var d = new Date();
												var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
																		
												UserSubMap.findOneAndUpdate({_id: result_sub[0]._id},{$set:{changedAt: d}, $inc:{remain_post: -1}},{},(err_subUpdate, result_subUpdate)=>{
													
												});						
											
												//Trigger Notification
												var entry = doc; entry.transactionType = "Bid"; entry.bid_id = result.bid_id;
												ctrlNotification.sendNotification(entry);
											}
								});
							}
							else{
								res.json({statusCode:"F", msg:"Unable to determine bid time slot.", error:params_err});
							}
						});			
					}
					else{
						res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
					}
				});
			}
			else{
				res.json({statusCode: 'F', msg: 'Either Subscription is expired or no Post is left in your account.'});
			}
		}
		else{
			res.json({statusCode: 'F', msg: 'Subscription unavailable.', error: err_sub});
		}
	});
};

/*
module.exports.addBid = function(req,res){//Add New
	var query_sub = {}
	query_sub.user_id = {"$eq":req.payload.user_id};
	query_sub.active = {"$eq": "X"};
	query_sub.deleted = {"$ne": true};
	UserSubMap.find(query_sub,function(err_sub, result_sub){
		if(result_sub.length>0){
						
			var to = (result_sub[0].valid_to).split('/');
			var toDateObj = new Date(to[2]+'-'+to[1]+'-'+to[0]);
			var currentDateObj = new Date();
			if(toDateObj>currentDateObj && parseInt(result_sub[0].remain_post) > 0){
				//var bid_id = "1";
				Counter.getNextSequenceValue('bid',function(sequence){
					if(sequence){
						var index_count = sequence.sequence_value;//1;
				
					var d = new Date();
					var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
					
					var doc = req.body;
					doc.index_count = index_count;
					doc.bid_id = "BID_"+index_count;//bid_id;
					doc.bid_valid_from = d;
					doc.createdAt = d;
					doc.changedAt = d;
					doc.createdBy = req.payload.user_id;
					doc.changedBy = req.payload.user_id;
					//if(doc.bid_status === 'Active')
						doc.active = "X";
					doc.bid_status = 'Active';
						
					if(doc.bid_valid_to){
						var date_split = [];
						var time_split = [];
						var date_part = ((doc.bid_valid_to).split('T'))[0];
						var time_part = ((doc.bid_valid_to).split('T'))[1];
						if(date_part)
							date_split = (date_part).split('/');
						if(time_part)
							time_split = (time_part).split(':');
							
						if(date_split[0] && date_split[1] && date_split[2] && time_split[0] && time_split[1])
							doc.bid_valid_to = new Date(date_split[1]+'/'+date_split[0]+'/'+date_split[2] +' '+ time_split[0]+':'+time_split[1]+':00');
						else
							doc.bid_valid_to = new Date();
					}
					
					//For testing purpose (to be removed)
					if(doc.testing)
						doc.variant = index_count;
					
					if(doc.current_bid_amount && !isNaN(doc.current_bid_amount)){
						if(parseFloat(doc.current_bid_amount) >= 10000000){//Crore
							var amt = (parseFloat(doc.current_bid_amount)/10000000).toFixed(2);
							doc.display_amount = amt + "Cr";
						}
						else if(parseFloat(doc.current_bid_amount) >= 100000){//Lakhs
							var amt = (parseFloat(doc.current_bid_amount)/100000).toFixed(2);
							doc.display_amount = amt + "L";
						}
						else{//Thousands
							var amt = (parseFloat(doc.current_bid_amount)/1000).toFixed(2);
							doc.display_amount = amt + "K";
						}
					}
					
					
						var postLife = 0;
						for(var i = 0; i<result_sub.length; i++){
							if(postLife < parseInt(result_sub[i].post_day)){
								postLife = parseInt(result_sub[i].post_day);
							}
						}
						
						
						ctrlCommon.convertToUTC(doc.bid_valid_to,"IST",function(newDate){
							//console.log(newDate);
							if(newDate){
								doc.bid_valid_to = newDate;
								let newBid = new Bid(doc);
								
								newBid.save((err, result)=>{
									if(err){
										res.json({statusCode: 'F', msg: 'Failed to add', error: err});
									}
									else{
										res.json({statusCode: 'S', msg: 'Entry added', result: result});
										//Deduct Post Remains
										var d = new Date();
										var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
										//var updateSubscription = result_sub[0];
										//updateSubscription.changedAt = at;
										//updateSubscription.remain_post = result_sub[0].remain_post - 1;							
										UserSubMap.findOneAndUpdate({_id: result_sub[0]._id},{$set:{changedAt: d}, $inc:{remain_post: -1}},{},(err_subUpdate, result_subUpdate)=>{
											
										});						
									
										//Trigger Notification
										var entry = doc; entry.transactionType = "Bid";
										ctrlNotification.sendNotification(entry);
									}
								});
							}
							else{
								res.json({statusCode: 'F', msg: 'Unable to convert date.', error: null});
							}
						});
							
					//});
					
					
				//});
					}
					else{
						res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
					}
				});
			}
			else{
				res.json({statusCode: 'F', msg: 'Either Subscription is expired or no Post is left in your account.'});
			}
		}
		else{
			res.json({statusCode: 'F', msg: 'Subscription unavailable.', error: err_sub});
		}
	});
};*/

module.exports.updateBid = function(req,res){//Update
	var d = new Date();
	var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
	var doc = req.body;
	delete doc.createdAt;
	delete doc.createdBy;
	doc.changedBy = req.payload.user_id;
	doc.changedAt = d;
	if(doc.bid_status === 'Active')
		doc.active = "X";
	else
		doc.active = "";
				
	if(doc.current_bid_amount && !isNaN(doc.current_bid_amount)){
		if(parseFloat(doc.current_bid_amount) >= 10000000){//Crore
			var amt = (parseFloat(doc.current_bid_amount)/10000000).toFixed(2);
			doc.display_amount = amt + "Cr";
		}
		else if(parseFloat(doc.current_bid_amount) >= 100000){//Lakhs
			var amt = (parseFloat(doc.current_bid_amount)/100000).toFixed(2);
			doc.display_amount = amt + "L";
		}
		else{//Thousands
			var amt = (parseFloat(doc.current_bid_amount)/1000).toFixed(2);
			doc.display_amount = amt + "K";
		}
	}
	
	delete doc.bid_valid_from;
	delete doc.bid_valid_to;
	if(req.bidValidTo){
		doc.bid_valid_to = new Date(req.bidValidTo);
	}
	
	if(doc.msg === 'D'){
		d.setDate(d.getDate()-1);
		doc.bid_valid_to = d;
		doc.active = "";
	}
	
	Bid.findOneAndUpdate({_id:doc._id},{$set: doc},{},(err, updated)=>{
		if(err){
			res.json({statusCode: 'F', msg: 'Failed to update', error: err});
		}
		else{
			if(doc.msg === 'D'){
				ChatInbox.update({post_id: doc.bid_id}, {"$set": {post_deletion: true}}, {multi: true}, (updateChat_err, updateChat_res)=>{ });
				Fav.remove({bid_sell_buy_id: doc.bid_id}, function(fav_err,fav_result){ });
			}
			res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
		}
	});
	
};

/*module.exports.updateBid = function(req,res){//Update
	var d = new Date();
	var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
	var doc = req.body;
		delete doc.createdAt;
		delete doc.createdBy;
		doc.changedBy = req.payload.user_id;
		doc.changedAt = d;
	if(doc.bid_status === 'Active')
		doc.active = "X";
	else
		doc.active = "";
	//console.log(doc.bid_valid_to);
	if(doc.bid_valid_to && (typeof doc.bid_valid_to) === "string"){
		var date_split = [];
		var time_split = [];
		var date_part = ((doc.bid_valid_to).split('T'))[0];
		var time_part = ((doc.bid_valid_to).split('T'))[1];
		if(date_part)
			date_split = (date_part).split('/');
		if(time_part)
			time_split = (time_part).split(':');
				
		if(date_split[0] && date_split[1] && date_split[2] && time_split[0] && time_split[1])
			doc.bid_valid_to = new Date(date_split[1]+'/'+date_split[0]+'/'+date_split[2] +' '+ time_split[0]+':'+time_split[1]+':00');
		else
			doc.bid_valid_to = new Date();
	}
		
	
		
	if(doc.current_bid_amount && !isNaN(doc.current_bid_amount)){
						if(parseFloat(doc.current_bid_amount) >= 10000000){//Crore
							var amt = (parseFloat(doc.current_bid_amount)/10000000).toFixed(2);
							doc.display_amount = amt + "Cr";
						}
						else if(parseFloat(doc.current_bid_amount) >= 100000){//Lakhs
							var amt = (parseFloat(doc.current_bid_amount)/100000).toFixed(2);
							doc.display_amount = amt + "L";
						}
						else{//Thousands
							var amt = (parseFloat(doc.current_bid_amount)/1000).toFixed(2);
							doc.display_amount = amt + "K";
						}
	}
	
	ctrlCommon.convertToUTC(doc.bid_valid_to,"IST",function(newDate){
		if(newDate){
			doc.bid_valid_to = newDate;
			if(req.bidValidTo){
				doc.bid_valid_to = new Date(req.bidValidTo);
			}
			if(doc.msg === 'D'){
				d.setDate(d.getDate()-1);
				doc.bid_valid_to = d;//d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() +"T00:00:00";
				doc.active = "";
			}
			Bid.findOneAndUpdate({_id:doc._id},{$set: doc},{},(err, updated)=>{
				if(err){
					res.json({statusCode: 'F', msg: 'Failed to update', error: err});
				}
				else{
					if(doc.msg === 'D'){
						ChatInbox.update({post_id: doc.bid_id}, {"$set": {post_deletion: true}}, {multi: true}, (updateChat_err, updateChat_res)=>{ });
						Fav.remove({bid_sell_buy_id: doc.bid_id}, function(fav_err,fav_result){ });
					}
					res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
				}
			});
		}
		else{
			res.json({statusCode: 'F', msg: 'Unable to convert date.', error: null});
		}
	});
};*/

module.exports.deleteBid = function(req,res){//Delete
	Bid.remove({bid_id: req.params.id}, function(post_err,post_result){
		if(post_err){
			res.json({statusCode:"F", msg:"Unable to delete the Post.", error:post_err});
		}
		else{
			ChatInbox.update({post_id: req.params.id}, {"$set": {post_deletion: true}}, {multi: true}, (updateChat_err, updateChat_res)=>{

			});
			Fav.remove({bid_sell_buy_id: req.params.id}, function(fav_err,fav_result){ });
			BidBy.remove({bid_id: req.params.id}, function(bidby_err,bidby_result){
				if(bidby_err){
					res.json({statusCode:"F", msg:"Unable to delete the Participants.", error:bidby_err});
				}
				else{
					Thumbnail.remove({transaction_id: req.params.id}, function(thumbnail_err,thumbnail_result){
						if(thumbnail_err){
							res.json({statusCode:"F", msg:"Unable to delete the Thumbnails.", error:thumbnail_err});
						}
						else{
							Image.remove({transaction_id: req.params.id}, function(image_err,image_result){
								if(image_err){
									res.json({statusCode:"F", msg:"Unable to delete the Images.", error:image_err});
								}
								else{
									res.json({
										statusCode:"S", 
										msg:"Successfully deleted the Post.",
										error:null, 
										post:post_result, 
										thumbnail:thumbnail_result, 
										image:image_result
									});
								}
							});
						}
					});
				}
			});
		}
	});
};
