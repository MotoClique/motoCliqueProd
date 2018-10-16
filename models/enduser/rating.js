const mongoose = require('mongoose');


var RatingSchema = new mongoose.Schema({
	service_id:{
		type: String
	},
	rating_id:{
		type: String,
		required: true,
		index: true,
		unique: true
	},
	rating:{
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

RatingSchema.index({ rating_id: 1},{unique: true});
mongoose.model('Rating', RatingSchema);
