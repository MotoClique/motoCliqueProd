const mongoose = require('mongoose');

var ChatDetailSchema = new mongoose.Schema({
	chat_id:{
		type: String,
		required: true
	},
	post_id:{
		type: String 
	},
	user_id:{
		type: String 
	},
	text:{
		type: String 
	},
  read:{
		type: Boolean 
	},
	post_deletion:{
		type: Boolean 
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

mongoose.model('ChatDetail', ChatDetailSchema);
