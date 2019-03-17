const mongoose = require('mongoose');

var PaymentTxnSchema = new mongoose.Schema({
	user_id:{
		type: String,
		required: true 
	},
	subscription_id:{
		type: String,
		required: true 
	},
	app_id:{
		type: String 
	},
	role_id:{
		type: String
	},
	mobile:{
		type: String 
	},
	ORDERID:{
		type: String 
	},
	MID:{
		type: String 
	},
	TXNID:{
		type: String 
	},
	TXNAMOUNT:{
		type: Number 
	},
	PAYMENTMODE:{
		type: String 
	},
	CURRENCY:{
		type: String 
	},
	TXNDATE:{
		type: String 
	},
	STATUS:{
		type: String 
	},
	TXNTYPE:{
		type: String 
	},
	RESPCODE:{
		type: String 
	},
	RESPMSG:{
		type: String 
	},
	GATEWAYNAME:{
		type: String 
	},
	BANKTXNID:{
		type: String 
	},
	BANKNAME:{
		type: String 
	},
	REFUNDAMT:{
		type: Number 
	},
	CHECKSUMHASH:{
		type: String 
	},
	txn_requested:{
		type: Boolean 
	},
	checksum_verified:{
		type: Boolean 
	},
	txn_verified:{
		type: Boolean 
	},
	sub_mapping_verified:{
		type: Boolean 
	},	
	createdAt:{
		type: Date
	}
});

mongoose.model('PaymentTxn', PaymentTxnSchema);