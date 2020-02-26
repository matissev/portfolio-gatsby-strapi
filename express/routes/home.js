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
	var locale = res.locals.locale;

	for (var onelocale in locales) {
		locales[onelocale].matchingRoute = locales[onelocale].route + locales[onelocale].home.route;
	}

	fetch({
	  query: `{
	  	pages {
			Texte_Accueil_` + LNG + `,
			Titre_Img_Accueil_` + LNG + `,
			Description_Img_Accueil_` + LNG + `,
	  		Description_Site_` + LNG + `,
			Image_Accueil {
				url
			},
			Lien_Linkedin,
			Lien_Instagram
		}
	  }`,
	}).then(gqlres => {
		var website = gqlres.data.pages[0];
		
		website.Texte_Accueil = md.render(website['Texte_Accueil_' + LNG]);
		website.Titre_Img_Accueil = website['Titre_Img_Accueil_' + LNG];
		website.Description_Img_Accueil = website['Description_Img_Accueil_' + LNG];
		website.Description_Site = website['Description_Site_' + LNG];

		// buildJsonLd(website, locale);

		res.render('home', {
			config: config,
			activePage: "home",
			locales: locales,
			locale: locale,
			website: website
		});
	});
});

function buildJsonLd(website, locale) {
	var jsonLd = [{
		"@context": "http://schema.org",
		"@type": "Person",
		"givenName": "Lundja",
		"familyName": "Medjoub",
		"workLocation": {
			"@type": "Place",
			"address": {
				"@type": "PostalAddress",
				"addressCountry": "France",
				"addressLocality": "Paris",
				"addressRegion" : "île de France",
				"postalCode" : "75000"
			}
		},
		"jobTitle": "Designer Sonore",
		"knowsAbout": "Design sonore, Design d'espace, Identité de marque, Multi-canal",
		"makesOffer": {
			"@type": "Offer",
			"businessFunction": {
				"@type": "BusinessFunction",
				"name": "Design Sonore"
			},
			"itemOffered": {
				"@type": "Service",
				"serviceType": ["Identité sonore", "Installation", "Audio-guide"]
			}
		},

		// About
		"alumniOf": [{
			"@type": "EducationalOrganization",
			"alternateName": "ESAD TALM",
			"legalName": "École supérieure d'art et de design",
			"url": "https://esad-talm.fr/fr/talm/talm-le-mans"
		}, {
			"@type": "EducationalOrganization",
			"alternateName": "ESADSE",
			"legalName": "École Supérieure d'Art et Design de Saint-Étienne",
			"url": "https://www.esadse.fr/"
		}],
		"memberOf": [{
			"@type": "Organization",
			"legalName": "Petit Pont",
			"url": "https://petitpont.co/"
		}],

		// Contact
		"contactPoint": {
			"url": "THISPAGE"
		}
	}, {
		// HOME
		"@context": "http://schema.org",
		"@type": "WebSite"
	}];
}

module.exports = router;
