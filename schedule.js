//Schedule Job Here
var cron = require('node-cron');
var bidClosedChecktask = null;
var Parameter = mongoose.model('Parameter');

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
					module.exports.scheduleJob(min.trim(),hr.trim(),'','',day.trim(),bidClosedChecktask);
				}
		}
	});
};

module.exports.scheduleJob = function(min,hr,date,month,day,task){//
	if(task)
		task.destroy();
	var timeExpression = ''+((min)?min:"*")+
						' '+((hr)?hr:"*")+
						' '+((date)?date:"*")+
						' '+((month)?month:"*")+
						' '+((day)?day:"*");
	task = cron.schedule(timeExpression, () =>  {
		  console.log('executed task');
	},
	{
	  scheduled: false
	});
			 
	task.start();
};

module.exports.stopBidClosedCheckJob = function(){//
	bidClosedChecktask.stop();
};