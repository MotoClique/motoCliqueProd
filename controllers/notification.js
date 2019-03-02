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
																			var msgBody = 'Check out the new '+doc.transactionType+' post of '+doc.brand_name+' '+doc.model+' '+doc.variant+' '+doc.fuel_type+', priced at Rs.'+doc.display_amount+', registered on '+doc.year_of_reg+', '+doc.km_done+'km runned, located at '+doc.location+'. '+routeLink+' ';
																			request.get({
																				url:'http://sms.fastsmsindia.com/api/sendhttp.php?authkey='+params.sms_api_key+'&mobiles='+profiles[0].mobile+'&message='+msgBody+'&sender=MOCLIQ&route=6'
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
																									'<div style="border:1px solid #E71B03; height: 500px; width: 100%;">'+
																									'<div style="padding-left: 8%; padding-right: 8%; padding-top: 50px; padding-bottom: 50px;">'+
																									'<div style="min-height: 100px; text-align: center;">'+
																									'<img style="max-width: 140px;" src="https://motoclique.in/assets/motoclique.png"></img>'+
																									'</div>'+
																									'<div style="border-top:1px solid #E71B03; border-bottom:1px solid #E71B03; line-height: 50px; font-size: 25px; font-weight: bold; text-align: center; color: #E71B03;">'+doc.transactionType+'</div>'+
																									'<div style="line-height: 50px; text-align: center; font-size: 16px; font-weight: 700; font-family: Arial;">'+
																									'<span>'+doc.brand_name+'</span>'+
																									'<span>'+doc.model+'</span>'+
																									'<span>'+doc.variant+'</span>'+
																									'</div>'+
																									'<div style="text-align: center;"><a style="background:#e71b03; color: white !important;  line-height: 30px; width: 90%; -webkit-appearance: button; -moz-appearance: button; appearance: button; text-decoration: none;" href="https://motoclique.in/Container'+routePath+'">OPEN</a></div>'+
																									'<div style="border: 1px dashed #E71B03; margin: 20px; padding: 10px; display:flex; justify-content: space-between; font-family: Arial;">'+
																									'<div style="font-size: 14px;">'+
																									'<div style="line-height: 28px;">Fuel Type: <span style="font-size: 15px; font-weight: 600;">'+doc.fuel_type+'</span></div>'+
																									'<div style="line-height: 28px;">Price: <span style="font-size: 15px; font-weight: 600;">'+doc.display_amount+'</span></div>'+
																									'<div style="line-height: 28px;">Location: <span style="font-size: 15px; font-weight: 600;">'+doc.location+'</span></div>'+
																									'</div>'+
																									'<div style="font-size: 14px;">'+
																									'<div style="line-height: 28px;">Year of Registration: <span style="font-size: 15px; font-weight: 600;">'+doc.year_of_reg+'</span></div>'+
																									'<div style="line-height: 28px;">KM Done: <span style="font-size: 15px; font-weight: 600;">'+doc.km_done+'</span></div>'+
																									'</div>'+
																									'</div>'+
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






