var Mailgun = require('mailgun-js');
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
const googleMailAPI = require('../gmail');

//////////////////////////Send Notification////////////////////////////////
var Profile = mongoose.model('Profile');
var UserSubMap = mongoose.model('UserSubMap');
var UserAlert = mongoose.model('UserAlert');
var Parameter = mongoose.model('Parameter');
var DeviceReg = mongoose.model('DeviceReg');
var ChatInbox = mongoose.model('ChatInbox');
var BidBy = mongoose.model('BidBy');

module.exports.sendNotification = function(doc){//Send
	//Get API Keys
	Parameter.find({},function(err, result){
		var params = {};
		if(result){
				for(var p =0; p<result.length; p++){
					params[result[p].parameter] = result[p].value;
				}

				//Trigger Notification	
				var query_alert = {"$and":[]};
				var andCondtn = [
					{user_id: {"$ne": doc.user_id}},
					{deleted: {"$ne": true}},
					{active: {"$eq": true}}
				];
				//query_alert.deleted = {"$ne": true};
				//query_alert.active = {"$eq": true};
				
				if(doc.transactionType){
					//var orCondtn = [];
					andCondtn.push({bid_sell_buy: {"$in": [doc.transactionType, 'All', '', null]}});
					//orCondtn.push({bid_sell_buy: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.listing_by){
					//var orCondtn = [];
					andCondtn.push({individual_dealer: {"$in": [doc.listing_by, 'All', '', null]}});
					//orCondtn.push({individual_dealer: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.product_type_name){
					//var orCondtn = [];
					andCondtn.push({product_type_name: {"$in": [doc.product_type_name, 'All', '', null]}});
					//orCondtn.push({product_type_name: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.brand_name){
					//var orCondtn = [];
					andCondtn.push({brand_name: {"$in": [doc.brand_name, 'All', '', null]}});
					//orCondtn.push({brand_name: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.model){
					//var orCondtn = [];
					andCondtn.push({model: {"$in": [doc.model, 'All', '', null]}});
					//orCondtn.push({model: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.variant){
					//var orCondtn = [];
					andCondtn.push({variant: {"$in": [doc.variant, 'All', '', null]}});
					//orCondtn.push({variant: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.fuel_type){
					//var orCondtn = [];
					andCondtn.push({fuel_type: {"$in": [doc.fuel_type, 'All', '', null]}});
					//orCondtn.push({fuel_type: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}					
				if(doc.city){
					//var orCondtn = [];
					andCondtn.push({city: {"$in": [doc.city, 'All', '', null]}});	
					//orCondtn.push({city: null});
					//var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					//andCondtn.push(orCondtnObj);
				}
				if(doc.place_of_reg){
					andCondtn.push({place_of_reg: {"$in": [doc.place_of_reg, 'All', '', null]}});	
				}
				if(doc.accident_history){
					andCondtn.push({accident_history: {"$in": [doc.accident_history, 'All', '', null]}});	
				}
				if(doc.current_bid_amount){
					/*orCondtn.push({
						"$and": [ {"$or":[
								{price_from: {"$lte": doc.current_bid_amount}},
								{price_from: {"$exists":false}}, 
								{price_from: {"$type":10}}
								]},
							{"$or":[
								{price_to: {"$gte": doc.current_bid_amount}},
								{price_to: {"$exists":false}}, 
								{price_to: {"$type":10}}
								]}
							 ]
					});*/
					//orCondtn.push({price_to: {"$gte": doc.current_bid_amount}});
					var orCondtn = [];
					if(!isNaN(doc.current_bid_amount))
						doc.current_bid_amount = Number(doc.current_bid_amount);
					orCondtn.push({
						price_from: {"$lte": doc.current_bid_amount},
						price_to: {"$gte": doc.current_bid_amount}
					});
					orCondtn.push({
						price_from: {"$lte": doc.current_bid_amount},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$lte": doc.current_bid_amount},
						price_to: {"$eq": ""}
					});
					orCondtn.push({
						price_from: {"$lte": doc.current_bid_amount},
						price_to: {"$type": 10}
					});*/
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$gte": doc.current_bid_amount}
					});
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$eq": ""},
						price_to: {"$gte": doc.current_bid_amount}
					});
					orCondtn.push({
						price_from: {"$type": 10},
						price_to: {"$gte": doc.current_bid_amount}
					});*/
					var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					andCondtn.push(orCondtnObj);
				}
				if(doc.net_price){
					/*orCondtn.push({price_from: {"$lte": doc.net_price}});
					orCondtn.push({price_to: {"$gte": doc.net_price}});*/
					var orCondtn = [];
					if(!isNaN(doc.net_price))
						doc.net_price = Number(doc.net_price);
					orCondtn.push({
						price_from: {"$lte": doc.net_price},
						price_to: {"$gte": doc.net_price}
					});
					orCondtn.push({
						price_from: {"$lte": doc.net_price},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$lte": doc.net_price},
						price_to: {"$eq": ""}
					});
					orCondtn.push({
						price_from: {"$lte": doc.net_price},
						price_to: {"$type": 10}
					});*/
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$gte": doc.net_price}
					});
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$eq": ""},
						price_to: {"$gte": doc.net_price}
					});
					orCondtn.push({
						price_from: {"$type": 10},
						price_to: {"$gte": doc.net_price}
					});*/
					var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					andCondtn.push(orCondtnObj);
				}
				if(doc.start_from_amount){
					/*orCondtn.push({price_from: {"$lte": doc.start_from_amount}});
					orCondtn.push({price_to: {"$gte": doc.start_from_amount}});*/
					var orCondtn = [];
					if(!isNaN(doc.start_from_amount))
						doc.start_from_amount = Number(doc.start_from_amount);
					orCondtn.push({
						price_from: {"$lte": doc.start_from_amount},
						price_to: {"$gte": doc.start_from_amount}
					});
					orCondtn.push({
						price_from: {"$lte": doc.start_from_amount},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$lte": doc.start_from_amount},
						price_to: {"$eq": ""}
					});
					orCondtn.push({
						price_from: {"$lte": doc.start_from_amount},
						price_to: {"$type": 10}
					});*/
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$gte": doc.start_from_amount}
					});
					orCondtn.push({
						price_from: {"$eq": null},
						price_to: {"$eq": null}
					});
					/*orCondtn.push({
						price_from: {"$eq": ""},
						price_to: {"$gte": doc.start_from_amount}
					});
					orCondtn.push({
						price_from: {"$type": 10},
						price_to: {"$gte": doc.start_from_amount}
					});*/
					var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					andCondtn.push(orCondtnObj);
				}
				
				if(doc.km_done){
					/*orCondtn.push({km_run_from: {"$lte": doc.km_done}});
					orCondtn.push({km_run_to: {"$gte": doc.km_done}});*/
					var orCondtn = [];
					if(!isNaN(doc.km_done))
						doc.km_done = Number(doc.km_done);
					orCondtn.push({
						km_run_from: {"$lte": doc.km_done},
						km_run_to: {"$gte": doc.km_done}
					});
					orCondtn.push({
						km_run_from: {"$lte": doc.km_done},
						km_run_to: {"$eq": null}
					});
					/*orCondtn.push({
						km_run_from: {"$lte": doc.km_done},
						km_run_to: {"$eq": ""}
					});
					orCondtn.push({
						km_run_from: {"$lte": doc.km_done},
						km_run_to: {"$type": 10}
					});*/
					orCondtn.push({
						km_run_from: {"$eq": null},
						km_run_to: {"$gte": doc.km_done}
					});
					orCondtn.push({
						km_run_from: {"$eq": null},
						km_run_to: {"$eq": null}
					});
					/*orCondtn.push({
						km_run_from: {"$eq": ""},
						km_run_to: {"$gte": doc.km_done}
					});
					orCondtn.push({
						km_run_from: {"$type": 10},
						km_run_to: {"$gte": doc.km_done}
					});*/
					var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					andCondtn.push(orCondtnObj);
				}
				if(doc.year_of_reg){
					/*orCondtn.push({year_of_reg_from: {"$lte": doc.year_of_reg}});
					orCondtn.push({year_of_reg_to: {"$gte": doc.year_of_reg}});*/
					var orCondtn = [];
					if(!isNaN(doc.year_of_reg))
						doc.year_of_reg = Number(doc.year_of_reg);
					orCondtn.push({
						year_of_reg_from: {"$lte": doc.year_of_reg},
						year_of_reg_to: {"$gte": doc.year_of_reg}
					});
					orCondtn.push({
						year_of_reg_from: {"$lte": doc.year_of_reg},
						year_of_reg_to: {"$eq": null}
					});
					/*orCondtn.push({
						year_of_reg_from: {"$lte": doc.year_of_reg},
						year_of_reg_to: {"$eq": ""}
					});
					orCondtn.push({
						year_of_reg_from: {"$lte": doc.year_of_reg},
						year_of_reg_to: {"$type": 10}
					});*/
					orCondtn.push({
						year_of_reg_from: {"$eq": null},
						year_of_reg_to: {"$gte": doc.year_of_reg}
					});
					orCondtn.push({
						year_of_reg_from: {"$eq": null},
						year_of_reg_to: {"$eq": null}
					});
					/*orCondtn.push({
						year_of_reg_from: {"$eq": ""},
						year_of_reg_to: {"$gte": doc.year_of_reg}
					});
					orCondtn.push({
						year_of_reg_from: {"$type": 10},
						year_of_reg_to: {"$gte": doc.year_of_reg}
					});*/
					var orCondtnObj = {}; orCondtnObj["$or"] = orCondtn;
					andCondtn.push(orCondtnObj);
				}
				
				/*var andCondtn = [
					{deleted: {"$ne": true}},
					{active: {"$eq": true}}
				];				
				if(doc.listing_by){
					andCondtn.push({individual_dealer: {"$in": [doc.listing_by, 'All', '', null]}});					
				}*/
				query_alert["$and"] = andCondtn;
				
				console.log(query_alert);
				//console.log(orCondtn);
				UserAlert.find(query_alert,function(err_alert, result_alert){
						console.log(result_alert);
							if(err_alert){
								console.log(err_alert);
							}
							else{
								result_alert.forEach(function(entry_alert,i,arr){
										var query_userSub = {};
										query_userSub.user_id = {"$eq": entry_alert.user_id};
										query_userSub.active = {"$eq": "X"};	
										query_userSub.deleted = {"$ne": true};	
										//Send SMS
										if(entry_alert.sms){
												UserSubMap.find(query_userSub,function(err_userSub, result_userSub){
													if(err_userSub){
														console.log(err_userSub);
													}
													else{
														var sms_sent = false;
														for(var j = 0; j<result_userSub.length; j++){
															if(result_userSub[j].notification_sms === 'X' && !sms_sent){
																var query_profile = {};
																query_profile.user_id = {"$eq": result_userSub[j].user_id};
																query_profile.deleted = {"$ne": true};
																Profile.find(query_profile,function(profile_err, profiles){
																	if(profiles.length > 0){
																		if(profiles[0].mobile){
																			var routePath = '/';
																			if(doc.transactionType == 'Sale')
																				routePath += 'Sell/'+doc.sell_id;
																			else if(doc.transactionType == 'Buy')
																				routePath += 'Buy/'+doc.buy_req_id;
																			else if(doc.transactionType == 'Bid')
																				routePath += 'Bid/'+doc.bid_id;
																			else if(doc.transactionType == 'Service')
																				routePath += 'Service/'+doc.service_id;
																			var routeLink = 'https://motoclique.in/Container'+routePath;
																			var msgBody = 'Check out the new '+doc.transactionType+
																			' post of '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																			((doc.fuel_type)?doc.fuel_type:'')+
																			((doc.display_amount)?(', priced at Rs.'+doc.display_amount):'')+
																			((doc.year_of_reg)?(', registered on '+doc.year_of_reg):'')+
																			((doc.km_done)?(', '+doc.km_done+'km runned'):'')+
																			((doc.location)?(', located at '+doc.location):'')+
																			'. '+
																			routeLink+' ';
																			request.get({
																				url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
																			},
																			function(err_sms,httpResponse,body){
																				console.log(err_sms);
																			});
																			sms_sent = true;
																		}
																	}
																});
															}												
														}
													}
												});
										}
										//Send EMAIL
										if(entry_alert.email){
												UserSubMap.find(query_userSub,function(err_userSub, result_userSub){
													console.log(result_userSub);
													if(err_userSub){
														console.log(err_userSub);
													}
													else{
														var email_sent = false;
														var mailgun = new Mailgun({apiKey: params.email_api_key, domain: params.email_api_id});
														for(var j = 0; j<result_userSub.length; j++){												
															if(result_userSub[j].notification_email === 'X' && !email_sent){
																var query_profile = {};
																query_profile.user_id = {"$eq": result_userSub[j].user_id};
																query_profile.deleted = {"$ne": true};
																Profile.find(query_profile,function(profile_err, profiles){
																	if(profiles.length > 0){
																		if(profiles[0].email){
																			var routePath = '/';
																			if(doc.transactionType == 'Sale')
																				routePath += 'Sell/'+doc.sell_id;
																			else if(doc.transactionType == 'Buy')
																				routePath += 'Buy/'+doc.buy_req_id;
																			else if(doc.transactionType == 'Bid')
																				routePath += 'Bid/'+doc.bid_id;
																			else if(doc.transactionType == 'Service')
																				routePath += 'Service/'+doc.service_id;
																			var msgBody = '<html>'+
																								'<body>'+
																									'<div style="min-height: 500px; width: 100%;">'+
																									'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																									'<div style="min-height: 100px; text-align: center;">'+
																									'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																									'</div>'+
																									'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">'+doc.transactionType+'</div>'+
																									'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																									'<span style="display:'+((doc.brand_name)?"inline;":"none;")+'">'+doc.brand_name+'</span>'+
																									'<span style="display:'+((doc.model)?"inline;":"none;")+'">'+doc.model+'</span>'+
																									'<span style="display:'+((doc.variant)?"inline;":"none;")+'">'+doc.variant+'</span>'+
																									'</div>'+
																									'<div style="text-align: center;"><a style="background:#e71b03; color: white !important;  line-height: 30px; width: 90%; text-decoration: none; padding-top: 8px; padding-bottom: 8px; padding-left: calc(50% - 50px); padding-right: calc(50% - 50px);" href="https://motoclique.in/Container'+routePath+'">OPEN</a></div>'+
																									'<div style="border: 1px dashed #E71B03; margin: 20px; padding: 10px; font-family: Arial;">'+
																									'<div style="font-size: 14px; width: 200px; margin-left: auto; margin-right: auto;">'+
																									'<div style="line-height: 28px; display:'+((doc.fuel_type)?"block;":"none;")+'">Fuel Type: <span style="font-size: 15px; font-weight: 600;">'+doc.fuel_type+'</span></div>'+
																									'<div style="line-height: 28px; display:'+((doc.display_amount)?"block;":"none;")+'">Price: <span style="font-size: 15px; font-weight: 600;">'+doc.display_amount+'</span></div>'+
																									'<div style="line-height: 28px; display:'+((doc.location)?"block;":"none;")+'">Location: <span style="font-size: 15px; font-weight: 600;">'+doc.location+'</span></div>'+
																									'<div style="line-height: 28px; display:'+((doc.year_of_reg)?"block;":"none;")+'">Year of Registration: <span style="font-size: 15px; font-weight: 600;">'+doc.year_of_reg+'</span></div>'+
																									'<div style="line-height: 28px; display:'+((doc.km_done)?"block;":"none;")+'">KM Done: <span style="font-size: 15px; font-weight: 600;">'+doc.km_done+'</span></div>'+
																									'</div>'+
																									'</div>'+
																									'<div style="font-size:12px; color:#A4A4A4; padding:2px;">You have received this mail because you have created an alert at MotoClique application. You can always unsubscribe from the alert, by deleting or changing the alert.</div>'+
																									'<div style="font-size:12px; color:#A4A4A4; padding:2px;">Please do not reply to this mail as this is auto generated email.</div>'+
																									'</div>'+
																									'</div>'+
																								'</body>'+
																							'</html>';
																			
																			
																			var data = {
																					to: profiles[0].email,
																					subject: doc.brand_name+' '+doc.model,
																					message: msgBody
																				};
																			googleMailAPI.sendEmail(data);
																			email_sent = true;
																		}
																	}
																});
																
															}
														}
													}
												});
										}
										//Send App Alert
										if(entry_alert.app){
												UserSubMap.find(query_userSub,function(err_userSub, result_userSub){
													console.log(result_userSub);
													if(err_userSub){
														console.log(err_userSub);
													}
													else{
														var pushNot_sent = false;
														for(var j = 0; j<result_userSub.length; j++){												
															if(result_userSub[j].notification_app === 'X' && !pushNot_sent){
																doc.to_user = entry_alert.user_id;
																module.exports.sendAlertPushNotification(doc);
																pushNot_sent = true;
															}
														}
													}
												});
										}
										
										
										
										
										
										
										
										
										
										
								});
							}
				});
	


		}
	});

	
};


