const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
	'cid'              : String,
	"cName"            : String,
	'tName'            : String,
	'sNum'             : String,
	'profile'          : String,
	'grade'            : String,
	'weekDate'         : String
});

courseSchema.statics.addOneCourse = function(data, callback){
	const c = new Course(data);
	c.save(callback);
}

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;