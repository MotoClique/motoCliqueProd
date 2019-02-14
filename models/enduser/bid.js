const mongoose = require('mongoose');


var BidSchema = new mongoose.Schema({
	user_id:{
		type: String
	},
	index_count:{
		type: Number,
		required: true
	},
	bid_id:{
		type: String,
		required: true
	},
	product_id:{
		type: String 
	},
	product_type_id:{
		type: String 
	},
	product_type_name:{
		type: String 
	},
	brand_id:{
		type: String 
	},
	brand_name:{
		type: String 
	},
	model:{
		type: String 
	},
	variant:{
		type: String 
	},
	default_image_path:{
		type: String 
	},
	color:{
		type: String 
	},
	number_of_image:{
		type: String 
	},
	fuel_type:{
		type: String 
	},
	body_type:{
		type: String 
	},
	transmission:{
		type: String 
	},
	owner_type:{
		type: String 
	},
	listing_by:{
		type: String 
	},
	verified_feature:{
		type: String 
	},
	insurance:{
		type: String 
	},
	accessories:{
		type: String 
	},
	reg_state:{
		type: String 
	},
	address_id:{
		type: String 
	},
	country:{
		type: String 
	},
	state:{
		type: String 
	},
	city:{
		type: String 
	},
	location:{
		type: String 
	},
	year_of_reg:{
		type: Number 
	},
	km_done:{
		type: Number 
	},
	bid_amount:{
		type: Number 
	},
	min_bid_hike:{
		type: Number 
	},
	current_bid_amount:{
		type: Number
	},
	display_amount:{
		type: String
	},
	current_bid_by:{
		type: String
	},
	current_bid_at:{
		type: String
	},
	bid_valid_from:{
		type: String
	},
	bid_valid_to:{
		type: Date, default: Date.now
	},
	bid_status:{
		type: String
	},
	active:{
		type: String,
		maxlength: 1
	},
	note:{
		type: String 
	},
	insurance_valid_till:{
		type: String 
	},
	tyre_cond:{
		type: String 
	},
	interior_cond:{
		type: String 
	},
	exterior_cond:{
		type: String 
	},
	mobile:{
		type: String 
	},
	place_of_reg:{
		type: String 
	},
	accident_history:{
		type: String 
	},
	insurance_status:{
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
BidSchema.index({ index_count:1, bid_id: 1},{unique: true});
mongoose.model('Bid', BidSchema);
