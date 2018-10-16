const mongoose = require('mongoose');


var ThumbsDownSchema = new mongoose.Schema({
	service_id:{
		type: String
	},
	thumbs_down_id:{
		type: String,
		required: true,
		index: true,
		unique: true
	},
	feedback_id:{
		type: String
	},
	active:{
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

ThumbsDownSchema.index({ thumbs_down_id: 1},{unique: true});
mongoose.model('ThumbsDown', ThumbsDownSchema);
