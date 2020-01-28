var express = require('express');
var app = express();
var router = express.Router();
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
	fetch({
	  query: `{
	  	pages {
			Texte_Accueil,
	  		Image_Accueil {
	  			url
	  		}
	  	}
	  }`,
	}).then(gqlres => {
		gqlres.data.pages[0].Texte_Accueil = md.render(gqlres.data.pages[0].Texte_Accueil);
		res.render('home', { home: gqlres.data.pages[0], config });
	});
});

module.exports = router;
