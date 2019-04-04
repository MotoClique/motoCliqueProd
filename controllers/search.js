
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var ctrlCommon = require('./common');
var ctrlChat = require('./chat');

//////////////////////////Search////////////////////////////////
const Sell = mongoose.model('Sell');
const Buy = mongoose.model('Buy');
const Bid = mongoose.model('Bid');
const Service = mongoose.model('Service');

const Filter = mongoose.model('Filter');
const Loc = mongoose.model('Loc');
const Parameter = mongoose.model('Parameter');
const UserSubMap = mongoose.model('UserSubMap');
const Fav = mongoose.model('Fav');
const UserAddress = mongoose.model('UserAddress');
//const BidBy = mongoose.model('BidBy');

module.exports.search = function(req,res){//Fetch
	 //Check token validity
     if(req.payload.exp < (Date.now() / 1000)){                            
        res.status(440).json({
          "message" : "Session expired.",
          "url" : "/"
        });
     }

	// If no user ID exists in the JWT return a 401
    if (!req.payload.user_id) {
        res.status(401).json({
           "message" : "Unauthorized access."
        });
    }else {
       //var query = {};//{ $or: [{ tags: { $in: [ /^be/, /^st/ ] } }]};
	   if(req.query.term){
		   var term = (req.query.term).split(" ");
		   var terms = [];
		   for(var i = 0; i < term.length; i++){
				terms.push(new RegExp(term[i], 'i'));
		   }
		   var ands = [
							{deleted: {$ne: true}},
							{active: {$eq: "X"}},
							{ $or:
								  [
								   {product_type_name:  { $in: terms }},
								   {brand_name:  { $in: terms }},
								   {model:  { $in: terms }},
								   {variant:  { $in: terms }}
								  ]
							}
						];
						
			if(req.query.city){ ands.push({city: {$eq: req.query.city}}); }
			if(req.query.location){ ands.push({location: {$eq: req.query.location}}); }
			
			var query_filter = {};
			query_filter.user_id = {"$eq":req.payload.user_id};
			query_filter.deleted = {"$ne": true};			
			Filter.find(query_filter,function(err_filter, result_filter){
						
						for(var i=0; i<result_filter.length; i++){
							if(result_filter[i].filter_value
							   && result_filter[i].filter_value !== 'All'
							   && result_filter[i].filter_field 
							   && result_filter[i].filter_field !== 'product_type_name'
							  && result_filter[i].filter_field !== 'brand_name'
							  && result_filter[i].filter_field !== 'model'
							  && result_filter[i].filter_field !== 'variant'){//If Filter Value & Field is there
								/*var terms = [];
								if(user_filter[result_filter[i].filter_field]){//If filter field already defined
									terms = user_filter[result_filter[i].filter_field]['$in'];
									terms.push(result_filter[i].filter_value);
									user_filter[result_filter[i].filter_field] = {'$in': terms};
								}
								else{
									terms = [];
									terms.push(result_filter[i].filter_value);
									user_filter[result_filter[i].filter_field] = {'$in': terms};								
								}*/
								var user_filter = {};
								if(result_filter[i].filter_field === 'km_run_from'){									
									if(user_filter['km_done']){//If filter field already defined
										user_filter['km_done']['$gte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['km_done'] = {"$gte": Number(result_filter[i].filter_value)};								
									}
								}
								else if(result_filter[i].filter_field === 'km_run_to'){
									if(user_filter['km_done']){//If filter field already defined
										user_filter['km_done']['$lte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['km_done'] = {"$lte": Number(result_filter[i].filter_value)};								
									}
								}
								else if(result_filter[i].filter_field === 'year_reg_from'){
									//query['year_of_reg'] = {"$gte": result_filter[i].filter_value};
									if(user_filter['year_of_reg']){//If filter field already defined
										user_filter['year_of_reg']['$gte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['year_of_reg'] = {"$gte": Number(result_filter[i].filter_value)};								
									}
								}
								else if(result_filter[i].filter_field === 'year_reg_to'){
									//query['year_of_reg'] = {"$lte": result_filter[i].filter_value};
									if(user_filter['year_of_reg']){//If filter field already defined
										user_filter['year_of_reg']['$lte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['year_of_reg'] = {"$lte": Number(result_filter[i].filter_value)};								
									}
								}
								else if(result_filter[i].filter_field === 'price_from'){
									//query['net_price'] = {"$gte": result_filter[i].filter_value};
									//query['current_bid_amount'] = {"$gte": result_filter[i].filter_value};
									//query['start_from_amount'] = {"$gte": result_filter[i].filter_value};
									var price_fields = ['net_price','current_bid_amount','start_from_amount'];
									for(var j=0; j<price_fields.length; j++){										
										if(user_filter[price_fields[j]]){//If filter field already defined
											user_filter[price_fields[j]]['$gte'] = Number(result_filter[i].filter_value);									
										}
										else{
											user_filter[price_fields[j]] = {"$gte": Number(result_filter[i].filter_value)};								
										}
									}
									
								}
								else if(result_filter[i].filter_field === 'price_to'){
									//query['net_price'] = {"$lte": result_filter[i].filter_value};
									//query['current_bid_amount'] = {"$lte": result_filter[i].filter_value};
									//query['start_from_amount'] = {"$lte": result_filter[i].filter_value};
									var price_fields = ['net_price','current_bid_amount','start_from_amount'];
									for(var j=0; j<price_fields.length; j++){
										if(user_filter[price_fields[j]]){//If filter field already defined
											user_filter[price_fields[j]]['$lte'] = Number(result_filter[i].filter_value);									
										}
										else{
											user_filter[price_fields[j]] = {"$lte": Number(result_filter[i].filter_value)};								
										}
									}
								}
								else if(result_filter[i].filter_field === 'discount_from'){
									//query['discount'] = {"$gte": result_filter[i].filter_value};
									if(user_filter['discount']){//If filter field already defined
										user_filter['discount']['$gte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['discount'] = {"$gte": Number(result_filter[i].filter_value)};								
									}
								}
								else if(result_filter[i].filter_field === 'discount_to'){
									//query['discount'] = {"$lte": result_filter[i].filter_value};
									if(user_filter['discount']){//If filter field already defined
										user_filter['discount']['$lte'] = Number(result_filter[i].filter_value);									
									}
									else{
										user_filter['discount'] = {"$lte": Number(result_filter[i].filter_value)};								
									}
								}
								else{
									var terms = [];
									if(user_filter[result_filter[i].filter_field]){//If filter field already defined
										if(user_filter[result_filter[i].filter_field]['$in'])
											terms = user_filter[result_filter[i].filter_field]['$in'];
										terms.push(result_filter[i].filter_value);
										user_filter[result_filter[i].filter_field] = {'$in': terms};
									}
									else{
										terms = [];
										terms.push(result_filter[i].filter_value);
										user_filter[result_filter[i].filter_field] = {'$in': terms};								
									}
								}
								ands.push(user_filter);
								
							}
							
						}
						
						var query = {$and: []};
															  
						var type = req.query.type;
						var results = [];
						if(type === "Sale"){
							var sell_query = [];
							ands.forEach(function(item, index, arr) {
								if(!(item.current_bid_amount) && !(item.start_from_amount)){
								   sell_query.push(item);
								}
							});
							query = {$and: sell_query};
							Sell.find(query).limit(6)
								.exec(function(err, result) {
									for(var i=0; i<result.length; i++){
										var clone = JSON.parse(JSON.stringify(result[i]));
										clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
										clone.type = "Sale";
										
										var exist = false;
										for(var j=0; j<results.length; j++){
											if(clone.text === results[j].text){
												exist = true; break;
											}
										}
										if(!exist)
											results.push(clone);
									}
									res.status(200).json({results: results, error: err});
							});
						}
						else if(type === "Buy"){
							var buy_query = [];
							ands.forEach(function(item, index, arr) {
								if(!(item.current_bid_amount) && !(item.start_from_amount)){
								   buy_query.push(item);
								}
							});
							query = {$and: buy_query};
							Buy.find(query).limit(6)
								.exec(function(err, result) {
									for(var i=0; i<result.length; i++){
										var clone = JSON.parse(JSON.stringify(result[i]));
										clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
										clone.type = "Buy";
										
										var exist = false;
										for(var j=0; j<results.length; j++){
											if(clone.text === results[j].text){
												exist = true; break;
											}
										}
										if(!exist)
											results.push(clone);
									}
									res.status(200).json({results: results, error: err});
							});
						}
						else if (type === "Bid"){
							var bid_query = [];
							ands.forEach(function(item, index, arr) {
								if(!(item.net_price) && !(item.start_from_amount)){
								   bid_query.push(item);
								}
							});
							query = {$and: bid_query};							
							Bid.find(query).limit(6)
								.exec(function(err, result) {
									for(var i=0; i<result.length; i++){
										var clone = JSON.parse(JSON.stringify(result[i]));
										clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
										clone.type = "Bid";
										
										var exist = false;
										for(var j=0; j<results.length; j++){
											if(clone.text === results[j].text){
												exist = true; break;
											}
										}
										if(!exist)
											results.push(clone);
									}
									res.status(200).json({results: results, error: err});
							});
						}
						else if(type === "Service"){
							var service_query = [];
							ands.forEach(function(item, index, arr) {
								if(!(item.net_price) 
								   && !(item.current_bid_amount)){
								   service_query.push(item);
								}
							});
							query = {$and: service_query};							
							Service.find(query).limit(6)
								.exec(function(err, result) {
									for(var i=0; i<result.length; i++){
										var clone = JSON.parse(JSON.stringify(result[i]));
										clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
										clone.type = "Service";
										
										var exist = false;
										for(var j=0; j<results.length; j++){
											if(clone.text === results[j].text){
												exist = true; break;
											}
										}
										if(!exist)
											results.push(clone);
									}
									res.status(200).json({results: results, error: err});
							});
						}
						else{
							var sell_query = [];
							ands.forEach(function(item, index, arr) {
								if(!(item.current_bid_amount) 
								   && !(item.start_from_amount)){
								   sell_query.push(item);
								}
							});
							query = {$and: sell_query};							
							console.log(query);
							Sell.find(query).limit(2)
								.exec(function(err, sales) {
								console.log(err);
									for(var i=0; i<sales.length; i++){
										var clone = JSON.parse(JSON.stringify(sales[i]));
										clone.text = sales[i].product_type_name +" "+ sales[i].brand_name +" "+ sales[i].model +" "+ sales[i].variant ;
										clone.type = "Sale";
										
										var exist = false;
										for(var j=0; j<results.length; j++){
											if(clone.text === results[j].text){
												exist = true; break;
											}
										}
										if(!exist)
											results.push(clone);
									}
									//res.status(200).json({results: result, error: err});
									var buy_query = [];
									ands.forEach(function(item, index, arr) {
										if(!(item.current_bid_amount) 
										   && !(item.start_from_amount)){
										   buy_query.push(item);
										}
									});
									query = {$and: buy_query};									
									Buy.find(query).limit(2)
										.exec(function(err, buy) {
											for(var i=0; i<buy.length; i++){
												var clone = JSON.parse(JSON.stringify(buy[i]));
												clone.text = buy[i].product_type_name +" "+ buy[i].brand_name +" "+ buy[i].model +" "+ buy[i].variant ;
												clone.type = "Buy";
												
												var exist = false;
												for(var j=0; j<results.length; j++){
													if(clone.text === results[j].text){
														exist = true; break;
													}
												}
												if(!exist)
													results.push(clone);
											}
											//res.status(200).json({results: result, error: err});
											var bid_query = [];
											ands.forEach(function(item, index, arr) {
												if(!(item.net_price) 
												   && !(item.start_from_amount)){
												   bid_query.push(item);
												}
											});
											query = {$and: bid_query};											
											Bid.find(query).limit(2)
												.exec(function(err, bids) {
													for(var i=0; i<bids.length; i++){
														var clone = JSON.parse(JSON.stringify(bids[i]));
														clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
														clone.type = "Bid";
														
														var exist = false;
														for(var j=0; j<results.length; j++){
															if(clone.text === results[j].text){
																exist = true; break;
															}
														}
														if(!exist)
															results.push(clone);
													}
													//res.status(200).json({results: results, error: err});
													var service_query = [];
													ands.forEach(function(item, index, arr) {
														if(!(item.net_price) 
														   && !(item.current_bid_amount)){
														   service_query.push(item);
														}
													});
													query = {$and: service_query};														
													Service.find(query).limit(2)
														.exec(function(err, services) {
															for(var i=0; i<services.length; i++){
																var clone = JSON.parse(JSON.stringify(services[i]));
																clone.text = services[i].product_type_name +" "+ services[i].brand_name +" "+ services[i].model +" "+ services[i].variant ;
																clone.type = "Service";
																
																var exist = false;
																for(var j=0; j<results.length; j++){
																	if(clone.text === results[j].text){
																		exist = true; break;
																	}
																}
																if(!exist)
																	results.push(clone);
															}
															res.status(200).json({results: results, error: err});
													});
											});
									});
										
							});			
						}
			});
	   }
	   else{
			res.status(200).json({results: [], error: null});
	   }
	}	
	
};




/*module.exports.getTransactions = function(req,res){//Fetch
	 //Check token validity
     if(req.payload.exp < (Date.now() / 1000)){                            
        res.status(440).json({
          "message" : "Session expired.",
          "url" : "/"
        });
     }

	// If no user ID exists in the JWT return a 401
    if (!req.payload.user_id) {
        res.status(401).json({
           "message" : "Unauthorized access."
        });
    }else {
       	var query_sub = {}
	query_sub.user_id = {"$eq":req.payload.user_id};
	query_sub.active = {"$eq": "X"};
	query_sub.deleted = {"$ne": true};
	UserSubMap.find(query_sub,function(err_sub, result_sub){
		if(result_sub && result_sub.length>0){
			var sub_to = (result_sub[0].valid_to).split('/');
			var subToDateObj = new Date(sub_to[2]+'-'+sub_to[1]+'-'+sub_to[0]);
			var currentDateObj = new Date();
			if(subToDateObj>currentDateObj){			
			   var queries = req.body.queries;
			   var query = {};
				for (var key in queries) {
					if (queries.hasOwnProperty(key)) {
						var inArr = [];
						if(queries[key])
							inArr.push(queries[key]);
						query[key] = {$in: inArr};
						//query.push(q);
					}
				}        
				if(req.body.city){ query.city = {$eq: req.body.city}; }
				if(req.body.location){ query.location = {$eq: req.body.location}; }
				query.deleted = {$ne: true};
				query.active = {$eq: "X"};
				var type = req.body.type;
				var results = [];

				var query_filter = {};
				query_filter.user_id = {"$eq":req.payload.user_id};
				query_filter.deleted = {"$ne": true};			
				Filter.find(query_filter,function(err_filter, result_filter){
							for(var i=0; i<result_filter.length; i++){
								if(result_filter[i].filter_value && result_filter[i].filter_field && result_filter[i].filter_value !== 'All'){//If Filter Value & Field is there
									if(result_filter[i].filter_field === 'km_run_from'){
										if(query['km_done']){//If filter field already defined
											query['km_done']['$gte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['km_done'] = {"$gte": Number(result_filter[i].filter_value)};								
										}
									}
									else if(result_filter[i].filter_field === 'km_run_to'){
										if(query['km_done']){//If filter field already defined
											query['km_done']['$lte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['km_done'] = {"lgte": Number(result_filter[i].filter_value)};								
										}
									}
									else if(result_filter[i].filter_field === 'year_reg_from'){
										//query['year_of_reg'] = {"$gte": result_filter[i].filter_value};
										if(query['year_of_reg']){//If filter field already defined
											query['year_of_reg']['$gte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['year_of_reg'] = {"$gte": Number(result_filter[i].filter_value)};								
										}
									}
									else if(result_filter[i].filter_field === 'year_reg_to'){
										//query['year_of_reg'] = {"$lte": result_filter[i].filter_value};
										if(query['year_of_reg']){//If filter field already defined
											query['year_of_reg']['$lte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['year_of_reg'] = {"$lte": Number(result_filter[i].filter_value)};								
										}
									}
									else if(result_filter[i].filter_field === 'price_from'){
										//query['net_price'] = {"$gte": result_filter[i].filter_value};
										//query['current_bid_amount'] = {"$gte": result_filter[i].filter_value};
										//query['start_from_amount'] = {"$gte": result_filter[i].filter_value};
										var price_fields = ['net_price','current_bid_amount','start_from_amount'];
										for(var j=0; j<price_fields.length; j++){
											if(query[price_fields[j]]){//If filter field already defined
												query[price_fields[j]]['$gte'] = Number(result_filter[i].filter_value);									
											}
											else{
												query[price_fields[j]] = {"$gte": Number(result_filter[i].filter_value)};								
											}
										}

									}
									else if(result_filter[i].filter_field === 'price_to'){
										//query['net_price'] = {"$lte": result_filter[i].filter_value};
										//query['current_bid_amount'] = {"$lte": result_filter[i].filter_value};
										//query['start_from_amount'] = {"$lte": result_filter[i].filter_value};
										var price_fields = ['net_price','current_bid_amount','start_from_amount'];
										for(var j=0; j<price_fields.length; j++){
											if(query[price_fields[j]]){//If filter field already defined
												query[price_fields[j]]['$lte'] = Number(result_filter[i].filter_value);									
											}
											else{
												query[price_fields[j]] = {"$lte": Number(result_filter[i].filter_value)};								
											}
										}
									}
									else if(result_filter[i].filter_field === 'discount_from'){
										//query['discount'] = {"$gte": result_filter[i].filter_value};
										if(query['discount']){//If filter field already defined
											query['discount']['$gte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['discount'] = {"$gte": Number(result_filter[i].filter_value)};								
										}
									}
									else if(result_filter[i].filter_field === 'discount_to'){
										//query['discount'] = {"$lte": result_filter[i].filter_value};
										if(query['discount']){//If filter field already defined
											query['discount']['$lte'] = Number(result_filter[i].filter_value);									
										}
										else{
											query['discount'] = {"$lte": Number(result_filter[i].filter_value)};								
										}
									}
									else{
										var terms = [];
										if(query[result_filter[i].filter_field]){//If filter field already defined
											if(query[result_filter[i].filter_field]['$in'])
												terms = query[result_filter[i].filter_field]['$in'];
											terms.push(result_filter[i].filter_value);
											query[result_filter[i].filter_field] = {'$in': terms};
										}
										else{
											terms = [];
											terms.push(result_filter[i].filter_value);
											query[result_filter[i].filter_field] = {'$in': terms};								
										}
									}
								}
							}


				Parameter.find({parameter:{"$in":["extra_life_time","to_ist"]}},function(params_err, params_result){
					var params = {};
					if(params_result){
						params_result.forEach(function(val,indx,arr){
							params[val.parameter] = val.value;
						});
					}
							if(type === "Sale"){
								var count_sale = null;
								if(req.body.sale.count)
									count_sale = req.body.sale.count;

								delete query.current_bid_amount;
								delete query.start_from_amount;
								Sell.count(query,function(err_sell_count,res_sell_count){
									if(err_sell_count){
										res.status(401).json({statusCode:"F", results: null, error: err_sell_count});
									}
									else{
										var skip_rec = (req.body.sale.skip)?req.body.sale.skip:0;
										if(count_sale && res_sell_count>count_sale && req.body.sale.skip)
											skip_rec = (res_sell_count - count_sale) - (- req.body.sale.skip);
										if(!count_sale)
											count_sale = res_sell_count;

										var limit_rec = (req.body.sale.limit)?req.body.sale.limit:10;

										Sell.find(query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
											.exec(function(err, result) {
												for(var i=0; i<result.length; i++){
													var clone = JSON.parse(JSON.stringify(result[i]));
													//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
													clone.type = "Sale";
													results.push(clone);
												}

												res.status(200).json({results: results, error: err, sale:{count:count_sale, skip:skip_rec-(-result.length), limit:limit_rec}, buy:{}, bid:{}, service:{}});
										});
									}
								});
							}
							else if(type === "Buy"){
								var count_buy = null;
								if(req.body.buy.count)
									count_buy = req.body.buy.count;

								//delete query.discount;
								delete query.current_bid_amount;
								delete query.start_from_amount;
								Buy.count(query,function(err_buy_count,res_buy_count){
									if(err_buy_count){
										res.status(401).json({statusCode:"F", results: null, error: err_buy_count});
									}
									else{
										var skip_rec = (req.body.buy.skip)?req.body.buy.skip:0;
										if(count_buy && res_buy_count>count_buy && req.body.buy.skip)
											skip_rec = (res_buy_count - count_buy) - (- req.body.buy.skip);
										if(!count_buy)
											count_buy = res_buy_count;
										var limit_rec = (req.body.buy.limit)?req.body.buy.limit:10;

										Buy.find(query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
											.exec(function(err, result) {
												for(var i=0; i<result.length; i++){
													var clone = JSON.parse(JSON.stringify(result[i]));
													//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
													clone.type = "Buy";
													results.push(clone);
												}

												res.status(200).json({results: results, error: err, sale:{}, buy:{count:count_buy, skip:skip_rec-(-result.length), limit:limit_rec}, bid:{}, service:{}});
										});
									}
								});
							}
							else if (type === "Bid"){
								var count_bid = null;
								if(req.body.bid.count)
									count_bid = req.body.bid.count;
								delete query.active;
								//delete query.discount;
								delete query.net_price;
								delete query.start_from_amount;
								query.bid_status = {"$eq": "Active"};
								var extr_dy = new Date();
								if(params.extra_life_time){
									var newDate = extr_dy.getDate() - (params.extra_life_time);
									extr_dy.setDate(newDate);
								}
								query.bid_valid_to = {"$gte": extr_dy};
								console.log(query);
								Bid.count(query,function(err_bid_count,res_bid_count){
									if(err_bid_count){
										res.status(401).json({statusCode:"F", results:null, error:err_bid_count});
									}
									else{
										var skip_rec = (req.body.bid.skip)?req.body.bid.skip:0;
										if(count_bid && res_bid_count>count_bid && req.body.bid.skip)
											skip_rec = (res_bid_count - count_bid) - (- req.body.bid.skip);
										if(!count_bid)
											count_bid = res_bid_count;
										var limit_rec = (req.body.bid.limit)?req.body.bid.limit:10;
										console.log(res_bid_count);
										console.log(skip_rec);
										console.log(limit_rec);
										Bid.find(query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
											.exec(function(err, result) {
												console.log(result);
												//result.forEach(function(item, index, arr) {
												for(var i=0; i<result.length; i++){
													//var date_split = [];
													//var time_split = [];
													var validTo = new Date();

													if(result[i].bid_valid_to){
														
														validTo = result[i].bid_valid_to;
													}

													if(validTo >= (new Date())){
														var clone = JSON.parse(JSON.stringify(result[i]));
														//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
														var bid_valid_to = result[i].bid_valid_to;
														if(params.to_ist)
															bid_valid_to = ctrlCommon.convertDateTime(result[i].bid_valid_to,params.to_ist);

														var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
														var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
														var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
														clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
														clone.type = "Bid";
														results.push(clone);
													}
													else{	

														//if(validTo >= (new Date()) && result[i].current_bid_at){	
														if(result[i].current_bid_at){	
																	var clone = JSON.parse(JSON.stringify(result[i]));
																	//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
																	var bid_valid_to = result[i].bid_valid_to;
																	if(params.to_ist)
																		bid_valid_to = ctrlCommon.convertDateTime(result[i].bid_valid_to,params.to_ist);

																	var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
																	var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
																	var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
																	clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
																	clone.type = "Bid";
																	clone.sold = true;
																	results.push(clone);													
														}
													}
												}

												res.status(200).json({results: results, error: err, sale:{}, buy:{}, bid:{count:count_bid, skip:skip_rec-(-result.length), limit:limit_rec}, service:{}});
										});
									}
								});
							}
							else if(type === "Service"){
								var count_service = null;
								if(req.body.service.count)
									count_service = req.body.service.count;

								//delete query.discount;
								delete query.current_bid_amount;
								delete query.net_price;
								//delete query.year_of_reg;
								//delete query.km_done;
								Service.count(query,function(err_service_count,res_service_count){
									if(err_service_count){
										res.status(401).json({statusCode:"F", results:null, error:err_service_count});
									}
									else{
										var skip_rec = (req.body.service.skip)?req.body.service.skip:0;
										if(count_service && res_service_count>count_service && req.body.service.skip)
											skip_rec = (res_service_count - count_service) - (- req.body.service.skip);
										if(!count_service)
											count_service = res_service_count;
										var limit_rec = (req.body.service.limit)?req.body.service.limit:10;
										Service.find(query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
											.exec(function(err, result) {
												for(var i=0; i<result.length; i++){
													var clone = JSON.parse(JSON.stringify(result[i]));
													//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
													clone.type = "Service";
													results.push(clone);
												}

												res.status(200).json({results: results, error: err, sale:{}, buy:{}, bid:{}, service:{count:count_service, skip:skip_rec-(-result.length), limit:limit_rec}});
										});
									}
								});
							}
							else{
								var count_sale = null;
								if(req.body.sale.count)
									count_sale = req.body.sale.count;

								var sell_query = JSON.parse(JSON.stringify(query));
								delete sell_query.current_bid_amount;		
								delete sell_query.start_from_amount;

								Sell.count(sell_query,function(err_sell_count,res_sell_count){							
											var skip_rec_sale = (req.body.sale.skip)?req.body.sale.skip:0;
											if(count_sale && res_sell_count>count_sale && req.body.sale.skip)
												skip_rec_sale = (res_sell_count - count_sale) - (- req.body.sale.skip);
											if(!count_sale)
												count_sale = res_sell_count;
											var limit_rec_sale = (req.body.sale.limit)?req.body.sale.limit:10;					
											Sell.find(sell_query).sort({"index_count":-1}).skip(skip_rec_sale).limit(limit_rec_sale)
												.exec(function(err, sales) {
													for(var i=0; i<sales.length; i++){
														var clone = JSON.parse(JSON.stringify(sales[i]));
														//clone.text = sales[i].product_type_name +" "+ sales[i].brand_name +" "+ sales[i].model +" "+ sales[i].variant ;
														clone.type = "Sale";
														results.push(clone);
													}

													var count_buy = null;
													if(req.body.buy.count)
														count_buy = req.body.buy.count;

													var buy_query = JSON.parse(JSON.stringify(query));
													//delete buy_query.discount;
													delete buy_query.current_bid_amount;		
													delete buy_query.start_from_amount;		
													Buy.count(buy_query,function(err_buy_count,res_buy_count){
															var skip_rec_buy = (req.body.buy.skip)?req.body.buy.skip:0;
															if(count_buy && res_buy_count>count_buy && req.body.buy.skip)
																skip_rec_buy = (res_buy_count - count_buy) - (- req.body.buy.skip);
															if(!count_buy)
																count_buy = res_buy_count;
															var limit_rec_buy = (req.body.buy.limit)?req.body.buy.limit:10;
															Buy.find(buy_query).sort({"index_count":-1}).skip(skip_rec_buy).limit(limit_rec_buy)
																.exec(function(err, buy) {
																	for(var i=0; i<buy.length; i++){
																		var clone = JSON.parse(JSON.stringify(buy[i]));
																		//clone.text = buy[i].product_type_name +" "+ buy[i].brand_name +" "+ buy[i].model +" "+ buy[i].variant ;
																		clone.type = "Buy";
																		results.push(clone);
																	}
																	var count_bid = null;
																	if(req.body.bid.count)
																		count_bid = req.body.bid.count;

																	var bid_query = JSON.parse(JSON.stringify(query));
																	delete bid_query.active;
																	//delete bid_query.discount;
																	delete bid_query.net_price;
																	delete bid_query.start_from_amount;
																	bid_query.bid_status = {"$eq": "Active"};
																	var extr_dy = new Date();
																	if(params.extra_life_time){
																		var newDate = extr_dy.getDate() - (params.extra_life_time);
																		extr_dy.setDate(newDate);
																	}
																	bid_query.bid_valid_to = {"$gte": extr_dy};
																	Bid.count(bid_query,function(err_bid_count,res_bid_count){
																				var skip_rec_bid = (req.body.bid.skip)?req.body.bid.skip:0;
																				if(count_bid && res_bid_count>count_bid && req.body.bid.skip)
																					skip_rec_bid = (res_bid_count - count_bid) - (- req.body.bid.skip);
																				if(!count_bid)
																					count_bid = res_bid_count;
																				var limit_rec_bid = (req.body.bid.limit)?req.body.bid.limit:10;
																				Bid.find(bid_query).sort({"index_count":-1}).skip(skip_rec_bid).limit(limit_rec_bid)
																					.exec(function(err, bids) {
																						for(var i=0; i<bids.length; i++){
																							//var date_split = [];
																							//var time_split = [];
																							var validTo = new Date();

																							if(bids[i].bid_valid_to){
																								
																								validTo = bids[i].bid_valid_to;
																							}


																							if(validTo >= (new Date())){
																								var clone = JSON.parse(JSON.stringify(bids[i]));
																								//clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
																								var bid_valid_to = bids[i].bid_valid_to;
																								if(params.to_ist)
																									bid_valid_to = ctrlCommon.convertDateTime(bids[i].bid_valid_to,params.to_ist);

																								var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
																								var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
																								var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
																								clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
																								clone.type = "Bid";
																								results.push(clone);
																							}
																							else{
																								
																								if(bids[i].current_bid_at){
																								//if(validTo >= (new Date()) && bids[i].current_bid_at){																							
																											var clone = JSON.parse(JSON.stringify(bids[i]));
																											//clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
																											var bid_valid_to = bids[i].bid_valid_to;
																											if(params.to_ist)
																												bid_valid_to = ctrlCommon.convertDateTime(bids[i].bid_valid_to,params.to_ist);

																											var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
																											var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
																											var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
																											clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
																											clone.type = "Bid";
																											clone.sold = true;
																											results.push(clone);
																								}
																							}
																						}
																						var count_service = null;
																						if(req.body.service.count)
																							count_service = req.body.service.count;

																						var service_query = JSON.parse(JSON.stringify(query));
																						//delete service_query.discount;
																						delete service_query.current_bid_amount;
																						delete service_query.net_price;
																						//delete service_query.year_of_reg;
																						//delete service_query.km_done;
																						Service.count(service_query,function(err_service_count,res_service_count){
																								var skip_rec_service = (req.body.service.skip)?req.body.service.skip:0;
																								if(count_service && res_service_count>count_service && req.body.service.skip)
																									skip_rec_service = (res_service_count - count_service) - (- req.body.service.skip);
																								if(!count_service)
																									count_service = res_service_count;
																								var limit_rec_service = (req.body.service.limit)?req.body.service.limit:10;
																								Service.find(service_query).sort({"index_count":-1}).skip(skip_rec_service).limit(limit_rec_service)
																									.exec(function(err, services) {
																										for(var i=0; i<services.length; i++){
																											var clone = JSON.parse(JSON.stringify(services[i]));
																											//clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
																											clone.type = "Service";
																											results.push(clone);
																										}

																										res.status(200).json({
																											results: results, 
																											error: err, 
																											sale:{count:count_sale, skip:skip_rec_sale-(-sales.length), limit:limit_rec_sale},
																											buy:{count:count_buy, skip:skip_rec_buy-(-buy.length), limit:limit_rec_buy},
																											bid:{count:count_bid, skip:skip_rec_bid-(-bids.length), limit:limit_rec_bid},
																											service:{count:count_service, skip:skip_rec_service-(-services.length), limit:limit_rec_service}
																										});
																								});
																						});
																				});
																	});
															});
													});

											});
								});						
							}




				});	
					
			});
			}
			else{
				res.json({statusCode:"F", msg:"Your subscription has expired!", noSubscription:true, results: null, error: null});
			}
		}
		else{
			res.json({statusCode:"F", msg:"You do not have any subscription plan. Subscribe Now!", noSubscription:true, results: null, error: null});
		}
	});
	}	
	
};*/


module.exports.getTransactions = function(req,res){//Fetch
	var that = this;
	this.limit = {sale:3, buy:3, bid:3, service:3};
	this.excess_limit = {sale:0, buy:0, bid:0, service:0};
	this.limit.sale = (req.body.sale.limit)?req.body.sale.limit:3;
	this.limit.buy = (req.body.buy.limit)?req.body.buy.limit:3;
	this.limit.bid = (req.body.bid.limit)?req.body.bid.limit:3;
	this.limit.service = (req.body.service.limit)?req.body.service.limit:3;
	this.params = {};
	
    var query_sub = {}
	query_sub.user_id = {"$eq":req.payload.user_id};
	query_sub.active = {"$eq": "X"};
	query_sub.deleted = {"$ne": true};
	UserSubMap.find(query_sub,function(err_sub, result_sub){
		if(result_sub && result_sub.length>0){//Check If user has subscribed
			var sub_to = (result_sub[0].valid_to).split('/');
			var subToDateObj = new Date(sub_to[2]+'-'+sub_to[1]+'-'+sub_to[0]);
			var currentDateObj = new Date();
			
			//Check if subscription is still valid
			if(subToDateObj > currentDateObj){
				UserAddress.find({user_id: {"$eq":req.payload.user_id}},function(err_address, result_address){
					if(result_address && result_address.length>0){			
						//var queries = req.body.queries;
						var query = {};
						        
						if(req.body.city){ query.city = {$eq: req.body.city}; }
						if(req.body.location){ query.location = {$eq: req.body.location}; }
						query.deleted = {$ne: true};
						query.active = {$eq: "X"};
						var type = req.body.type;
						var results = [];
						
						//Fetch Config parameters
						Parameter.find({parameter:{"$in":["bid_slot_from","bid_slot_to","bid_slot_days","extra_life_time","to_ist"]}},function(params_err, params_result){
							if(params_result){
								params_result.forEach(function(val,indx,arr){
									that.params[val.parameter] = val.value;
								});
							}
							
							ctrlChat.countNewChat(req, function(chat_res){
							var new_chat = 0;
							if(chat_res && chat_res.statusCode === 'S')
								new_chat = chat_res.count;
							module.exports.getUserFilters(req,query,results,function(status,rt_query){
								if(status)
									query = rt_query;						
								var bidIsLive = '';
								var daysInWeeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];								
								var bidSlotFrom = new Date();
								bidSlotFrom.setHours(that.params['bid_slot_from'].split(':')[0]);
								bidSlotFrom.setMinutes(that.params['bid_slot_from'].split(':')[1]);	
								var bidSlotTo = new Date();
								bidSlotTo.setHours(that.params['bid_slot_to'].split(':')[0]);
								bidSlotTo.setMinutes(that.params['bid_slot_to'].split(':')[1]);	
								
								if(bidSlotTo < new Date()){
									bidSlotFrom.setDate(bidSlotFrom.getDate() - (-1));
									bidSlotTo.setDate(bidSlotTo.getDate() - (-1));
								}
								
								while(that.params['bid_slot_days'].indexOf(daysInWeeks[bidSlotFrom.getDay()]) == -1){
									bidSlotFrom.setDate(bidSlotFrom.getDate() - (-1));
									bidSlotTo.setDate(bidSlotTo.getDate() - (-1));
								}
								if(bidSlotFrom <= new Date() && bidSlotTo >= new Date()){
									bidIsLive = 'Bid is Live!';   
								}
								
								
								if(type === "Sale"){
									module.exports.fetchSell(req,query,results,function(rt_status,rt_sell,rt_params,rt_err){
										if(rt_status){
											results = rt_sell;
											var search_complete = false;
											if(that.excess_limit.sale > 0)
												search_complete = true;
											res.json({statusCode:"S", results: results, error: null, bidIsLive: bidIsLive, sale:rt_params, buy:{}, bid:{}, service:{}, completed:search_complete, chatCount:new_chat});
										}
										else{
											res.status(401).json({statusCode:"F", results:[], error:rt_err, chatCount:new_chat});
										}
									},that);
								}
								else if(type === "Buy"){
									module.exports.fetchBuy(req,query,results,function(rt_status,rt_buy,rt_params,rt_err){
										if(rt_status){
											results = rt_buy;
											var search_complete = false;
											if(that.excess_limit.buy > 0)
												search_complete = true;
											res.json({statusCode:"S", results: results, error: null, bidIsLive: bidIsLive, sale:{}, buy:rt_params, bid:{}, service:{}, completed:search_complete, chatCount:new_chat});
										}
										else{
											res.status(401).json({statusCode:"F", results:[], error:rt_err, chatCount:new_chat});
										}
									},that);	
								}
								else if(type === "Bid"){
									module.exports.fetchBid(req,query,results,function(rt_status,rt_bid,rt_params,rt_err){
										if(rt_status){
											results = rt_bid;
											var search_complete = false;
											if(that.excess_limit.bid > 0)
												search_complete = true;
											
											var nextBidMsg = '';
											//if(results && results.length==0){
												var daysInWeeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];								
												var bidSlotFrom = new Date();
												bidSlotFrom.setHours(that.params['bid_slot_from'].split(':')[0]);
												bidSlotFrom.setMinutes(that.params['bid_slot_from'].split(':')[1]);
												bidSlotFrom = ctrlCommon.convertDateTime(bidSlotFrom, that.params.to_ist);
												var bidSlotTo = new Date();
												bidSlotTo.setHours(that.params['bid_slot_to'].split(':')[0]);
												bidSlotTo.setMinutes(that.params['bid_slot_to'].split(':')[1]);
												bidSlotTo = ctrlCommon.convertDateTime(bidSlotTo, that.params.to_ist);
												
												var currentDateTimeIST = new Date();
												currentDateTimeIST = ctrlCommon.convertDateTime(currentDateTimeIST, that.params.to_ist);
												
												if(bidSlotTo < currentDateTimeIST){
													bidSlotFrom.setDate(bidSlotFrom.getDate() - (-1));
													bidSlotTo.setDate(bidSlotTo.getDate() - (-1));
												}
												
												while(that.params['bid_slot_days'].indexOf(daysInWeeks[bidSlotFrom.getDay()]) == -1){
														bidSlotFrom.setDate(bidSlotFrom.getDate() - (-1));
														bidSlotTo.setDate(bidSlotTo.getDate() - (-1));
												}
												
											if(bidSlotFrom > currentDateTimeIST || bidSlotTo < currentDateTimeIST){
												var bidSlotTimeFrom = bidSlotFrom.getHours() +":"+ ((bidSlotFrom.getMinutes()<10)?('0'+bidSlotFrom.getMinutes()):bidSlotFrom.getMinutes());
												if(parseInt(bidSlotTimeFrom.split(":")[0]) > 12)
													bidSlotTimeFrom = (parseInt(bidSlotTimeFrom.split(":")[0]) - 12) +":"+ bidSlotTimeFrom.split(":")[1] +"pm";
												else
													bidSlotTimeFrom += "am";
												var bidSlotTimeTo = bidSlotTo.getHours() +":"+ ((bidSlotTo.getMinutes()<10)?('0'+bidSlotTo.getMinutes()):bidSlotTo.getMinutes());
												if(parseInt(bidSlotTimeTo.split(":")[0]) > 12)
													bidSlotTimeTo = (parseInt(bidSlotTimeTo.split(":")[0]) - 12) +":"+ bidSlotTimeTo.split(":")[1] +"pm";
												else
													bidSlotTimeTo += "am";
											
												var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
												var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
												nextBidMsg = "Next bidding slot is <br> on <br> "+
																months[bidSlotFrom.getMonth()]+" "+
																bidSlotFrom.getDate()+", "+
																bidSlotFrom.getFullYear()+" "+
																days[bidSlotFrom.getDay()]+" <br> "+
																" from <br> "+bidSlotTimeFrom+" to "+bidSlotTimeTo+"!";
												//var nextBidDate = bidSlotFrom.getDate()+"/"+(bidSlotFrom.getMonth() - (-1))+"/"+bidSlotFrom.getFullYear();
												//nextBidMsg = "The Next bidding slot is on "+nextBidDate+" from "+bidSlotTimeFrom+" to "+bidSlotTimeTo+"!";
											}
											
											var nextBidFrom = new Date(bidSlotFrom.getTime());
											if(that.params.to_ist){
												var diffSplit = that.params.to_ist.split(':');
												var hrs = diffSplit[0]; var mins = diffSplit[1];											
												nextBidFrom.setHours(nextBidFrom.getHours() - (hrs));
												nextBidFrom.setMinutes(nextBidFrom.getMinutes() - (mins));
											}
											res.json({statusCode:"S", results: results, error: null, nextBidMsg: nextBidMsg, bidIsLive: bidIsLive, bidSlotFrom: nextBidFrom, sale:{}, buy:{}, bid:rt_params, service:{}, completed:search_complete, chatCount:new_chat});
										}
										else{
											res.status(401).json({statusCode:"F", results:[], error:rt_err, chatCount:new_chat});
										}
									},that);	
								}
								else if(type === "Service"){
									module.exports.fetchService(req,query,results,function(rt_status,rt_service,rt_params,rt_err){
										if(rt_status){
											results = rt_service;
											var search_complete = false;
											if(that.excess_limit.service > 0)
												search_complete = true;
											res.json({statusCode:"S", results: results, error: null, bidIsLive: bidIsLive, sale:{}, buy:{}, bid:{}, service:rt_params, completed:search_complete, chatCount:new_chat});
										}
										else{
											res.status(401).json({statusCode:"F", results:[], error:rt_err, chatCount:new_chat});
										}
									},that);	
								}
								else{//Fetch from all post table
									module.exports.fetchBuy(req,query,results,function(rt_buy_status,rt_buy,rt_buy_params,rt_buy_err){
										if(rt_buy_status){
											results = rt_buy;									
										}
										else{
											res.status(401).json({statusCode:"F", results:[], error:rt_buy_err, chatCount:new_chat});
										}
										module.exports.fetchBid(req,query,results,function(rt_bid_status,rt_bid,rt_bid_params,rt_bid_err){
											if(rt_bid_status){
												results = rt_bid;
											}
											else{
												res.status(401).json({statusCode:"F", results:[], error:rt_bid_err, chatCount:new_chat});
											}
											module.exports.fetchService(req,query,results,function(rt_service_status,rt_service,rt_service_params,rt_service_err){
												if(rt_service_status){
													results = rt_service;
												}
												else{
													res.status(401).json({statusCode:"F", results:[], error:rt_service_err, chatCount:new_chat});
												}
												module.exports.fetchSell(req,query,results,function(rt_sell_status,rt_sell,rt_sell_params,rt_sell_err){
													if(rt_sell_status){
														results = rt_sell;
														var search_complete = false;
														if(that.excess_limit.sale > 0 && that.excess_limit.buy > 0 && that.excess_limit.bid > 0 && that.excess_limit.service > 0)
															search_complete = true;
														res.json({
															statusCode:"S", 
															results: results, 
															error: null,
															bidIsLive: bidIsLive,
															sale:rt_sell_params, 
															buy:rt_buy_params, 
															bid:rt_bid_params, 
															service:rt_service_params,
															completed: search_complete, chatCount:new_chat
														});
													}
													else{
														res.status(401).json({statusCode:"F", results:[], error:rt_sell_err, chatCount:new_chat});
													}
												},that);	
											},that);
										},that);
									},that);
								}
							},that);
							});
						});
					}
					else{//No Address Maintained
						res.json({statusCode:"F", msg:"Your do not have any address maintained! Please maintain at least one address.", noAddress:true, results: [], error: null});
					}
				});
			}
			else{//Subscription Expired
				res.json({statusCode:"F", msg:"Your subscription has expired!", noSubscription:true, results: [], error: null});
			}
		}
		else{//No Subscription
			res.json({statusCode:"F", msg:"You do not have any subscription plan. Subscribe Now!", noSubscription:true, results: [], error: null});
		}
	});
};


module.exports.getUserFilters = function(req,query,results,callback,context){//Get the user specific filters and create query conditions
	var query_filter = {};
	query_filter.user_id = {"$eq":req.payload.user_id};
	query_filter.deleted = {"$ne": true};			
	Filter.find(query_filter,function(err_filter, result_filter){
		if(req.body.userFilter && Array.isArray(req.body.userFilter)){
			result_filter = req.body.userFilter;
		}
		for(var i=0; i<result_filter.length; i++){
			if(result_filter[i].filter_value && result_filter[i].filter_field && result_filter[i].filter_value !== 'All'){//If Filter Value & Field is there
				if(result_filter[i].filter_field === 'km_run_from'){
					if(query['km_done']){//If filter field already defined
						query['km_done']['$gte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['km_done'] = {"$gte": Number(result_filter[i].filter_value)};								
					}
				}
				else if(result_filter[i].filter_field === 'km_run_to'){
					if(query['km_done']){//If filter field already defined
						query['km_done']['$lte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['km_done'] = {"$lte": Number(result_filter[i].filter_value)};								
					}
				}
				else if(result_filter[i].filter_field === 'year_reg_from'){
					if(query['year_of_reg']){//If filter field already defined
						query['year_of_reg']['$gte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['year_of_reg'] = {"$gte": Number(result_filter[i].filter_value)};								
					}
				}
				else if(result_filter[i].filter_field === 'year_reg_to'){
					if(query['year_of_reg']){//If filter field already defined
						query['year_of_reg']['$lte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['year_of_reg'] = {"$lte": Number(result_filter[i].filter_value)};								
					}
				}
				else if(result_filter[i].filter_field === 'price_from'){
					var price_fields = ['net_price','current_bid_amount','start_from_amount'];
					for(var j=0; j<price_fields.length; j++){
						if(query[price_fields[j]]){//If filter field already defined
							query[price_fields[j]]['$gte'] = Number(result_filter[i].filter_value);									
						}
						else{
							query[price_fields[j]] = {"$gte": Number(result_filter[i].filter_value)};								
						}
					}
				}
				else if(result_filter[i].filter_field === 'price_to'){
					var price_fields = ['net_price','current_bid_amount','start_from_amount'];
					for(var j=0; j<price_fields.length; j++){
						if(query[price_fields[j]]){//If filter field already defined
							query[price_fields[j]]['$lte'] = Number(result_filter[i].filter_value);									
						}
						else{
							query[price_fields[j]] = {"$lte": Number(result_filter[i].filter_value)};								
						}
					}
				}
				else if(result_filter[i].filter_field === 'discount_from'){
					if(query['discount']){//If filter field already defined
						query['discount']['$gte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['discount'] = {"$gte": Number(result_filter[i].filter_value)};								
					}
				}
				else if(result_filter[i].filter_field === 'discount_to'){
					if(query['discount']){//If filter field already defined
						query['discount']['$lte'] = Number(result_filter[i].filter_value);									
					}
					else{
						query['discount'] = {"$lte": Number(result_filter[i].filter_value)};								
					}
				}
				else{
					var terms = [];
					if(query[result_filter[i].filter_field]){//If filter field already defined
						if(query[result_filter[i].filter_field]['$in'])
							terms = query[result_filter[i].filter_field]['$in'];
						terms.push(result_filter[i].filter_value);
						query[result_filter[i].filter_field] = {'$in': terms};
					}
					else{
						terms = [];
						terms.push(result_filter[i].filter_value);
						query[result_filter[i].filter_field] = {'$in': terms};								
					}					
				}
			}
		}
		callback(true,query);
	});
};



module.exports.fetchBuy = function(req,query,results,callback,context){//Fetch from buy table
	var buy_query = JSON.parse(JSON.stringify(query));
	delete buy_query.current_bid_amount;
	delete buy_query.start_from_amount;
	var queries = req.body.queries
	if(queries.product_type_name == queries.brand_name 
		&& queries.product_type_name == queries.model
			&& queries.product_type_name == queries.variant){
		var queryClone = JSON.parse(JSON.stringify(buy_query));
		var andQuery = {'$and':[]};
		var orQuery = {'$or':[]};
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(buy_query[key])) {
				if(queries[key]){
					var obj = {}; obj[key] = {'$regex': queries[key], '$options': 'i'};
					orQuery['$or'].push(obj);
				}
			}
		}
		
		buy_query = {'$and':[]};
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			buy_query['$or'] = [];
			buy_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			buy_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		andQuery['$and'].push(queryClone);
		
		buy_query['$and'].push(andQuery);
		if(orQuery['$or'] && orQuery['$or'].length>0)
			buy_query['$and'].push(orQuery);
	}
	else{
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(buy_query[key])) {
				var inArr = [];
				if(queries[key])
					inArr.push(queries[key]);
				buy_query[key] = {$in: inArr};
			}
		}
		
		var queryClone = JSON.parse(JSON.stringify(buy_query));
		buy_query = {'$and':[]};		
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			buy_query['$or'] = [];
			buy_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			buy_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		buy_query['$and'].push(queryClone);
	}
	
	Buy.count(buy_query,function(err_buy_count,res_buy_count){
		if(err_buy_count){
			callback(false,results,{},err_buy_count);
		}
		else{
			var count_buy = (req.body.buy.count)?req.body.buy.count:null;
			var limit_rec = context.limit.buy;
			
			var skip_rec = (req.body.buy.skip)?req.body.buy.skip:0;
			if(count_buy && req.body.buy.skip){
				if(res_buy_count>count_buy)
					skip_rec = (req.body.buy.skip) - (-(res_buy_count - count_buy));
			}
			if(!count_buy)
				count_buy = res_buy_count;			

			if(res_buy_count > skip_rec){
				Buy.find(buy_query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
				.exec(function(err, result) {
						//////////////////////
						var loopCount = 0;
						result.forEach(function(current,index,arr){
							var fav_query = {
								bid_sell_buy_id: {"$eq":current.buy_req_id},
								user_id: {"$eq":req.payload.user_id},
								deleted: {"$ne": true}
							};
							Fav.find(fav_query)
							.exec(function(fav_err, fav_result) {							
								var clone = JSON.parse(JSON.stringify(current));
								clone.type = "Buy";
								if(fav_result && fav_result.length > 0){
									clone.fav = true;		
									clone.fav_id = fav_result[0]._id;		
								}
								results.push(clone);
								loopCount = loopCount - (-1);
								if(loopCount === result.length){
									var buy_params = {count:count_buy, skip:skip_rec-(-result.length), limit:limit_rec};
									context.excess_limit.buy = limit_rec - result.length;
									callback(true,results,buy_params,null);
								}
							});
						});	
					
						/*for(var i=0; i<result.length; i++){
							var clone = JSON.parse(JSON.stringify(result[i]));
							clone.type = "Buy";
							results.push(clone);
						}
						var buy_params = {count:count_buy, skip:skip_rec-(-result.length), limit:limit_rec};
						context.excess_limit.buy = limit_rec - result.length;
						callback(true,results,buy_params,null);*/
				});
			}
			else{
				var buy_params = {count:count_buy, skip:skip_rec, limit:limit_rec};
				context.excess_limit.buy = limit_rec;
				callback(true,results,buy_params,null);
			}
		}
	});
};

module.exports.fetchBid = function(req,query,results,callback,context){//Fetch from bid table
	var bid_query = JSON.parse(JSON.stringify(query));
	delete bid_query.active;
	delete bid_query.net_price;
	delete bid_query.start_from_amount;
	bid_query.bid_status = {"$eq": "Active"};
	var extr_dy = new Date();
	if(context.params.extra_life_time){
		var newDate = extr_dy.getDate() - (context.params.extra_life_time);
		extr_dy.setDate(newDate);
	}
	bid_query.bid_valid_to = {"$gte": extr_dy};
	bid_query.bid_valid_from = {"$lte": (new Date())};
	
	var queries = req.body.queries
	if(queries.product_type_name == queries.brand_name 
		&& queries.product_type_name == queries.model
			&& queries.product_type_name == queries.variant){
		var queryClone = JSON.parse(JSON.stringify(bid_query));
		var andQuery = {'$and':[]};
		var orQuery = {'$or':[]};
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(bid_query[key])) {
				if(queries[key]){
					var obj = {}; obj[key] = {'$regex': queries[key], '$options': 'i'};
					orQuery['$or'].push(obj);
				}
			}
		}
		
		bid_query = {'$and':[]};
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			bid_query['$or'] = [];
			bid_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			bid_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		andQuery['$and'].push(queryClone);
		
		bid_query['$and'].push(andQuery);
		if(orQuery['$or'] && orQuery['$or'].length>0)
			bid_query['$and'].push(orQuery);
	}
	else{
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(bid_query[key])) {
				var inArr = [];
				if(queries[key])
					inArr.push(queries[key]);
				bid_query[key] = {$in: inArr};
			}
		}
		
		var queryClone = JSON.parse(JSON.stringify(bid_query));
		bid_query = {'$and':[]};		
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			bid_query['$or'] = [];
			bid_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			bid_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		bid_query['$and'].push(queryClone);
	}
	
	//console.log(bid_query);
	Bid.count(bid_query,function(err_bid_count,res_bid_count){
		if(err_bid_count){
			callback(false,results,{},err_bid_count);
		}
		else{
			var count_bid = (req.body.bid.count)?req.body.bid.count:null;
			if(context.excess_limit.buy > 0){
				context.limit.bid = context.limit.bid - (-1);
				context.limit.service = context.limit.service - (-1);
				context.limit.sale = context.limit.sale - (-1);
			}
			var limit_rec = context.limit.bid;
			
			var skip_rec = (req.body.bid.skip)?req.body.bid.skip:0;
			if(count_bid && req.body.bid.skip){
				if(res_bid_count>count_bid)
					skip_rec = (req.body.bid.skip) - (-(res_bid_count - count_bid));
			}
			if(!count_bid)
				count_bid = res_bid_count;			

			if(res_bid_count > skip_rec){
				Bid.find(bid_query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
				.exec(function(err, result) {
					//////////////////////
					var loopCount = 0;
					result.forEach(function(current,index,arr){
						var fav_query = {
							bid_sell_buy_id: {"$eq":current.bid_id},
							user_id: {"$eq":req.payload.user_id},
							deleted: {"$ne": true}
						};
						Fav.find(fav_query)
							.exec(function(fav_err, fav_result) {								
								var clone = JSON.parse(JSON.stringify(current));
								clone.type = "Bid";
								if(fav_result && fav_result.length > 0){
									clone.fav = true;		
									clone.fav_id = fav_result[0]._id;		
								}
								
								var validTo = new Date();
								if(current.bid_valid_to){
									validTo = current.bid_valid_to;
								}

								if(validTo >= (new Date())){									
									var bid_valid_to = current.bid_valid_to;
									if(context.params.to_ist)
										bid_valid_to = ctrlCommon.convertDateTime(current.bid_valid_to,context.params.to_ist);
									var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
									var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
									var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
									clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
									clone.live = true;
									results.push(clone);
								}
								else{
									if(current.current_bid_at){											
										var bid_valid_to = current.bid_valid_to;
										if(context.params.to_ist)
											bid_valid_to = ctrlCommon.convertDateTime(current.bid_valid_to,context.params.to_ist);
										var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
										var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
										var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
										clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
										clone.sold = true;
										clone.live = true;
										results.push(clone);													
									}
								}
								
								loopCount = loopCount - (-1);
								if(loopCount === result.length){
									var bid_params = {count:count_bid, skip:skip_rec-(-result.length), limit:limit_rec};
									context.excess_limit.bid = limit_rec - result.length;
									callback(true,results,bid_params,null);
								}
						});
					});
					
					/*for(var i=0; i<result.length; i++){
						var validTo = new Date();
						if(result[i].bid_valid_to){
							validTo = result[i].bid_valid_to;
						}

						if(validTo >= (new Date())){
							var clone = JSON.parse(JSON.stringify(result[i]));
							var bid_valid_to = result[i].bid_valid_to;
							if(context.params.to_ist)
								bid_valid_to = ctrlCommon.convertDateTime(result[i].bid_valid_to,context.params.to_ist);
							var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
							var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
							var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
							clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
							clone.type = "Bid";
							results.push(clone);
						}
						else{
							if(result[i].current_bid_at){	
								var clone = JSON.parse(JSON.stringify(result[i]));
								var bid_valid_to = result[i].bid_valid_to;
								if(context.params.to_ist)
									bid_valid_to = ctrlCommon.convertDateTime(result[i].bid_valid_to,context.params.to_ist);
								var hrs = (bid_valid_to.getHours()<10)?("0"+bid_valid_to.getHours()):bid_valid_to.getHours();
								var mins = (bid_valid_to.getMinutes()<10)?("0"+bid_valid_to.getMinutes()):bid_valid_to.getMinutes();
								var secs = (bid_valid_to.getSeconds()<10)?("0"+bid_valid_to.getSeconds()):bid_valid_to.getSeconds();
								clone.bid_valid_to = bid_valid_to.getDate()+'/'+(bid_valid_to.getMonth() - (-1))+'/'+bid_valid_to.getFullYear()+'T'+hrs+':'+mins+':'+secs;
								clone.type = "Bid";
								clone.sold = true;
								results.push(clone);													
							}
						}
					}
					
					var bid_params = {count:count_bid, skip:skip_rec-(-result.length), limit:limit_rec};
					context.excess_limit.bid = limit_rec - result.length;
					callback(true,results,bid_params,null);*/
				});
			}
			else{
				var bid_params = {count:count_bid, skip:skip_rec, limit:limit_rec};
				context.excess_limit.bid = limit_rec;
				callback(true,results,bid_params,null);
			}
		}
	});
};

module.exports.fetchService = function(req,query,results,callback,context){//Fetch from service table
	var service_query = JSON.parse(JSON.stringify(query));
	delete service_query.current_bid_amount;
	delete service_query.net_price;
	var queries = req.body.queries
	if(queries.product_type_name == queries.brand_name 
		&& queries.product_type_name == queries.model
			&& queries.product_type_name == queries.variant){
		var queryClone = JSON.parse(JSON.stringify(service_query));
		var andQuery = {'$and':[]};
		var orQuery = {'$or':[]};
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(service_query[key])) {
				if(queries[key]){
					var obj = {}; obj[key] = {'$regex': queries[key], '$options': 'i'};
					orQuery['$or'].push(obj);
				}
			}
		}
		
		service_query = {'$and':[]};
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			service_query['$or'] = [];
			service_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			service_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		andQuery['$and'].push(queryClone);
		
		service_query['$and'].push(andQuery);
		if(orQuery['$or'] && orQuery['$or'].length>0)
			service_query['$and'].push(orQuery);
	}
	else{
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(service_query[key])) {
				var inArr = [];
				if(queries[key])
					inArr.push(queries[key]);
				service_query[key] = {$in: inArr};
			}
		}
		
		var queryClone = JSON.parse(JSON.stringify(service_query));
		service_query = {'$and':[]};		
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			service_query['$or'] = [];
			service_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			service_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		service_query['$and'].push(queryClone);
	}
	
	Service.count(service_query,function(err_service_count,res_service_count){
		if(err_service_count){
			callback(false,results,{},err_service_count);
		}
		else{
			var count_service = (req.body.service.count)?req.body.service.count:null;
			if(context.excess_limit.bid > 0){
				context.limit.service = context.limit.service - (-2);
				context.limit.sale = context.limit.sale - (-2);
			}
			var limit_rec = context.limit.service;
			
			var skip_rec = (req.body.service.skip)?req.body.service.skip:0;
			if(count_service && req.body.service.skip){
				if(res_service_count>count_service)
					skip_rec = (req.body.service.skip) - (-(res_service_count - count_service));
			}
			if(!count_service)
				count_service = res_service_count;			

			if(res_service_count > skip_rec){
				Service.find(service_query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
				.exec(function(err, result) {
						//////////////////////
						var loopCount = 0;
						result.forEach(function(current,index,arr){
							var fav_query = {
								bid_sell_buy_id: {"$eq":current.service_id},
								user_id: {"$eq":req.payload.user_id},
								deleted: {"$ne": true}
							};
							Fav.find(fav_query)
							.exec(function(fav_err, fav_result) {							
								var clone = JSON.parse(JSON.stringify(current));
								clone.type = "Service";
								if(fav_result && fav_result.length > 0){
									clone.fav = true;		
									clone.fav_id = fav_result[0]._id;		
								}
								results.push(clone);
								loopCount = loopCount - (-1);
								if(loopCount === result.length){
									var service_params = {count:count_service, skip:skip_rec-(-result.length), limit:limit_rec};
									context.excess_limit.service = limit_rec - result.length;
									callback(true,results,service_params,null);
								}
							});
						});
					
						/*for(var i=0; i<result.length; i++){
							var clone = JSON.parse(JSON.stringify(result[i]));
							clone.type = "Service";
							results.push(clone);
						}
						var service_params = {count:count_service, skip:skip_rec-(-result.length), limit:limit_rec};
						context.excess_limit.service = limit_rec - result.length;
						callback(true,results,service_params,null);*/
				});
			}
			else{
				var service_params = {count:count_service, skip:skip_rec, limit:limit_rec};
				context.excess_limit.service = limit_rec;
				callback(true,results,service_params,null);
			}
		}
	});
};



