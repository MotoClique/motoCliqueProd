
const request = require('request');
var mongoose = require('mongoose');

//////////////////////////UTC Conversion////////////////////////////////
var Profile = mongoose.model('Profile');
var Parameter = mongoose.model('Parameter');

module.exports.convertFromUTC = function(date,to,callback){//convert from utc
	if(to === 'IST'){
		Parameter.find({parameter:{"$eq":"to_ist"}},function(params_err, params_result){
			if(params_result && params_result.length>0){
				var diff = params_result[0].value;
				if(diff){
					var diffSplit = diff.split(':');
					var hrs = diffSplit[0]; var mins = diffSplit[1];
					if(hrs)
						date.setHours(date.getHours() - (- hrs));
					if(mins)
						date.setMinutes(date.getMinutes() - (- mins));
					callback(date,hrs+":"+mins);
				}
				else{
					callback(null,null);
				}
			}
			else{
				callback(null,null);
			}
		});
	}
	else{
		callback(null,null);
	}
};

module.exports.convertToUTC = function(date,from,callback){//convert to utc
	if(from === 'IST'){
		Parameter.find({parameter:{"$eq":"to_ist"}},function(params_err, params_result){
			if(params_result && params_result.length>0){
				var diff = params_result[0].value;
				if(diff){
					var diffSplit = diff.split(':');
					var hrs = diffSplit[0]; var mins = diffSplit[1];
					if(hrs)
						date.setHours(date.getHours() - (hrs));
					if(mins)
						date.setMinutes(date.getMinutes() - (mins));
					callback(date);
				}
				else{
					callback(null);
				}
			}
			else{
				callback(null);
			}
		});
	}
	else{
		callback(null);
	}
};


module.exports.convertDateTime = function(date,diff){//convert the date and time zone
	if(diff){
		var diffSplit = diff.split(':');
		var hrs = diffSplit[0]; var mins = diffSplit[1];
		if(hrs)
			date.setHours(date.getHours() - (- hrs));
		if(mins)
			date.setMinutes(date.getMinutes() - (- mins));
		
		return date;
	}
	else{
		return date;
	}
};

