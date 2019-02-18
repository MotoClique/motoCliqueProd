var csv = require('csv-express');
var mongoose = require('mongoose');
var mongoose_models = {};
mongoose_models['User'] = mongoose.model('User');
mongoose_models['UserSubMap'] = mongoose.model('UserSubMap');
mongoose_models['Counter'] = mongoose.model('Counter');
mongoose_models['DeviceReg'] = mongoose.model('DeviceReg');
mongoose_models['Profile'] = mongoose.model('Profile');
mongoose_models['Application'] = mongoose.model('Application');
mongoose_models['Role'] = mongoose.model('Role');
mongoose_models['Subscription'] = mongoose.model('Subscription');
mongoose_models['Screen'] = mongoose.model('Screen');
mongoose_models['Field'] = mongoose.model('Field');
mongoose_models['AppScrFieldsRights'] = mongoose.model('AppScrFieldsRights');
mongoose_models['ProductTyp'] = mongoose.model('ProductTyp');
mongoose_models['ProductHierarchy'] = mongoose.model('ProductHierarchy');
mongoose_models['SpecField'] = mongoose.model('SpecField');
mongoose_models['PrdTypSpecFieldMap'] = mongoose.model('PrdTypSpecFieldMap');
mongoose_models['Brand'] = mongoose.model('Brand');
mongoose_models['Product'] = mongoose.model('Product');
mongoose_models['ProductSpec'] = mongoose.model('ProductSpec');
mongoose_models['PrdImage'] = mongoose.model('PrdImage');
mongoose_models['PrdThumbnail'] = mongoose.model('PrdThumbnail');
mongoose_models['Loc'] = mongoose.model('Loc');
mongoose_models['Parameter'] = mongoose.model('Parameter');
mongoose_models['PlaceOfReg'] = mongoose.model('PlaceOfReg');

mongoose_models['UserAddress'] = mongoose.model('UserAddress');
mongoose_models['UserSubMap'] = mongoose.model('UserSubMap');
mongoose_models['UserAlert'] = mongoose.model('UserAlert');
mongoose_models['Fav'] = mongoose.model('Fav');
mongoose_models['Filter'] = mongoose.model('Filter');
mongoose_models['Sell'] = mongoose.model('Sell');
mongoose_models['Buy'] = mongoose.model('Buy');
mongoose_models['Bid'] = mongoose.model('Bid');
mongoose_models['BidBy'] = mongoose.model('BidBy');
mongoose_models['Service'] = mongoose.model('Service');
mongoose_models['Image'] = mongoose.model('Image');
mongoose_models['Thumbnail'] = mongoose.model('Thumbnail');
mongoose_models['ChatInbox'] = mongoose.model('ChatInbox');
mongoose_models['ChatDetail'] = mongoose.model('ChatDetail');
mongoose_models['Feedback'] = mongoose.model('Feedback');
mongoose_models['Rating'] = mongoose.model('Rating');
mongoose_models['ThumbsDown'] = mongoose.model('ThumbsDown');
mongoose_models['ThumbsUp'] = mongoose.model('ThumbsUp');


module.exports.exportToCsv = function(req,res){
	if(req.params.id && mongoose_models[req.params.id]){
		(mongoose_models[req.params.id]).find().lean().exec({}, function(export_err, export_data) {
			if(export_err){
				res.statusCode = 500;
				res.json({statusCode: 'F', msg: 'Unable to read table', error: export_err});
			}
			else if(export_data){
				var data_to_export = [];
				export_data.forEach(function(currentVal,index,arr){
					var entry = {};
					for (var key in currentVal) {
						if(currentVal.hasOwnProperty(key)){
							if((mongoose_models[req.params.id]).schema.path(key)){
								if((mongoose_models[req.params.id]).schema.path(key).instance == 'Buffer'){
									entry[key] = (currentVal[key]).toString('base64');
								}
								else{
									entry[key] = currentVal[key];
								}
							}
						}
					}
					
					data_to_export.push(entry);
				});
				
				var filename = (req.params.id)+'.csv';
				res.statusCode = 200;
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader("Content-Disposition", 'attachment; filename='+filename);
				res.csv(
					 data_to_export
				,true);
			}
			else{
				res.statusCode = 500;
				res.json({statusCode: 'F', msg: 'No data', error: null});
			}
		});
	}
	else{
		res.statusCode = 500;
		res.json({statusCode: 'F', msg: 'Unknown table name', error: null});
	}
};

module.exports.importFromCsv = function(req,res){
	if(req.body.data && req.body.collection && mongoose_models[req.body.collection]){
		var collectionData = req.body.data;
		var loopCount = 0;
		var responseData = {success:[], failed:[]};
		collectionData.forEach(function(currentVal,index,arr){
			var entry = {};
			for (var key in currentVal) {
				if(currentVal.hasOwnProperty(key)){
					if((mongoose_models[req.body.collection]).schema.path(key)){
						if((mongoose_models[req.body.collection]).schema.path(key).instance == 'Date'){
							entry[key] = new Date(currentVal[key]);
						}
						else if ((mongoose_models[req.body.collection]).schema.path(key).instance == 'Buffer'){
							entry[key] = new Buffer(currentVal[key],'base64');	 
						}
						else{
							entry[key] = currentVal[key];
						}
					}
				}
			}
			
			delete entry.__v;
			if(entry._id){
			(mongoose_models[req.body.collection]).update({_id:entry._id},{$set: entry},{upsert:true}, function(update_err, update_data) {
				if(update_err){
					(responseData['failed']).push({_id:entry._id, error:update_err});
				}
				else{
					(responseData['success']).push({_id:entry._id});
				}
				
				loopCount = loopCount - (-1);
				if(loopCount === collectionData.length){
					var msg = 'Import Successfully Completed.';
					if((responseData['success']).length>0 && (responseData['failed']).length>0)
					   msg = 'Import Partially Completed.';
					else if((responseData['success']).length===0 && (responseData['failed']).length>0)
					   msg = 'None of the entries were Imported.';
					res.json({statusCode: 'S', msg: msg, result:responseData, error: null});
				}
			});
			}
			else{
				var entry_arr = []; entry_arr.push(entry);
				(mongoose_models[req.body.collection]).insertMany(entry_arr, function(update_err, update_data) {
					if(update_err){
						(responseData['failed']).push({_id:null, error:update_err});
					}
					else{
						(responseData['success']).push({_id:((update_data[0])?update_data[0]._id:'')});
					}
					
					loopCount = loopCount - (-1);
					if(loopCount === collectionData.length){
						var msg = 'Import Successfully Completed.';
						if((responseData['success']).length>0 && (responseData['failed']).length>0)
						   msg = 'Import Partially Completed.';
						else if((responseData['success']).length===0 && (responseData['failed']).length>0)
						   msg = 'None of the entries were Imported.';
						res.json({statusCode: 'S', msg: msg, result:responseData, error: null});
					}
				});
			}
		});
	}
	else{
		res.statusCode = 400;
		res.json({statusCode: 'F', msg: 'Unknown table name/data', error: null});
	}
};

