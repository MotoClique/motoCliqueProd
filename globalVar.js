//Handle Global Variable
var globalVar = {hostname: "https://motoclique.in"};

module.exports.setGlobalVariable = function(param,val){
	if(!globalVar[param])
		globalVar[param] = val;
};

module.exports.getGlobalVariable = function(param){
	if(param)
		return globalVar[param];
	else
		return globalVar;
};