module.exports.fetchSell = function(req,query,results,callback,context){//Fetch from sell table
	var sell_query = JSON.parse(JSON.stringify(query));
	delete sell_query.current_bid_amount;
	delete sell_query.start_from_amount;
	var queries = req.body.queries
	if(queries.product_type_name == queries.brand_name 
		&& queries.product_type_name == queries.model
			&& queries.product_type_name == queries.variant){
		var queryClone = JSON.parse(JSON.stringify(sell_query));
		var andQuery = {'$and':[]};
		var orQuery = {'$or':[]};
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(sell_query[key])) {
				if(queries[key]){
					var obj = {}; obj[key] = {'$regex': queries[key], '$options': 'i'};
					orQuery['$or'].push(obj);
				}
			}
		}
		
		sell_query = {'$and':[]};
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			sell_query['$or'] = [];
			sell_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			sell_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		andQuery['$and'].push(queryClone);
		
		sell_query['$and'].push(andQuery);
		if(orQuery['$or'] && orQuery['$or'].length>0)
			sell_query['$and'].push(orQuery);
	}
	else{
		for (var key in queries) {
			if (queries.hasOwnProperty(key) && !(sell_query[key])) {
				var inArr = [];
				if(queries[key])
					inArr.push(queries[key]);
				sell_query[key] = {$in: inArr};
			}
		}
		
		var queryClone = JSON.parse(JSON.stringify(sell_query));
		sell_query = {'$and':[]};		
		if(req.body.location === req.body.city){
			delete queryClone.location;
			delete queryClone.city;
			sell_query['$or'] = [];
			sell_query['$or'].push({'location': {'$regex': req.body.location, '$options': 'i'}});
			sell_query['$or'].push({'city': {'$regex': req.body.city, '$options': 'i'}});
		}
		sell_query['$and'].push(queryClone);
	}
	
	Sell.count(sell_query,function(err_sell_count,res_sell_count){
		if(err_sell_count){
			callback(false,results,{},err_sell_count);
		}
		else{
			var count_sale = (req.body.sale.count)?req.body.sale.count:null;
			if(context.excess_limit.service > 0){
				context.limit.sale = context.limit.sale - (-3);
			}
			var limit_rec = context.limit.sale;
			
			var skip_rec = (req.body.sale.skip)?req.body.sale.skip:0;
			if(count_sale && req.body.sale.skip){
				if(res_sell_count>count_sale)
					skip_rec = (req.body.sale.skip) - (-(res_sell_count - count_sale));
			}
			if(!count_sale)
				count_sale = res_sell_count;			

			if(res_sell_count > skip_rec){
				Sell.find(sell_query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
				.exec(function(err, result) {
						//////////////////////
						var loopCount = 0;
						result.forEach(function(current,index,arr){
							var fav_query = {
								bid_sell_buy_id: {"$eq":current.sell_id},
								user_id: {"$eq":req.payload.user_id},
								deleted: {"$ne": true}
							};
							Fav.find(fav_query)
							.exec(function(fav_err, fav_result) {							
								var clone = JSON.parse(JSON.stringify(current));
								clone.type = "Sale";
								if(fav_result && fav_result.length > 0){
									clone.fav = true;		
									clone.fav_id = fav_result[0]._id;		
								}
								results.push(clone);
								loopCount = loopCount - (-1);
								if(loopCount === result.length){
									var sell_params = {count:count_sale, skip:skip_rec-(-result.length), limit:limit_rec};
									context.excess_limit.sale = limit_rec - result.length;
									callback(true,results,sell_params,null);
								}
							});
						});	
					
						/*for(var i=0; i<result.length; i++){
							var clone = JSON.parse(JSON.stringify(result[i]));
							clone.type = "Sale";
							results.push(clone);
						}
						var sell_params = {count:count_sale, skip:skip_rec-(-result.length), limit:limit_rec};
						context.excess_limit.sale = limit_rec - result.length;
						callback(true,results,sell_params,null);*/
				});
			}
			else{
				var sell_params = {count:count_sale, skip:skip_rec, limit:limit_rec};
				context.excess_limit.sale = limit_rec;
				callback(true,results,sell_params,null);
			}
		}
	});
};