module.exports.sendAppPushNotification = function(msgBody,user_id){//Send push notification to app
	//Get User Device reg id
	DeviceReg.find({user_id: user_id},function(err_reg, result_reg){
		if(result_reg && result_reg.length>0){
			var device_reg_id = result_reg[0].device_reg_id;
			//Get API Keys
			Parameter.find({},function(err_param, result_param){
				var params = {};
				if(result_param){
					for(var p =0; p<result_param.length; p++){
						params[result_param[p].parameter] = result_param[p].value;
					}
					
					msgBody.to = device_reg_id;
					request.post({
							url:'https://fcm.googleapis.com/fcm/send', 
							body: JSON.stringify(msgBody),
							headers: {
								'content-type': 'application/json',
								'Authorization': 'Key='+params['fcm_server_logical_key']
							}
						},
						function(err_push,httpResponse,body){
							console.log(err_push);
						}
					);
				}
			});
		}
	});
};


module.exports.sendChatPushNotification = function(doc){//Send push notification to app for chat
	
	module.exports.getNewChatCount(doc.to_user,function(mcount){
		var messageCount = 1;
		if(mcount){
			messageCount = mcount;
		}
		module.exports.sendAppPushNotification(
				{
					"to": '-',
					"data": {
						"title": "New Chat", //doc.from_user_name,
						"message": doc.from_user_name+": "+doc.text,
						"style": "inbox",
						'content-available': '1',
						"badge": messageCount
					}
				},
				doc.to_user
		);
	});
};

