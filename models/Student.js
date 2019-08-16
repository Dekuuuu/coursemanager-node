const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
	pid: {
		type: String,
		tequired: true
	},
	name:{
		type: String,
		required:true 
	},
	grade:{
		type: String,
		required:true
	},
	firstpwd:{
		type: String,
		required:true
	},
	identity:{
		type: String,
		default: 'student'
	},
	changePassword:{
		type: Boolean,
		default:false
	},
	course:{
		type: Array
	}
});

studentSchema.statics.updateStudent = function(studentList){
	var str = 'ABCDEFGHIJKLMNPQRSTUVWSYZabcdefghijklmnpqrstuvwsyz123456789@#$%*';
	var gradeArr = ['初一','初二','初三','高一','高二','高三']
	mongoose.connection.collection('students').drop(() => {
		for(let i = 0; i < 6; i ++){
			for(let j = 1; j < studentList[i].data.length; j ++){
				let firstpwd = '';
				for(let m = 0; m < 6; m ++){
					firstpwd += str.charAt(parseInt(str.length * Math.random()));
				};
				var s = new Student({
					'pid'              : studentList[i].data[j][0],
					'name'             : studentList[i].data[j][1],
					'grade'            : gradeArr[i],
					'firstpwd'         : firstpwd
				});
				s.save();
			};
		};
	});
};

// 新增一个学生
studentSchema.statics.addOneStudent = function(data){
	const s = new Student(data);
	s.save();
};
module.exports = Student = mongoose.model('students', studentSchema);

