const xlsx = require('node-xlsx');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const url = require('url');
const Student = require('../models/Student');
const dateformat = require('date-format');



// 显示学生清单界面
exports.showStudentList = (req, res) => {
	res.render('./teacher/studentList',{
		page: 'list'
	})
};
// 显示学生名单上传界面
exports.showStudentListUpdate = (req, res) => {
	res.render('./teacher/studentListUpdate',{
		page: 'update'
	});
};

//显示增加学生界面
exports.showStudentAdd = (req, res) => {
	res.render('./teacher/studentadd', {
		page: 'add'
	});
};
// 显示学生密码管理界面
exports.showStudentPassword = (req, res) => {
	res.render('./teacher/studentPassword', {
		page: 'password'
	})
};


// 执行表格的上传
exports.doAdminStudentUpdate = (req, res) => {
	const form = new formidable.IncomingForm();
	form.uploadDir = './uploads';
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(path.extname(files.studentexcel.path) != '.xlsx'){
			//删除这个不正确的文件
			
			fs.unlink('./' + files.studentexcel.path, (err) => {
				if(err){
					console.log('删除文件错误');
					return;
				};
				res.send('文件格式有误，请重新上传');
			});
			return;
		};
		const studentList = xlsx.parse('./' + files.studentexcel.path);
		// console.log(studentList[1]);
		if(studentList.length != 6){
			res.send('分表缺失，请检查');
			return;
		};
		for(var i = 0; i < 6; i ++){
			if(studentList[i].data[0][0] != '学号' || studentList[i].data[0][1] != '姓名'){
				res.send('第' + (i+1) + '页分表表头错误，请检查');
				return;
			};
		};
		Student.updateStudent(studentList);
		
		res.send('学生名单更新成功！');
	});
};

// 全部学生数据
exports.getAllStudent = (req, res) => {
	// 拿到参数
	var rows = Number(url.parse(req.url,true).query.rows);
	var page = Number(url.parse(req.url, true).query.page);
	var sidx = url.parse(req.url,true).query.sidx;
	var sord = url.parse(req.url,true).query.sord;
	var keyword = url.parse(req.url,true).query.keyword;

	var sordNumber = sord == 'asc' ? 1 : -1;
	// 根据是否有 keyword 的请求参数，来决定接口的用途。
	if(keyword == undefined || keyword == ''){
		var findFiler = {}; // 检索全部
	}else{// 使用正则表达式的构造函数将字符串转为再正则对象
		var regexp = new RegExp(keyword, 'g');
		var findFiler = {
			$or : [
				{'sid': regexp},
				{'name': regexp},
				{'grade': regexp}
			]
		};
	};
	// 分页算法
	Student.countDocuments(findFiler, (err, count) => {
		var total = Math.ceil(count / rows);
		// 排序、分页
		var sortobj = {};
		sortobj[sidx] = sordNumber;

		
		// 模糊查询，全字段查询
		Student.find(findFiler).sort(sortobj).skip(rows * (page - 1)).limit(rows).exec(function(err,results){
			res.json({'records': count, 'page': page, 'total': total, 'rows':results});
		});
	});
};

// 修改学生数据
exports.changeStudentData = (req, res) => {
	var sid = parseInt(req.params.sid);
	var form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		var key = fields.cellname;
		var value = fields.value;
		Student.find({'sid': sid}, (err, results) => {
			console.log(results)
			if(results.length == 0){
				res.send({'result': -1});
				return;
			};
			var thestudent = results[0];
			thestudent[key] = value;
			thestudent.save(function(err){
				if(err){
					res.send({'result': -2});
					return;
				};
				res.send({'result': 1});
			});
		});
	});
};

// 增加一名学生
exports.doStudentAdd = (req, res) => {
	const regSid = /^[0-9]/;
	const regName = /^[A-z]+$|^[\u4E00-\u9FA5]+$/;
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		const sid = fields.sidTxt;
		const name = fields.nameTxt;
		const grade = fields.gradeSelect;
		const password = fields.passwordTxt;
		const submit = fields.submit;
		Student.find({sid: sid}, (err, result) => {
			if(result.length != 0){
				res.json({result: -1});
				return;
			}else if(submit == "1" && regSid.test(sid) && regName.test(name)){
				res.json({result: 1});
				Student.addOneStudent({
					'sid': sid,
					'name': name,
					'grade': grade,
					'password': password
				});
			};
		});
		
	});
};

// 删除一名学生
exports.doStudentDel = (req, res) => {
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		Student.remove({'sid': fields.arr}, function(err){
			if(err){
				res.json({'result': -1});
			}else{
				res.json({'result': 1});
			};
		});
	});
};

// 下载学生清单表格
exports.downloadStudentXlsx = (req, res) => {
	// 整理数据
	var tableR = [];
	var gradeArr = ['初一', '初二', '三', '高一', '高二', '高三'];
	function iterator(i){ // 迭代器
		if(i == 6){
			var buffer = xlsx.build(tableR);
			var filename = dateformat('yyyy年mm月dd日hhmmss', new Date());
			fs.writeFile('./public/xlsx/' + '学生清单' + filename + '.xlsx', buffer, function(err){
				res.redirect('/xlsx/' + '学生清单' + filename + '.xlsx');
			})
			return;
		};
		Student.find({'grade': gradeArr[i]}, function(err, results){
			var sheetR = [];
			results.forEach(function(item){
				sheetR.push([
					item.sid,
					item.name,
					item.grade,
					item.password
				]);
			});
			tableR.push({'name': gradeArr[i], data: sheetR});
			iterator(++ i);
		});	
	};
	iterator(0);

};

