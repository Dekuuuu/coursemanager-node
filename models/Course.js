const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
	pid: {
		type: String,
		tequired: true
	},
	name:{
		type: String,
		required:true 
	},
	tname:{
		type: String,
		required:true
	},
	time:{
		type: String,
		required:true
	},
	num:{
		type: Number,
		required:true
	},
	lnum:{
		type: Number,
		default: 0
		
	},
	info:{
		type: String
		// required:true
	},
});

courseSchema.statics.addOneCourse = function(data, callback){
	const c = new Course(data);
	c.save(callback);
}

const Course = mongoose.model('courses', courseSchema);
module.exports = Course;