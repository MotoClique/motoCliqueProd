//Schedule Job Here
var cron = require('node-cron');
var mongoose = require('mongoose');
var bidClosedChecktask = null;
var Parameter = mongoose.model('Parameter');
var ctrlNotification = require('./controllers/notification');
var Bid = mongoose.model('Bid');

module.exports.scheduleBidClosedCheckJob = function(){//
	//Get Config
	Parameter.find({},function(params_err, params_result){
		var params = {};
		if(params_result){
				for(var p =0; p<params_result.length; p++){
					params[params_result[p].parameter] = params_result[p].value;
				}
				if(params['bid_slot_to'] && params['bid_slot_days']){
					var min = (params['bid_slot_to']).split(':')[1]; min = (min - (-5)).toString();
					var hr = (params['bid_slot_to']).split(':')[0];
					var day = (params['bid_slot_days']).replace(/\//g,",");
					
					var checkBidClosed_func = function(){
						module.exports.checkBidClosed(params);
					};
					module.exports.scheduleJob(min.trim(),hr.trim(),'','',day.trim(),bidClosedChecktask,checkBidClosed_func);
				}
		}
	});
};

module.exports.scheduleJob = function(min,hr,date,month,day,task,task_func){//
	if(task)
		task.destroy();
	var timeExpression = ''+((min)?min:"*")+
						' '+((hr)?hr:"*")+
						' '+((date)?date:"*")+
						' '+((month)?month:"*")+
						' '+((day)?day:"*");
	console.log("Job scheduled on: "+timeExpression);
	task = cron.schedule(timeExpression, () =>  {
		  task_func();
	},
	{
	  scheduled: false
	});
			 
	task.start();
};

module.exports.stopBidClosedCheckJob = function(){//
	bidClosedChecktask.stop();
};

module.exports.checkBidClosed = function(params){//
	var min = (params['bid_slot_to']).split(':')[1];
	var hr = (params['bid_slot_to']).split(':')[0];
	var bid_slot_to = new Date();
	bid_slot_to.setHours(hr);
	bid_slot_to.setMinutes(min);
	bid_slot_to.setSeconds(00);
	bid_slot_to.setMilliseconds(000);
	var query = {};
	query.deleted = {"$ne": true};
	query.bid_valid_to = {"$eq": bid_slot_to};
	Bid.find(query, function(bid_err, bid_result){
		if(bid_result && bid_result.length>0){
			var results = [];
			var loopCount = 0;				
			bid_result.forEach(function(currentValue, index, arr){	
				ctrlNotification.sendBidClosedNotification(currentValue);
			});
		}
	});
};

