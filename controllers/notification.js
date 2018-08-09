
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');

//////////////////////////Send Notification////////////////////////////////
var Profile = mongoose.model('Profile');
var UserSubMap = mongoose.model('UserSubMap');
var UserAlert = mongoose.model('UserAlert');
var Parameter = mongoose.model('Parameter');

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
								for(var i = 0; i<result_alert.length; i++){
										var query_userSub = {};
										query_userSub.user_id = {"$eq": result_alert[i].user_id};
										query_userSub.active = {"$eq": "X"};	
										query_userSub.deleted = {"$ne": true};	
										//Send SMS
										if(result_alert[i].sms){
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
																			request.post({
																				url:'https://api.textlocal.in/send/?', 
																				form: {
																						  'apikey': params.sms_api_key, 
																						  'message': 'Check out the new '+doc.brand_name+' '+doc.model+' posted for '+doc.transactionType+'.',
																						  'sender': 'TXTLCL',
																						  'numbers': '91'+profiles[0].mobile
																						}
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
										if(result_alert[i].email){
												UserSubMap.find(query_userSub,function(err_userSub, result_userSub){
													console.log(result_userSub);
													if(err_userSub){
														console.log(err_userSub);
													}
													else{
														var email_sent = false;
														for(var j = 0; j<result_userSub.length; j++){												
															if(result_userSub[j].notification_email === 'X' && !email_sent){
																var query_profile = {};
																query_profile.user_id = {"$eq": result_userSub[j].user_id};
																query_profile.deleted = {"$ne": true};
																Profile.find(query_profile,function(profile_err, profiles){
																	if(profiles.length > 0){
																		if(profiles[0].email){
																			var data = {
																							"from":"MotoClick <no-reply@motoClick.com>",
																							"to": profiles[0].email,
																							"subject": doc.brand_name+' '+doc.model,
																							"text": 'Check out the new '+doc.brand_name+' '+doc.model+' posted for '+doc.transactionType+'.'
																			};
																			request.post({
																				url:'https://api.mailgun.net/v3/'+ params.email_api_id
																						+'/messages', 
																				form: data,
																				headers: {
																					'Authorization': 'Basic '+Buffer.from('api:key-'+params.email_api_key).toString('base64')
																					
																				  }
																			},
																			function(err_email,httpResponse,body){
																				console.log("email triggered to "+profiles[0].email);
																				console.log(err_email);
																				console.log(httpResponse);
																				console.log(body);
																			});
																			email_sent = true;
																		}
																	}
																});
																
															}
														}
													}
												});
										}
										
										
										
										
										
										
										
										
										
										
										
									}
							}
				});
	


		}
	});

	
};

