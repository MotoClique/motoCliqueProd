const mongoose = require('mongoose');

var ChatInboxSchema = new mongoose.Schema({
	index_count:{
		type: Number,
		required: true
	},
	chat_id:{
		type: String,
		required: true
	},
	post_id:{
		type: String 
	},
	post_type:{
		type: String 
	},
	from_user:{
		type: String 
	},
	to_user:{
		type: String 
	},
	post_deletion:{
		type: Boolean 
	},
	from_deleted:{
		type: Boolean 
	},
  to_deleted:{
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
ChatInboxSchema.index({ index_count:1, chat_id: 1},{unique: true});
mongoose.model('ChatInbox', ChatInboxSchema);
