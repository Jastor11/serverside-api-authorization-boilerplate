const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
	// User has already had their email and password auth'd
	// We just need to give them a token
	res.send({ token: tokenForUser(req.user) });
	// req.user comes from passport localStrategy done(null, user) function
}

exports.signup = function(req, res, next) {
	// Pull email and password off of request body
	const email = req.body.email;
	const password = req.body.password;
	
	if (!email || !password) {
		return res.status(422).send({ error: 'You must provide email and password'});
	}

	// Check to see if user exists and send error if one already does
	User.findOne( { email: email }, function(err, existingUser) {
		if (err) { return next(err); }
		
		if (existingUser) {
			return res.status(422).send({ error: 'Email is in use' });
		}
		
		// Otherwise create a new user with the given email and password
		const user = new User({
			email: email,
			password: password
		});
		
		// Save the user and send back a success true signal
		user.save(function(err) {
			if (err) { return next (err); }
			
			res.json({token: tokenForUser(user)});
		});
	});
}

exports.noChance = function(req, res, next) {
	res.send({ works: "true" });
}

exports.home = function(req, res, next) {
	res.send({ home: "You here, biatch!"});
}