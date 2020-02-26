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


router.get('/', function(req, res, next) {
	var LNG = res.locals.locale.LNG;
	var locales = res.locals.locales;
	var locale = res.locals.locale;

	for (var onelocale in locales) {
		locales[onelocale].matchingRoute = locales[onelocale].route + locales[onelocale].projects.route;
	}

	fetch({
	  query: `{
	  	projets {
	  		Slug_` + LNG + `,
	  		Titre_` + LNG + `,
	  		categorie {
	  			Nom_` + LNG + `
	  		},
	  		Image {
	  			url
	  		},
			Description_Img_` + LNG + `,
			Titre_Img_` + LNG + `
	  	},
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
		var projets = gqlres.data.projets;
		var website = gqlres.data.pages[0];

		website.Description_Img_Accueil = website['Description_Img_Accueil_' + LNG];
		website.Description_Site = website['Description_Site_' + LNG];

		for (var i = 0; i < projets.length; i++) {
			projets[i].Slug = projets[i]['Slug_' + LNG];
			projets[i].Titre = projets[i]['Titre_' + LNG];
			projets[i].Description_Img = projets[i]['Description_Img_' + LNG];
			projets[i].Titre_Img = projets[i]['Titre_Img_' + LNG];
			projets[i].categorie.Nom = projets[i].categorie["Nom_" + LNG];
		}

		res.render('projects', {
			projects: projets,
			config: config,
			activePage: "projects",
			locales: locales,
			locale: locale,
			website: website
		});
	});

});


/* GET home page. */
router.get('/:id', function(req, res, next) {
	var LNG = res.locals.locale.LNG;
	var locales = res.locals.locales;
	var locale = res.locals.locale;

	var allLngSlugsQuery = "";

	for (var onelocale in locales) {
		allLngSlugsQuery += `Slug_` + locales[onelocale].LNG + `,`;
	}

	fetch({
	  query: `{
	  	projets(where: {Slug_` + LNG + ` : "`+ req.params.id +`" }) {
	  		` + allLngSlugsQuery + `
	  		Titre_` + LNG + `,
	  		Description_` + LNG + `,
			categorie {
	  			Nom_` + LNG + `
	  		},
	  		Audio {
	  			url,
	  			name
	  		},
	  		Soundcloud
	  		Image {
	  			url
	  		},
	  		Titre_Img_` + LNG + `,
	  		Description_Img_` + LNG + `,
	  		Audio {
	  			url
	  		},
	  		Contenu_` + LNG + `,
	  		Annee,
	  		createdAt,
	  		updatedAt
	  	}
	  }`,
	}).then(gqlres => {
		var projet = gqlres.data.projets[0];

		for (var onelocale in locales) {
			locales[onelocale].matchingRoute = locales[onelocale].route + locales[onelocale].projects.route + "/" + projet["Slug_" + locales[onelocale].LNG];
		}

		// This suppresses the file extension of all audio files
		if(projet.Audio) {
			for (var i = 0; i < projet.Audio.length; i++) {
				projet.Audio[i].name = projet.Audio[i].name.substring(0, projet.Audio[i].name.lastIndexOf("."));
			}			
		}

		projet.Slug = projet["Slug_" + LNG];
		projet.Titre = projet["Titre_" + LNG];
		projet.Description = projet["Description_" + LNG];
		projet.categorie.Nom = projet.categorie["Nom_" + LNG];

		projet.Contenu = markdownRender(projet["Contenu_" + LNG]);

		projet.Contenu.unshift({
			type: "image",
			title: projet["Titre_Img_" + LNG],
			alt: projet["Description_Img_" + LNG],
			url: projet.Image.url
		});

		res.render('project', {
			project: projet,
			config: config,
			activePage: "project",
			locales: locales,
			locale: locale
		});
	});

});

function markdownRender(markdown) {
	var firstTokenRegex = /^\s*(\+{3,}|)\s*\n/;
	var inbetweenTokenRegex = /\n+\s*\+{3}\+*\s*\n+/g;
	var lastTokenRegex = /\n\s*(\+{3,}|)\s*$/;

	var slides = [];

	if(markdown.match(/\S/) !== null) {
		if(markdown.match(firstTokenRegex) !== null) {
			markdown = markdown.replace(firstTokenRegex, "");
		}

		if(markdown.match(lastTokenRegex) !== null) {
			markdown = markdown.replace(lastTokenRegex, "");
		}

		slides = markdown.split(inbetweenTokenRegex);

		for (var i = 0; i < slides.length; i++) {
			var foundVideos = slides[i].match(/§\[.*\]\(.*\)/g);
			var foundImages = slides[i].match(/!\[.*\]\(.*\)/g);
			var title;

			if(foundVideos) {
				title = foundVideos[0].match(/\".*\"/);
				foundVideos[0] = foundVideos[0].replace(/\".*\"/, "");
				title = title ? title[0].slice(1,-1) : "";

				// If any video has been found, take the first one and create a slide
				slides[i] = {
					type: "video",
					title: title,
					desc: foundVideos[0].match(/\[.*\]/)[0].slice(1,-1),
					url: foundVideos[0].match(/\(.*\)/)[0].slice(1,-1)
				};
			} else if (foundImages) {
				title = foundImages[0].match(/\".*\"/);
				foundImages[0] = foundImages[0].replace(/\".*\"/, "");
				title = title ? title[0].slice(1,-1) : "";

				// If any image has been found, take the first one and create a slide
				slides[i] = {
					type: "image",
					title: title,
					alt: foundImages[0].match(/\[.*\]/)[0].slice(1,-1),
					url: foundImages[0].match(/\(.*\)/)[0].slice(1,-1)
				};
			} else {
				// Otherwise, just render the markdown
				slides[i] = {
					type: "html",
					content: md.render(slides[i])
				};
			}
		}
	}

	return slides;
}

module.exports = router;