module.exports.sendAlertPushNotification = function(doc){//Send push notification to app for post alert
					
	var not_id = 0;
	var alert_title = '';
	if(doc.sell_id) { not_id = parseInt('1'+((doc.sell_id).split('_'))[1]); alert_title = 'Sale'}
	else if(doc.buy_req_id) { not_id = parseInt('1'+((doc.buy_req_id).split('_'))[1]); alert_title = 'Buy Request'}
	else if(doc.bid_id) { not_id = parseInt('1'+((doc.bid_id).split('_'))[1]); alert_title = 'Bid'}
	else if(doc.service_id) { not_id = parseInt('1'+((doc.service_id).split('_'))[1]); alert_title = 'Service'}
	module.exports.sendAppPushNotification(
				{
					"to": "-",
					"data": {
						"title": alert_title,
						"message": doc.product_type_name +' '+ doc.brand_name +' '+ doc.model +' '+ doc.variant,
						"notId": not_id,
						'content-available': '1'
					}
				},
				doc.to_user
	);
};


//******** Not In Use ******
module.exports.sendAppBadgeCount = function(doc){//Send push notification for increasing badge count to app
					request.post({
							url:'https://fcm.googleapis.com/fcm/send', 
							body: JSON.stringify({
								"data":{
									"badge":"true",
								},
								"to": doc.device_reg_id,
								"priority":"high"
							}),
							headers: {
								'content-type': 'application/json',
								'Authorization': 'Key='+doc['fcm_server_logical_key']
							}
						},
						function(err_push,httpResponse,body){
							console.log(err_push);
						});
};





