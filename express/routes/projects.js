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
	fetch({
	  query: `{
	  	projets {
	  		Slug,
	  		Titre_EN,
	  		categorie {
	  			Nom
	  		},
	  		Image {
	  			url
	  		}
	  	}
	  }`,
	}).then(gqlres => {
		res.render('projects', { projects: gqlres.data.projets, config: config, activePage: "projects" });
	});

});


/* GET home page. */
router.get('/:id', function(req, res, next) {

	fetch({
	  query: `{
	  	projets(where: {Slug : "`+ req.params.id +`" }) {
	  		Slug,
	  		Titre_EN,
			categorie {
	  			Nom
	  		},
	  		Audio {
	  			url,
	  			name
	  		},
	  		Soundcloud
	  		Image {
	  			url
	  		},
	  		Audio {
	  			url
	  		},
	  		Contenu_EN,
	  		Annee
	  	}
	  }`,
	}).then(gqlres => {
		var projet = gqlres.data.projets[0];

		// This suppresses the file extension of all audio files
		if(projet.Audio) {
			for (var i = 0; i < projet.Audio.length; i++) {
				projet.Audio[i].name = projet.Audio[i].name.substring(0, projet.Audio[i].name.lastIndexOf("."));
			}			
		}

		if(projet.Contenu_EN) {
			projet.Contenu_EN = markdownRender(projet.Contenu_EN);
		}
		res.render('project', { project: projet, config: config });
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

			if(foundVideos) {
				// If any video has been found, take the first one and create a slide
				slides[i] = {
					type: "video",
					name: foundVideos[0].match(/\[.*\]/)[0].slice(1,-1),
					url: foundVideos[0].match(/\(.*\)/)[0].slice(1,-1)
				};
			} else if (foundImages) {
				var title = foundImages[0].match(/\".*\"/);
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
