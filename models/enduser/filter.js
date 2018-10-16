const mongoose = require('mongoose');


var FilterSchema = new mongoose.Schema({
	user_id:{
		type: String
	},
	filter_field:{
		type: String 
	},
	filter_value:{
		type: String
	},
	deleted:{
		type: Boolean 
	},
	createdBy:{
		type: String 
	},
	createdAt:{
		type: Date 
	},
	changedBy:{
		type: String 
	},
	changedAt:{
		type: Date 
	}
});

mongoose.model('Filter', FilterSchema);