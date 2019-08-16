const express = require('express')
const mongoose = require('mongoose')

const students = require('./routes/api/students')
const courses = require('./routes/api/courses')
const teachers = require('./routes/api/teachers')
const admins = require('./routes/api/admins')

const bodyParser = require('body-parser')
const passport = require('passport')

// 创建 app
const app = new express()

//设置跨域
app.all('*', function(req, res, next) {
	   res.header("Access-Control-Allow-Origin", "*");
	 	 res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, content-Type, Accept, Authorization");
	   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	   res.header("X-Powered-By",' 3.2.1');
	   res.header("Content-Type", "application/json;charset=utf-8");
	   next();
	});

// db config
const db = require('./config/keys').mongoURI;

// 使用 body-parser 中间件
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// passport 初始化
app.use(passport.initialize());

require('./config/passport')(passport);
// // connect to mongodb
mongoose.connect(db, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected'))
	.catch(err => console.log(err));

// app.use(express.static('public'));
app.get('/', (req, res) => {
	res.send('nihao')
})
// 使用 routes
app.use('/api/users', students)
app.use('/api/users', teachers)
app.use('/api/users', admins)
app.use('/api/users', courses)
app.listen(3000);