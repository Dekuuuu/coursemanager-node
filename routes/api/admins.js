// @login & register
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const keys = require('../../config/keys');
const passport = require('passport');
const Admin = require('../../models/Admin');

// @route  POST api/users/register 模拟注册
// @desc   返回的请求的json数据
// @access public
router.post('/adminregister', (req, res) => {
  // 查询数据库中是否拥有邮箱
  Student.findOne({ pid: req.body.pid }).then(admin => {
    if (admin) {
			return res.status(400).json('id已被注册!');
    } else {
      const avatar = gravatar.url(req.body.gravatar, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      const newAdmin = new Admin({
				pid: req.body.pid,
        name: req.body.name,
        avatar,
        password: req.body.password,
        identity: req.body.identity
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
          if (err) throw err;

          newAdmin.password = hash;

          newAdmin
            .save()
            .then(admin => res.json(admin))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route  POST api/users/studentlogin 学生身份登录
// @desc   返回token jwt passport
// @access public
router.post('/adminlogin', (req, res) => {
  const pid = req.body.pid;
  const password = req.body.password;
  // 查询数据库
  Admin.findOne({ pid }).then(admin => {
    if (!admin) {	
				return res.status(404).json('用户不存在!')
    }

    // 密码匹配
    bcrypt.compare(password, admin.password).then(isMatch => {
      if (isMatch) {
        const rule = {
					id: admin.id,
					pid: admin.pid,
					name: admin.name,
					avatar: admin.avatar,
					identity: admin.identity
        }
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

// @route  GET api/users/current 验证 token
// @desc   return current user
// @access Private
router.get(
  '/acurrent',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		console.log(req)
    res.json({
      pid: req.user.pid,
      name: req.user.name,
      identity: req.user.identity
    });
  }
);

module.exports = router;
