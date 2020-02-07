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
router.get('', function(req, res, next) {
	var LNG = res.locals.locale.LNG;
	var locales = res.locals.locales;

	for (var locale in locales) {
		locales[locale].matchingRoute = locales[locale].route + locales[locale].home.route;
	}

	fetch({
	  query: `{
	  	pages {
			Texte_Accueil_` + LNG + `,
	  		Image_Accueil {
	  			url
	  		}
	  	}
	  }`,
	}).then(gqlres => {
		var page = gqlres.data.pages[0];
		
		page.Texte_Accueil = md.render(page['Texte_Accueil_' + LNG]);
		res.render('home', {
			home: page,
			config: config,
			activePage: "home",
			locales: locales,
			locale: res.locals.locale
		});
	});
});

module.exports = router;
