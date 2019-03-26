const mongoose = require('mongoose');


var OtpSchema = new mongoose.Schema({
	mobile:{
		type: String,
		index: true
	},
	email:{
		type: String,
		index: true
	},
	otp:{
		type: String
	},
	time: {
		type: Date
	}
});

mongoose.model('Otp', OtpSchema);