module.exports.getNewChatCount = function(user_id,callback){//Fetch the count of new incoming chats
	var query = {};
	var or_query = [];
	or_query.push({from_user: {"$eq":user_id}, from_read: {"$eq": false}, from_deleted: {"$ne": true}});
	or_query.push({to_user: {"$eq":user_id}, to_read: {"$eq": false}, to_deleted: {"$ne": true}});
	query['$or'] = or_query;
	ChatInbox.find(query,function(err, newChats){
	    if(err){
	      callback(null);
	    }
	    else if(newChats.length>0){
			var chatCounts = 0;
			newChats.forEach(function(item,index,arr){
				if(user_id == item.from_user)
					chatCounts = chatCounts - (- item.from_unread_count);
				else if(user_id == item.to_user)
					chatCounts = chatCounts - (- item.to_unread_count);
			});
			callback(chatCounts);
		}
		else{
			callback(0);
		}
	});
};

module.exports.sendBidClosedNotification = function(doc){//Send
	var bidby_query = {};
	bidby_query.bid_id = {"$eq":doc.bid_id};
	bidby_query.deleted = {"$ne": true};
	BidBy.find(bidby_query,function(bidby_err, bidby_result){
		if(bidby_result && bidby_result.length>0){
			bidby_result.sort(function(a,b){
				if (a.bid_date_time < b.bid_date_time)
					return 1;
				if (a.bid_date_time > b.bid_date_time)
					return -1;
				return 0;
			});//descending sort
							var bidWinner = bidby_result[0];
							//Get API Keys
							Parameter.find({},function(params_err, params_result){
								var params = {};
								if(params_result){
										for(var p =0; p<params_result.length; p++){
											params[params_result[p].parameter] = params_result[p].value;
										}			
										
										var creator_query = {};
										creator_query.user_id = {"$eq": doc.user_id};
										creator_query.deleted = {"$ne": true};
										Profile.find(creator_query,function(creator_profile_err, creator_profiles){
											if(creator_profiles && creator_profiles.length > 0){
												var query_profile = {};
												query_profile.user_id = {"$eq": bidWinner.bid_by_user_id};
												query_profile.deleted = {"$ne": true};
												Profile.find(query_profile,function(profile_err, profiles){
													if(profiles && profiles.length > 0){
														
														//Send SMS (to participant)
														if(profiles[0].mobile){																			
															var msgBody = 'Congratulation '+profiles[0].name+
																			', you have won the BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																			((doc.fuel_type)?doc.fuel_type:'')+
																			((doc.display_amount)?(', with the Final Amount Rs.'+doc.display_amount+'.'):'.')+
																			' Please contact '+creator_profiles[0].name+
																			' for further process of delivery and transitions. - Team MotoClique';
															request.get({
																url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
															},
															function(err_sms,httpResponse,body){
																console.log(err_sms);
															});
														}
														//Send SMS (to creator)
														if(creator_profiles[0].mobile){																			
															var msgBody = 'Congratulation '+profiles[0].name+
																			', you have won the BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																			((doc.fuel_type)?doc.fuel_type:'')+
																			((doc.display_amount)?(', with the Final Amount Rs.'+doc.display_amount+'.'):'.')+
																			' Please contact '+creator_profiles[0].name+
																			' for further process of delivery and transitions. - Team MotoClique';
															request.get({
																url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+creator_profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
															},
															function(err_sms,httpResponse,body){
																console.log(err_sms);
															});
														}
														
														//Send EMAIL (to participant)
														if(profiles[0].email){														
															var msgBody = '<html>'+
																				'<body>'+
																					'<div style="min-height: 500px; width: 100%;">'+
																					'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																					'<div style="min-height: 100px; text-align: center;">'+
																					'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																					'</div>'+
																					'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">Congratulation</div>'+
																					'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																					'Congratulation '+profiles[0].name+', you have won the BID for '+
																					'<span style="display:'+((doc.brand_name)?"inline;":"none;")+'">'+doc.brand_name+'</span>'+
																					'<span style="display:'+((doc.model)?"inline;":"none;")+'">'+doc.model+'</span>'+
																					'<span style="display:'+((doc.variant)?"inline;":"none;")+'">'+doc.variant+'</span>'+
																					', with the Final Amount Rs.'+
																					'<span style="display:'+((doc.display_amount)?"inline;":"none;")+'">'+doc.display_amount+'</span>. '+
																					'Please contact '+creator_profiles[0].name+' for further process of delivery and transitions. - Team MotoClique'+
																					'</div>'+
																					'</div>'+
																					'</div>'+
																				'</body>'+
																			'</html>';
																			
																			
															var data = {
																		to: profiles[0].email,
																		subject: 'Congratulation!',
																		message: msgBody
																	};
															googleMailAPI.sendEmail(data);
														}
														//Send EMAIL (to creator)
														if(creator_profiles[0].email){														
															var msgBody = '<html>'+
																				'<body>'+
																					'<div style="min-height: 500px; width: 100%;">'+
																					'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																					'<div style="min-height: 100px; text-align: center;">'+
																					'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																					'</div>'+
																					'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">Congratulation</div>'+
																					'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																					'Congratulation '+profiles[0].name+', you have won the BID for '+
																					'<span style="display:'+((doc.brand_name)?"inline;":"none;")+'">'+doc.brand_name+'</span>'+
																					'<span style="display:'+((doc.model)?"inline;":"none;")+'">'+doc.model+'</span>'+
																					'<span style="display:'+((doc.variant)?"inline;":"none;")+'">'+doc.variant+'</span>'+
																					', with the Final Amount Rs.'+
																					'<span style="display:'+((doc.display_amount)?"inline;":"none;")+'">'+doc.display_amount+'</span>. '+
																					'Please contact '+creator_profiles[0].name+' for further process of delivery and transitions. - Team MotoClique'+
																					'</div>'+
															    						'<div style="font-size:12px; color:#A4A4A4; padding:2px;">Please do not reply to this mail as this is auto generated email.</div>'+
																					'</div>'+
																					'</div>'+
																				'</body>'+
																			'</html>';
																			
																			
															var data = {
																		to: creator_profiles[0].email,
																		subject: 'Congratulation!',
																		message: msgBody
																	};
															googleMailAPI.sendEmail(data);
														}
														
														//Send App Alert (to participant)
														doc.to_user = profiles[0].user_id;
														module.exports.sendBidClosedPushNotification(doc);
														//Send App Alert (to creator)
														doc.to_user = creator_profiles[0].user_id;
														module.exports.sendBidClosedPushNotification(doc);
													}
												});
											}
										});
								}
							});
		}
	});		
};

