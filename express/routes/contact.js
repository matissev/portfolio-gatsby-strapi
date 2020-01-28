var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config');
var nodemailer = require('nodemailer');
var pug = require('pug');
var moment = require('moment');

var transporter = nodemailer.createTransport({
	service:"Gmail",
	auth:{
		type: 'OAuth2',
		user: config.mailUser,
		clientId: config.mailClientId,
		clientSecret: config.mailClientSecret,
		refreshToken: config.mailRefreshToken
	}
});

const { createApolloFetch } = require('apollo-fetch');

const fetch = createApolloFetch({
  uri: 'http://strapi:1337/graphql',
});

/* GET contact page. */
router.get('/', function(req, res, next) {
	res.render('contact', {responses: {}});
});

// https://www.youtube.com/watch?v=8DgJJuxWA3o&list=PLqkA8i556jh96bPL9neuaN8Wx_VLGLNDT&index=15
router.post('/', function(req, res, next) {
	var responses = {
		success : false,
		invalidEmail : false,
		missingFields : false,
		invalidCaracters : false,
		failure : false
	};

	var formErrors = validateForm(req.body);

	if (formErrors.length && req.body.ajax) {
		return res.send(formErrors);
	} else if (formErrors.length && !req.body.ajax) {
		formErrors.forEach(function(error){
			responses[error] = true;
		});
	}

	if(!formErrors.length) {
		var recipients = [];

		fetch({
		  query: `{
		  	users(where: {ReceivesEmails : true}) {
		  		username,
		  		email
		  	}
		  }`,
		}).then(gqlres => {
			gqlres.data.users.forEach(function(user){
				recipients.push(user.email);
			});

			if(recipients.length) {
				sendMail(req.body, recipients, function(result){
					if(result === 'error') {
						if(req.body.ajax) {
							return res.send(['failure']); // AJAX
						} else {
							responses.failure = true; // ONLY IF THE MAIL ERRORS
							res.render('contact', {responses: responses});
						}
					} else {
						if(req.body.ajax) {
							return res.status(200).send(['success']); // AJAX
						} else {
							responses.success = true; // STANDARD QUERY
							res.render('contact', {responses: responses});
						}
					}
				});
			}
		});
	}
});

function validateForm(data) {
	var emailFilter  = /^[^@]+@[^@.]+\.[^@]*\w\w$/,
		illegalChars = /[\(\)\\<\>\,\;\:\\\"\[\]]/,
		empty = /^\s*$/,
		savedErrors = [];

	if (data.name.match(empty) || data.email.match(empty) || data.subject.match(empty) || data.message.match(empty))
		savedErrors.push('missingFields');

	if (!data.email.match(empty) && !emailFilter.test(data.email.replace(/^\s+|\s+$/, '')))
		savedErrors.push('invalidEmail');

	if (!data.email.match(empty) && data.email.match(illegalChars))
		savedErrors.push('invalidCharacters');
	return savedErrors;
}

function sendMail(enquiry, recipients, cb) {
	enquiry.date = moment().locale('fr').format('[Le ]D MMMM YYYY[ à ]HH[h]mm');

	transporter.sendMail({
		from: enquiry.name + '<' + enquiry.email + '>',
		to: recipients,
		subject: enquiry.subject,
		html: pug.renderFile('views/email.pug', {
			enquiry: enquiry,
			config: config
		})
	}, function(error, response){
		if(error) {
			console.log(error);
			cb('error');
		}
		console.log(response);
		cb('success');
		transporter.close();
	});
}

module.exports = router;
