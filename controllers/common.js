
const request = require('request');
var mongoose = require('mongoose');

//////////////////////////UTC Conversion////////////////////////////////
var Profile = mongoose.model('Profile');
var Parameter = mongoose.model('Parameter');

module.exports.convertFromUTC = function(from_date,to,callback){//convert from utc
	var date = new Date(from_date.getTime());
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

module.exports.convertToUTC = function(from_date,from,callback){//convert to utc
	var date = new Date(from_date.getTime());
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


module.exports.convertDateTime = function(from_date,diff){//convert the date and time zone
	var date = new Date(from_date.getTime());
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