module.exports.sendBidClosedPushNotification = function(doc){//Send push notification to app for bid closed			
	var not_id = 2;
	var alert_title = 'Congratulation';
	module.exports.sendAppPushNotification(
				{
					"to": "-",
					"data": {
						"title": alert_title,
						"message": 'Congratulation, you have won the BID for '+ doc.brand_name +' '+ doc.model +' '+ doc.variant,
						"notId": not_id,
						'content-available': '1'
					}
				},
				doc.to_user
	);
};


module.exports.sendBidPaticipateNotification = function(doc){//Send
							//Get API Keys
							Parameter.find({},function(params_err, params_result){
								var params = {};
								if(params_result){
										for(var p =0; p<params_result.length; p++){
											params[params_result[p].parameter] = params_result[p].value;
										}			
										
										var creator_query = {};
										creator_query.user_id = {"$eq": doc.user_id};
										creator_query.deleted = {"$ne": true};
										Profile.find(creator_query,function(creator_profile_err, creator_profiles){
											if(creator_profiles && creator_profiles.length > 0){
												var query_profile = {};
												query_profile.user_id = {"$eq": doc.bid_by_user_id};
												query_profile.deleted = {"$ne": true};
												Profile.find(query_profile,function(profile_err, profiles){
													if(profiles && profiles.length > 0){
														
														//Send SMS (to participant)
														if(profiles[0].mobile){																			
															var msgBody = 'You have participated in the BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																			((doc.fuel_type)?doc.fuel_type:'')+
																			((doc.bid_hike_by)?(', with Rs.'+doc.bid_hike_by+'.'):'.')+
																			((doc.current_bid_amount)?('Current Bid Amount is Rs.'+doc.current_bid_amount+'.'):'.')+
																			' - Team MotoClique';
															request.get({
																url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
															},
															function(err_sms,httpResponse,body){
																console.log(err_sms);
															});
														}
														//Send SMS (to creator)
														if(creator_profiles[0].mobile){																			
															var msgBody = profiles[0].name+
																			' has participated in your BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																			((doc.fuel_type)?doc.fuel_type:'')+
																			((doc.bid_hike_by)?(', with Rs.'+doc.bid_hike_by+'.'):'.')+
																			((doc.current_bid_amount)?('Current Bid Amount is Rs.'+doc.current_bid_amount+'.'):'.')+
																			' If you are happy with the amount you can close the Bid and contact '+profiles[0].name+
																			' for further process of delivery and transitions. - Team MotoClique';
															request.get({
																url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+creator_profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
															},
															function(err_sms,httpResponse,body){
																console.log(err_sms);
															});
														}
														
														//Send EMAIL (to participant)
														if(profiles[0].email){														
															var msgBody = '<html>'+
																				'<body>'+
																					'<div style="min-height: 500px; width: 100%;">'+
																					'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																					'<div style="min-height: 100px; text-align: center;">'+
																					'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																					'</div>'+
																					'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">Confirmation</div>'+
																					'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																					'You have participated in the BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																					((doc.fuel_type)?doc.fuel_type:'')+
																					((doc.bid_hike_by)?(', with Rs.'+doc.bid_hike_by+'.'):'.')+
																					((doc.current_bid_amount)?('Current Bid Amount is Rs.'+doc.current_bid_amount+'.'):'.')+
																					' - Team MotoClique'+
																					'</div>'+
															    						'<div style="font-size:12px; color:#A4A4A4; padding:2px;">Please do not reply to this mail as this is auto generated email.</div>'+
																					'</div>'+
																					'</div>'+
																				'</body>'+
																			'</html>';
																			
																			
															var data = {
																		to: profiles[0].email,
																		subject: 'Confirmation!',
																		message: msgBody
																	};
															googleMailAPI.sendEmail(data);
														}
														//Send EMAIL (to creator)
														if(creator_profiles[0].email){														
															var msgBody = '<html>'+
																				'<body>'+
																					'<div style="min-height: 500px; width: 100%;">'+
																					'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																					'<div style="min-height: 100px; text-align: center;">'+
																					'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																					'</div>'+
																					'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">Confirmation</div>'+
																					'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																					profiles[0].name+
																					' has participated in your BID for '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
																					((doc.fuel_type)?doc.fuel_type:'')+
																					((doc.bid_hike_by)?(', with Rs.'+doc.bid_hike_by+'.'):'.')+
																					((doc.current_bid_amount)?('Current Bid Amount is Rs.'+doc.current_bid_amount+'.'):'.')+
																					' If you are happy with the amount you can close the Bid and contact '+profiles[0].name+
																					' for further process of delivery and transitions. - Team MotoClique'+
																					'</div>'+
															    						'<div style="font-size:12px; color:#A4A4A4; padding:2px;">Please do not reply to this mail as this is auto generated email.</div>'+
																					'</div>'+
																					'</div>'+
																				'</body>'+
																			'</html>';
																			
																			
															var data = {
																		to: creator_profiles[0].email,
																		subject: 'Confirmation!',
																		message: msgBody
																	};
															googleMailAPI.sendEmail(data);
														}
														
														//Send App Alert (to participant)
														//doc.to_user = profiles[0].user_id;
														//doc.msg = 'Congratulation, you have won the BID for '+ doc.brand_name +' '+ doc.model +' '+ doc.variant;
														//module.exports.sendBidParticipatePushNotification(doc);
														//Send App Alert (to creator)
														doc.to_user = creator_profiles[0].user_id;
														doc.msg = profiles[0].name+' has participated in your BID for '+ doc.brand_name +' '+ doc.model +' '+ doc.variant;
														module.exports.sendBidParticipatePushNotification(doc);
													}
												});
											}
										});
								}
							});
};

