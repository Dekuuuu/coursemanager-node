const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
	pid: {
		type: String,
		tequired: true
	},
	name: {
		type: String,
		tequired: true
	},
	password:{
		type: String,
		required:true
	},
	identity:{
		type: String,
		default: 'admin'
	}
});

module.exports = Admin = mongoose.model('admins', adminSchema);


