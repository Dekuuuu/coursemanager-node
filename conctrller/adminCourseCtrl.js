// const formidable = require('formidable');
const url = require('url');
const Course = require('../models/Course');

// 添加课程
exports.doCourseAdd = (req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		const newCourse = {
			'cid': fields.cid,
			'cName': fields.cName,
			'tName': fields.tName,
			'sNum': fields.sNum,
			'profile': fields.profile,
			'grade': fields.grade,
			'weekDate': fields.weekDate
		}
		Course.addOneCourse(newCourse);
		console.log(newCourse)
		res.json({result: 1});
	});
	
};

// 全部学生数据
exports.getAllCourse = (req, res) => {
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
				{'cid': regexp},
				{"cName": regexp},
				{'tName': regexp},
				{'sNum': regexp},
				{'profile': regexp},
				{'grade': regexp},
				{'weekDate': regexp}
			]
		};
	};
	// 分页算法
	Course.countDocuments(findFiler, (err, count) => {
		var total = Math.ceil(count / rows);
		// 排序、分页
		var sortobj = {};
		sortobj[sidx] = sordNumber;

		
		// 模糊查询，全字段查询
		Course.find(findFiler).sort(sortobj).skip(rows * (page - 1)).limit(rows).exec(function(err,results){
			res.json({'records': count, 'page': page, 'total': total, 'rows':results});
		});
	});
};

// 修改课程数据
exports.changeCourseData = (req, res) => {
	var cid = req.params.cid;
	var form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		var key = fields.cellname;
		var value = fields.value;
		Course.find({'cid': cid}, (err, results) => {
			if(results.length == 0){
				res.send({'result': -1});
				return;
			};
			var theCourse = results[0];
			theCourse[key] = value;
			theCourse.save(function(err){
				if(err){
					res.send({'result': -2});
					return;
				};
				res.send({'result': 1});
			});
		});
	});
};

// 删除一门课程
exports.doCourseDel = (req, res) => {
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		Course.remove({'cid': fields.arr}, function(err){
			if(err){
				res.json({'result': -1});
			}else{
				res.json({'result': 1});
			};
		});
	});
};