module.exports.sendBidParticipatePushNotification = function(doc){//Send push notification to app for bid participation			
	var not_id = 3;
	var alert_title = 'Confirmation';
	module.exports.sendAppPushNotification(
				{
					"to": "-",
					"data": {
						"title": alert_title,
						"message": doc.msg,
						"notId": not_id,
						'content-available': '1'
					}
				},
				doc.to_user
	);
};

module.exports.sendNewBidNotification = function(doc){//Send New Bid Notification
	//Get API Keys
	Parameter.find({},function(params_err, params_result){
		var params = {};
		if(params_result){
			for(var p =0; p<params_result.length; p++){
				params[params_result[p].parameter] = params_result[p].value;
			}			
			var rights_query = {};
			rights_query.screen = {"$eq": 'Bid'};
			rights_query.field = {"$eq": "-"};
			rights_query.deleted = {"$ne": true};	
			AppScrFieldsRights.find(rights_query,function(rights_err, rights_result){
				if(rights_result && rights_result.length>0){					
					var query_userSub = {};
					query_userSub.role_id = {"$eq": rights_result[0].role_id};
					query_userSub.active = {"$eq": "X"};
					query_userSub.deleted = {"$ne": true};
					UserSubMap.find(query_userSub,function(err_userSub, result_userSub){
						if(result_userSub && result_userSub.length>0){
							result_userSub.forEach(function(currentValue, indx, arr){
								var query_profile = {};
								query_profile.user_id = {"$eq": currentValue.user_id};
								query_profile.deleted = {"$ne": true};
								Profile.find(query_profile,function(profile_err, profiles){
									if(profiles.length > 0){											
											//Send SMS
											if(profiles[0].mobile && currentValue.notification_sms === 'X'){
												var routePath = '/Bid/'+doc.bid_id;
												var routeLink = 'https://motoclique.in/Container'+routePath;
												var msgBody = 'Check out the new '+doc.transactionType+
															' post of '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+
															((doc.fuel_type)?doc.fuel_type:'')+
															((doc.display_amount)?(', priced at Rs.'+doc.display_amount):'')+
															((doc.year_of_reg)?(', registered on '+doc.year_of_reg):'')+
															((doc.km_done)?(', '+doc.km_done+'km runned'):'')+
															((doc.location)?(', located at '+doc.location):'')+
															'. '+
															routeLink+' ';
												request.get({
															url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+profiles[0].mobile+'&message='+msgBody+'&sender=MOTOCQ&route=6'
												},
												function(err_sms,httpResponse,body){
													console.log(err_sms);
												});										
											}
											
											//Send EMAIL
											if(profiles[0].email && currentValue.notification_email === 'X'){
												var routePath = '/Bid/'+doc.bid_id';
												var msgBody = '<html>'+
																	'<body>'+
																		'<div style="min-height: 500px; width: 100%;">'+
																		'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																		'<div style="min-height: 100px; text-align: center;">'+
																		'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																		'</div>'+
																		'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 30px; font-weight: bold; text-align: center; color: #E71B03; text-transform: uppercase;">'+doc.transactionType+'</div>'+
																		'<div style="line-height: 50px; text-align: center; font-size: 18px; font-weight: 700; font-family: Arial;">'+
																		'<span style="display:'+((doc.brand_name)?"inline;":"none;")+'">'+doc.brand_name+'</span>'+
																		'<span style="display:'+((doc.model)?"inline;":"none;")+'">'+doc.model+'</span>'+
																		'<span style="display:'+((doc.variant)?"inline;":"none;")+'">'+doc.variant+'</span>'+
																		'</div>'+
																		'<div style="text-align: center;"><a style="background:#e71b03; color: white !important;  line-height: 30px; width: 90%; text-decoration: none; padding-top: 8px; padding-bottom: 8px; padding-left: calc(50% - 50px); padding-right: calc(50% - 50px);" href="https://motoclique.in/Container'+routePath+'">OPEN</a></div>'+
																		'<div style="border: 1px dashed #E71B03; margin: 20px; padding: 10px; font-family: Arial;">'+
																		'<div style="font-size: 14px; width: 200px; margin-left: auto; margin-right: auto;">'+
																		'<div style="line-height: 28px; display:'+((doc.fuel_type)?"block;":"none;")+'">Fuel Type: <span style="font-size: 15px; font-weight: 600;">'+doc.fuel_type+'</span></div>'+
																		'<div style="line-height: 28px; display:'+((doc.display_amount)?"block;":"none;")+'">Price: <span style="font-size: 15px; font-weight: 600;">'+doc.display_amount+'</span></div>'+
																		'<div style="line-height: 28px; display:'+((doc.location)?"block;":"none;")+'">Location: <span style="font-size: 15px; font-weight: 600;">'+doc.location+'</span></div>'+
																		'<div style="line-height: 28px; display:'+((doc.year_of_reg)?"block;":"none;")+'">Year of Registration: <span style="font-size: 15px; font-weight: 600;">'+doc.year_of_reg+'</span></div>'+
																		'<div style="line-height: 28px; display:'+((doc.km_done)?"block;":"none;")+'">KM Done: <span style="font-size: 15px; font-weight: 600;">'+doc.km_done+'</span></div>'+
																		'</div>'+
																		'</div>'+
																										
																		'<div style="font-size:12px; color:#A4A4A4; padding:2px;">Please do not reply to this mail as this is auto generated email.</div>'+
																										
																		'</div>'+
																		'</div>'+
																	'</body>'+
																'</html>';
																					
												var data = {
															to: profiles[0].email,
															subject: doc.brand_name+' '+doc.model,
															message: msgBody
												};
												googleMailAPI.sendEmail(data);
											}
											
											//Send App Alert
											if(currentValue.notification_app === 'X'){
												doc.to_user = profiles[0].user_id;
												module.exports.sendAlertPushNotification(doc);
											}
									}
								});										
							});
						}
					});
				}
			});
		}
	});	
};


