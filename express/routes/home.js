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
	console.log(res.locals.language);
	
	fetch({
	  query: `{
	  	pages {
			Texte_Accueil_`+ res.locals.language + `,
	  		Image_Accueil {
	  			url
	  		}
	  	}
	  }`,
	}).then(gqlres => {
		gqlres.data.pages[0].Texte_Accueil = md.render(gqlres.data.pages[0]['Texte_Accueil_' + res.locals.language]);
		res.render('home', { home: gqlres.data.pages[0], config, activePage: "home" });
	});
});

module.exports = router;
