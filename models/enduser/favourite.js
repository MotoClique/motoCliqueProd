const mongoose = require('mongoose');


var FavSchema = new mongoose.Schema({
	user_id:{
		type: String
	},
	bid_sell_buy_id:{
		type: String,
		required: true,
		index: true
	},
	type:{
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

mongoose.model('Fav', FavSchema);
