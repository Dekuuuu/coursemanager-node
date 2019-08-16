const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
	name:{
		type: String,
		required:true //设定是否必填
	},
	pid:{
		type: String,
		required:true
	},
	firstpwd:{
		type: String,
		required:true
	},
	avatar:{
		type: String
	},
	identity:{
		type: String,
		default:'teacher'
	},
	date:{
		type: Date,
		default:Date.now
	},
	changePassword:{
		type: Boolean,
		default:false
	},
	course:{
		type: Array,
		default: []
	}
})

module.exports = Teacher = mongoose.model('teachers', UserSchema);