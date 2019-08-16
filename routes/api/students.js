// @login & register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const keys = require("../../config/keys");
const passport = require("passport");
const Student = require("../../models/Student");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const url = require("url");
const xlsx = require("node-xlsx");

// @route  POST api/users/register 模拟注册
// @desc   返回的请求的json数据
// @access public
router.post("/studentregister", (req, res) => {
  // 查询数据库中是否拥有邮箱
  Student.findOne({ pid: req.body.pid }).then(student => {
    if (student) {
      return res.status(400).json("学号已被注册!");
    } else {
      const avatar = gravatar.url(req.body.gravatar, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      const newStudent = new Student({
        pid: req.body.pid,
        name: req.body.name,
        grade: req.body.grade,
        avatar,
        password: req.body.password,
        identity: req.body.identity
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newStudent.password, salt, (err, hash) => {
          if (err) throw err;

          newStudent.password = hash;

          newStudent
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route  POST api/users/studentlogin 学生身份登录
// @desc   返回token jwt passport
// @access public
router.post("/studentlogin", (req, res) => {
  console.log(req.body);
  const pid = req.body.pid;
  const password = req.body.password;
  // 查询数据库
  Student.findOne({ pid }).then(student => {
    if (!student) {
      return res.status(401).json("用户不存在!");
    }
    // 密码匹配
    bcrypt.compare(password, student.password).then(isMatch => {
      if (isMatch) {
        const rule = {
          id: student.id,
          pid: student.pid,
          name: student.name,
          avatar: student.avatar,
          identity: student.identity
        };
        jwt.sign(rule, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
        // res.json({msg:"success"});
      } else {
        return res.status(400).json("密码错误!");
      }
    });
  });
});

// @route  GET api/users/current 验证 token
// @desc   return current user
// @access Private
router.get(
  "/scurrent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // console.log(req)
    res.json({
      sid: req.user.sid,
      name: req.user.name,
      grade: req.user.grade,
      identity: req.user.identity
    });
  }
);

router.get(
  "/allstudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // 拿到参数
    const page_size = Number(url.parse(req.url, true).query.page_size)
		const page_index = Number(url.parse(req.url, true).query.page_index) - 1
		const sort = url.parse(req.url, true).query.sort
		const keyword = url.parse(req.url, true).query.keyword
		const sortItem = url.parse(req.url, true).query.sortItem
		// 模糊查询
		if(keyword == undefined || keyword == ''){
			var findFiler = {}; // 检索全部
		}else{// 使用正则表达式的构造函数将字符串转为再正则对象
			const regexp = new RegExp(keyword, 'g');
			var findFiler = {
				$or : [
					{'pid': regexp},
					{'name': regexp},
					{'grade': regexp},
					{'course': regexp}
				]
			}
		}
		let sortNumber
		if(sort == 'ascending'){
			sortNumber = -1
		}else if(sort == 'descending') {
			sortNumber = 1
		}else{
			sortNumber = -1
		}
		
    // const sidx = url.parse(req.url, true).query.sidx;
    // const sord = url.parse(req.url, true).query.sord;
    // const keyword = url.parse(req.url, true).query.keyword;
    Student.countDocuments(findFiler, (err, count) => {
			const sortobj = {}
			sortobj[sortItem] = sortNumber
			Student.find(findFiler).sort(sortobj).limit(page_size).skip(page_size * page_index).exec((err, student) => {
				if (!student) {
          return res.status(404).json("没有任何内容")
        }
        res.json({'total': count, 'data': student})
			})
		})
  }
);

// @route  POST api/users/addstudent
// @desc   创建信息接口
// @access Private
router.post(
  "/addstudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const studentFields = {};
    const str =
      "ABCDEFGHIJKLMNPQRSTUVWSYZabcdefghijklmnpqrstuvwsyz123456789@#$%*";
    if (req.body.pid) studentFields.pid = req.body.pid;
    if (req.body.name) studentFields.name = req.body.name;
    if (req.body.grade) studentFields.grade = req.body.grade;
    let firstpwd = "";
    for (let m = 0; m < 6; m++) {
      firstpwd += str.charAt(parseInt(str.length * Math.random()));
    }
    studentFields.firstpwd = firstpwd;
    new Student(studentFields).save().then(student => {
      res.json(student);
    });
  }
);

// @route  POST api/users/studentupdate
// @desc   创建信息接口
// @access
router.post(
  "/studentupdate",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = "./uploads";
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (path.extname(files.studentexcel.path) != ".xlsx") {
        //删除这个不正确的文件

        fs.unlink("./" + files.studentexcel.path, err => {
          if (err) {
            console.log("删除文件错误");
            return;
          }
          res.send("文件格式有误，请重新上传");
        });
        return;
      }
      const studentList = xlsx.parse("./" + files.studentexcel.path);
      if (studentList.length != 6) {
        res.send("分表缺失，请检查");
        return;
      }
      for (var i = 0; i < 6; i++) {
        if (
          studentList[i].data[0][0] != "学号" ||
          studentList[i].data[0][1] != "姓名"
        ) {
          res.send("第" + (i + 1) + "页分表表头错误，请检查");
          return;
        }
      }
      Student.updateStudent(studentList);

      // res.send("学生名单更新成功！");
    });
  }
);

// 更改学生
router.post('/changestudent', passport.authenticate('jwt', { session: false }),
(req, res) => {
	const updatefileds = {}
	const _id = req.body._id
	updatefileds.pid = req.body.pid
	updatefileds.grade = req.body.grade
	updatefileds.name = req.body.name
	Student.findOneAndUpdate(
		{_id: _id},
		{$set: updatefileds},
		{new: true}).then(student => {
			res.json(student)
		})
})

// 删除学生
router.delete(
  '/deletestu',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		console.log(url.parse(req.url, true).query._id)
    Student.findOneAndRemove({ _id: url.parse(req.url, true).query._id })
      .then(student => {
        student.save().then(student => res.json(student))
      })
      .catch(err => res.status(404).json('删除失败!'));
  }
);
module.exports = router;
