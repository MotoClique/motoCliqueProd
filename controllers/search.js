
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');

//////////////////////////Search////////////////////////////////
const Sell = mongoose.model('Sell');
const Buy = mongoose.model('Buy');
const Bid = mongoose.model('Bid');
const Service = mongoose.model('Service');

const Filter = mongoose.model('Filter');
const Loc = mongoose.model('Loc');
const Parameter = mongoose.model('Parameter');
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
						var user_filter = {};
						for(var i=0; i<result_filter.length; i++){
							if(result_filter[i].filter_value && result_filter[i].filter_field){//If Filter Value & Field is there
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
								
							}
							
						}
						ands.push(user_filter);
						var query = {$and: ands};
															  
						var type = req.query.type;
						var results = [];
						if(type === "Sale"){
							var sell_query = JSON.parse(JSON.stringify(query));
							delete sell_query.current_bid_amount;
							delete sell_query.start_from_amount;
							Sell.find(sell_query).limit(6)
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
							var buy_query = JSON.parse(JSON.stringify(query));
							delete buy_query.discount;
							delete buy_query.current_bid_amount;
							delete buy_query.start_from_amount;
							Buy.find(buy_query).limit(6)
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
							var bid_query = JSON.parse(JSON.stringify(query));
							delete bid_query.discount;
							delete bid_query.net_price;
							delete bid_query.start_from_amount;
							Bid.find(bid_query).limit(6)
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
							var service_query = JSON.parse(JSON.stringify(query));
							delete service_query.discount;
							delete service_query.net_price;
							delete service_query.current_bid_amount;
							delete service_query.year_of_reg;
							delete service_query.km_done;
							Service.find(service_query).limit(6)
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
							var sell_query = JSON.parse(JSON.stringify(query));
							delete sell_query.current_bid_amount;
							delete sell_query.start_from_amount;
							Sell.find(sell_query).limit(2)
								.exec(function(err, sales) {
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
									var buy_query = JSON.parse(JSON.stringify(query));
									delete buy_query.discount;
									delete buy_query.current_bid_amount;
									delete buy_query.start_from_amount;
									Buy.find(buy_query).limit(2)
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
											var bid_query = JSON.parse(JSON.stringify(query));
											delete bid_query.discount;
											delete bid_query.net_price;
											delete bid_query.start_from_amount;
											Bid.find(bid_query).limit(2)
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
													var service_query = JSON.parse(JSON.stringify(query));
													delete service_query.discount;
													delete service_query.net_price;
													delete service_query.current_bid_amount;
													delete service_query.year_of_reg;
													delete service_query.km_done;
													Service.find(service_query).limit(2)
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




module.exports.getTransactions = function(req,res){//Fetch
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
       
	   var queries = req.body.queries;
	   var query = {};
		for (var key in queries) {
			if (queries.hasOwnProperty(key)) {
				//var q = {};
				query[key] = {$eq: queries[key]};
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
						if(result_filter[i].filter_value && result_filter[i].filter_field){//If Filter Value & Field is there
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
		
		
		Parameter.find({parameter:{"$eq":"extra_life_time"}},function(params_err, params_result){
		
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
						
						delete query.discount;
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
						delete query.discount;
						delete query.net_price;
						delete query.start_from_amount;
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
								Bid.find(query).sort({"index_count":-1}).skip(skip_rec).limit(limit_rec)
									.exec(function(err, result) {
										//result.forEach(function(item, index, arr) {
										for(var i=0; i<result.length; i++){
											var split = [];
											var validTo = new Date();
											
											if(result[i].bid_valid_to){
												split = (result[i].bid_valid_to).split('/');
												validTo = new Date(split[1]+'/'+split[0]+'/'+split[2]);
											}
											
											if(validTo >= (new Date())){
												var clone = JSON.parse(JSON.stringify(result[i]));
												//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
												clone.type = "Bid";
												results.push(clone);
											}
											else{												
												if(params_result.length && params_result.length>0){
													var newDate = validTo.getDate() - (- params_result[0].value);
													validTo.setDate(newDate);
												}
																								
												if(validTo >= (new Date()) && result[i].current_bid_at){													
															var clone = JSON.parse(JSON.stringify(result[i]));
															//clone.text = result[i].product_type_name +" "+ result[i].brand_name +" "+ result[i].model +" "+ result[i].variant ;
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
						
						delete query.discount;
						delete query.current_bid_amount;
						delete query.net_price;
						delete query.year_of_reg;
						delete query.km_done;
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
						console.log(sell_query);
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
											delete buy_query.discount;
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
															delete bid_query.discount;
															delete bid_query.net_price;
															delete bid_query.start_from_amount;
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
																					var split = [];
																					var validTo = new Date();
																					
																					if(bids[i].bid_valid_to){
																						split = (bids[i].bid_valid_to).split('/');
																						validTo = new Date(split[1]+'/'+split[0]+'/'+split[2]);
																					}
																					
																					if(validTo >= (new Date())){
																						var clone = JSON.parse(JSON.stringify(bids[i]));
																						//clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
																						clone.type = "Bid";
																						results.push(clone);
																					}
																					else{
																						if(params_result.length && params_result.length>0){
																							var newDate = validTo.getDate() - (- params_result[0].value);
																							validTo.setDate(newDate);
																						}
																						if(validTo >= (new Date()) && bids[i].current_bid_at){																							
																									var clone = JSON.parse(JSON.stringify(bids[i]));
																									//clone.text = bids[i].product_type_name +" "+ bids[i].brand_name +" "+ bids[i].model +" "+ bids[i].variant ;
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
																				delete service_query.discount;
																				delete service_query.current_bid_amount;
																				delete service_query.net_price;
																				delete service_query.year_of_reg;
																				delete service_query.km_done;
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
								   {country:  { $in: terms }},
								   {state:  { $in: terms }},
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
							clone.text = result[i].location +", "+ result[i].city +", "+ result[i].country ;
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


