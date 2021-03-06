
const async = require("async");
const request = require('request');
var mongoose = require('mongoose');
var Counter = mongoose.model('Counter');

//////////////////////////ThumbsUp////////////////////////////////
const ThumbsUp = mongoose.model('ThumbsUp');

module.exports.getThumbsUp = function(req,res){//Fetch
	var query = {};
	if(req.query.thumbs_up_id){
		query.thumbs_up_id = {"$eq":req.query.thumbs_up_id};
	}
	if(req.query.service_id){
		query.service_id = {"$eq":req.query.service_id};
	}
	if(req.query.feedback_id){
		query.feedback_id = {"$eq": req.query.feedback_id};
	}
	if(req.query.createdBy){
		query.createdBy = {"$eq": req.query.createdBy};
	}
	
	if(req.query.deleted){
		query.deleted = {"$eq":req.query.deleted};
	}
	else{
		query.deleted = {"$ne": true};
	}
	ThumbsUp.find(query,function(err, result){
		res.json({results: result, error: err});
	});
};
module.exports.addThumbsUp = function(req,res){//Add New
	var thumbs_up_id = "0";
	Counter.getNextSequenceValue('thumbs_up',function(sequence){
		if(sequence){
			var index_count = sequence.sequence_value;
			var d = new Date();
			var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
			
			var doc = req.body;
			doc.thumbs_up_id = thumbs_up_id - (-index_count);
			doc.createdAt = d;
			doc.changedAt = d;
			doc.createdBy = req.payload.user_id;
			doc.changedBy = req.payload.user_id;
			
			let newThumbsUp = new ThumbsUp(doc);
			
			newThumbsUp.save((err, result)=>{
				if(err){
					res.json({statusCode: 'F', msg: 'Failed to add thumbs up', error: err});
				}
				else{
					var Feedback = mongoose.model('Feedback');
					Feedback.find({feedback_id: {"$eq":doc.feedback_id}},function(feedback_find_err, feedback_result){
						if(feedback_find_err){
							res.json({statusCode: 'F', msg: 'Thumbs Up added but Failed to update feedback', results:result, error: feedback_find_err});
						}
						else if(feedback_result.length>0){
							var updateFeedback = JSON.parse(JSON.stringify(feedback_result[0]));
							updateFeedback.thumbs_up_no = (updateFeedback.thumbs_up_no) ? updateFeedback.thumbs_up_no : '0';
							updateFeedback.thumbs_up_no = updateFeedback.thumbs_up_no - (-1);
							Feedback.findOneAndUpdate({_id:updateFeedback._id},{$set: updateFeedback},{},(feedback_update_err, feedback_updated)=>{
								if(feedback_update_err){
									res.json({statusCode: 'F', msg: 'Thumbs Up added but Failed to update feedback', results:result, error: feedback_update_err});
								}
								else{
									res.json({statusCode: 'S', msg: 'Thumbs Up & Feedback Entry updated successfully', results:result, updated: feedback_updated});
								}
							});
						}
						else{
							res.json({statusCode: 'F', msg: 'Thumbs Up added but Failed to update feedback', results:result, error: err});
						}
					});
				}
			});
		}
		else{
			res.json({statusCode: 'F', msg: 'Unable to generate sequence number.'});
		}
	});
};
module.exports.updateThumbsUp = function(req,res){//Update
	var d = new Date();
	var at = d.getDate() +"/"+ (d.getMonth() - (-1)) +"/"+ d.getFullYear() ;
	var doc = req.body;
		delete doc.createdAt;
		delete doc.createdBy;
		doc.changedAt = d;
		doc.changedBy = req.payload.user_id;
		
	ThumbsUp.findOneAndUpdate({_id:doc._id},{$set: doc},{},(err, updated)=>{
		if(err){
			res.json({statusCode: 'F', msg: 'Failed to update', error: err});
		}
		else{
			res.json({statusCode: 'S', msg: 'Entry updated', updated: updated});
		}
	});
};
module.exports.deleteThumbsUp = function(req,res){//Delete
	ThumbsUp.remove({_id: req.params.id}, function(err,result){
		if(err){
			res.json(err);
		}
		else{
			res.json(result);
		}
	});
};
