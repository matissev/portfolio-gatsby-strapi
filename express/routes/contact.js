var express = require('express');
var app = express();
var router = express.Router({mergeParams: true});
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
  uri: 'http://localhost:1337/graphql',
});

/* GET contact page. */
router.get('/', function(req, res, next) {
	var LNG = res.locals.locale.LNG;
	var locales = res.locals.locales;
	var locale = res.locals.locale;

	for (var onelocale in locales) {
		locales[onelocale].matchingRoute = locales[onelocale].route + locales[onelocale].contact.route;
	}

	fetch({
	  query: `{
	  	pages {
	  		Description_Site_` + LNG + `,
	  		Description_Img_Accueil_` + LNG + `,
	  		Image_Accueil {
	  			url
	  		},
			Lien_Linkedin,
			Lien_Instagram
	  	}
	  }`,
	}).then(gqlres => {
		var website = gqlres.data.pages[0];

		website.Description_Img_Accueil = website['Description_Img_Accueil_' + LNG];
		website.Description_Site = website['Description_Site_' + LNG];

		res.render('contact', {
			config: config,
			responses: {},
			activePage: "contact",
			locales: locales,
			locale: res.locals.locale,
			website: website
		});
	});
});

// https://www.youtube.com/watch?v=8DgJJuxWA3o&list=PLqkA8i556jh96bPL9neuaN8Wx_VLGLNDT&index=15
router.post('/', function(req, res, next) {
	var locales = res.locals.locales;
	var locale = res.locals.locale;
	var LNG = res.locals.locale.LNG;

	for (var onelocale in locales) {
		locales[onelocale].matchingRoute = locales[onelocale].route + locales[onelocale].contact.route;
	}

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
		
		console.log(LNG);

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
					if(req.body.ajax) { // AJAX
						if(result === 'error') {
							return res.send(['failure']);
						} else {
							return res.status(200).send(['success']); // AJAX
						}
					} else {
						if(result === 'error') {
							responses.failure = true; // ONLY IF THE MAIL ERRORS
						} else {
							responses.success = true; // STANDARD QUERY
						}

						fetch({
						  query: `{
						  	pages {
						  		Description_Site_` + LNG + `,
						  		Description_Img_Accueil_` + LNG + `,
						  		Image_Accueil {
						  			url
						  		}
						  	}
						  }`,
						}).then(gqlres2 => {
							var website = gqlres2.data.pages[0];
							website.Description_Img_Accueil = website['Description_Img_Accueil_' + LNG];
							website.Description_Site = website['Description_Site_' + LNG];

							res.render('contact', {
								responses: responses,
								config: config,
								activePage: "contact",
								locales: locales,
								locale: locale,
								website: website
							});
						});
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
