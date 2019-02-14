const mongoose = require('mongoose');


var PlaceOfRegSchema = new mongoose.Schema({
	reg_number:{
		type: String
	},
	place:{
		type: String
	},
	state:{
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

PlaceOfRegSchema.index({ reg_number: 1},{unique: true});
mongoose.model('PlaceOfReg', PlaceOfRegSchema);
