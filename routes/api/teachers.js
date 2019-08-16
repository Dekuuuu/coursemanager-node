// @login & register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const keys = require("../../config/keys");
const passport = require("passport");
const Teacher = require("../../models/Teacher");

const url = require("url");

// @route  POST api/users/register
// @desc   返回的请求的json数据
// @access public
router.post('/teacherregister', (req, res) => {
  // 查询数据库中是否拥有邮箱
  Teacher.findOne({ tid: req.body.pid }).then(user => {
    if (user) {
      return res.status(400).json('邮箱已被注册!');
    } else {
      const avatar = gravatar.url(req.body.gravatar, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      const newTeacher = new Teacher({
        name: req.body.name,
        pid: req.body.pid,
        avatar,
        password: req.body.password,
        identity: req.body.identity
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newTeacher.password, salt, (err, hash) => {
          if (err) throw err;

          newTeacher.password = hash;

          newTeacher
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route  POST api/users/login
// @desc   返回token jwt passport
// @access public

router.post('/teacherlogin', (req, res) => {
  const pid = req.body.pid;
  const password = req.body.password;
  // 查询数据库
  Teacher.findOne({ pid }).then(teacher => {
    if (!teacher) {
      return res.status(404).json('用户不存在!');
    }

    // 密码匹配
    bcrypt.compare(password, teacher.password).then(isMatch => {
      if (isMatch) {
        const rule = {
					id: teacher.id,
					pid: teacher.pid,
          name: teacher.name,
          avatar: teacher.avatar,
          identity: teacher.identity
        };
        jwt.sign(rule, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
        });
        // res.json({msg:"success"});
      } else {
        return res.status(400).json('密码错误!');
      }
    });
  });
});

// @route  GET api/users/current
// @desc   return current user
// @access Private
router.get(
  '/tcurrent',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		console.log(req.user)
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      identity: req.user.identity
    });
  }
);

// 增加单个教师
router.post(
  "/addteacher",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const teacherFields = {};
    const str =
      "ABCDEFGHIJKLMNPQRSTUVWSYZabcdefghijklmnpqrstuvwsyz123456789@#$%*";
    if (req.body.pid) teacherFields.pid = req.body.pid;
    if (req.body.name) teacherFields.name = req.body.name;
    if (req.body.course) teacherFields.course = req.body.course;
    let firstpwd = "";
    for (let m = 0; m < 6; m++) {
      firstpwd += str.charAt(parseInt(str.length * Math.random()));
    }
    teacherFields.firstpwd = firstpwd;
    new Teacher(teacherFields).save().then(teacher => {
      res.json(teacher);
    });
  }
);

// 获取所有教师
router.get(
  "/allteacher",
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
					{'grade': regexp}
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
    Teacher.countDocuments(findFiler, (err, count) => {
			const sortobj = {}
			sortobj[sortItem] = sortNumber
			Teacher.find(findFiler).sort(sortobj).limit(page_size).skip(page_size * page_index).exec((err, teacher) => {
				if (!teacher) {
          return res.status(404).json("没有任何内容")
        }
        res.json({'total': count, 'data': teacher})
			})
		})
	}
)

// 更改教师
router.post('/changeteacher', passport.authenticate('jwt', { session: false }),
(req, res) => {
	const updatefileds = {}
	const _id = req.body._id
	updatefileds.pid = req.body.pid
	updatefileds.course = req.body.course
	updatefileds.name = req.body.name
	Teacher.findOneAndUpdate(
		{_id: _id},
		{$set: updatefileds},
		{new: true}).then(teacher => {
			res.json(teacher)
		})
})

// 删除学生
router.delete(
	'/deletetea',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		console.log(url.parse(req.url, true).query._id)
    Teacher.findOneAndRemove({ _id: url.parse(req.url, true).query._id })
      .then(teacher => {
      teacher.save().then(teacher => res.json(teacher))
    })
      .catch(err => res.status(404).json('删除失败!'));
	}
)
module.exports = router;
