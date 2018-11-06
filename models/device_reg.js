var mongoose = require('mongoose');


var DeviceRegSchema = new mongoose.Schema({
	user_id:{
		type: String,
		required: true,
		index: true,
		unique: true
	},
	device_reg_id:{
		type: String
	}
});
DeviceRegSchema.index({ user_id: 1},{unique: true});

mongoose.model('DeviceReg', DeviceRegSchema);
