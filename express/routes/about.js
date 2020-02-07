var express = require('express');
var app = express();
var router = express.Router({mergeParams: true});
var config = require('../config');
const { Remarkable } = require('remarkable');
var md = new Remarkable({
	html: true
});

const { createApolloFetch } = require('apollo-fetch');

const fetch = createApolloFetch({
  uri: 'http://strapi:1337/graphql',
});

/* GET home page. */
router.get('/', function(req, res, next) {
	var LNG = res.locals.locale.LNG;
	var locales = res.locals.locales;

	for (var locale in locales) {
		locales[locale].matchingRoute = locales[locale].route + locales[locale].about.route;
	}

	fetch({
	  query: `{
	  	pages {
			Texte_A_Propos_`+ LNG + `
	  	}
	  }`,
	}).then(gqlres => {
		gqlres.data.pages[0].Texte_A_Propos = md.render(gqlres.data.pages[0]['Texte_A_Propos_' + LNG]);
		res.render('about', {
			pages: gqlres.data.pages[0],
			config: config,
			activePage: "about",
			locales: locales,
			locale: res.locals.locale
		});
	});
});

module.exports = router;
