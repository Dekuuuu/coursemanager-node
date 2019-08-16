const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Student = mongoose.model('students');
const keys = require('./keys');

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		if(jwt_payload.identity == 'student') {
			// console.log(jwt_payload)
			Student.findById(jwt_payload.id)
			.then(user => {
				console.log(user)
				if(user){
					return done(null, user);
				}

				return done(null, false);
			})
			.catch(err => console.log(err));
		}else if(jwt_payload.identity == 'teacher') {
			// console.log(jwt_payload)
			Teacher.findById(jwt_payload.id)
			.then(user => {
				if(user){
					return done(null, user);
				}

				return done(null, false);
			})
			.catch(err => console.log(err));
		}else if(jwt_payload.identity == 'admin') {
			// console.log(jwt_payload)
			Admin.findById(jwt_payload.id)
			.then(user => {
				if(user){
					return done(null, user);
				}

				return done(null, false);
			})
			.catch(err => console.log(err));
		}
		
	}));
}