module.exports.searchLoc = function(req,res){//Fetch
	 //Check token validity
     if(req.payload.exp < (Date.now() / 1000)){                            
        res.status(440).json({
          "message" : "Session expired.",
          "url" : "/"
        });
     }

	// If no user ID exists in the JWT return a 401
    if (!req.payload.user_id) {
        res.status(401).json({
           "message" : "Unauthorized access."
        });
    }else {
       //var query = {};//{ $or: [{ tags: { $in: [ /^be/, /^st/ ] } }]};
	   if(req.query.term){
		   var terms = [];
		   terms.push(new RegExp(req.query.term, 'i'));
		   
		   var ands = [
							{deleted: {$ne: true}},
							{ $or:
								  [
								   //{country:  { $in: terms }},
								   //{state:  { $in: terms }},
								   {city:  { $in: terms }},
								   {location:  { $in: terms }}
								  ]
							}
						];
			var query = {$and: ands};
			var results = [];
			Loc.find(query).limit(3)
					.exec(function(err, result) {
						for(var i=0; i<result.length; i++){
							var clone = JSON.parse(JSON.stringify(result[i]));
							clone.text = result[i].location +", "+ result[i].city;// +", "+ result[i].country ;
							results.push(clone);
						}
						res.status(200).json({results: results, error: err});
            });
	   }
	   else{
		   res.status(200).json({results: [], error: null});
	   }
	}
			
};


