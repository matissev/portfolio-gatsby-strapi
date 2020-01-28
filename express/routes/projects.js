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
		res.render('projects', { projects: gqlres.data.projets, config: config });
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

	if(markdown.match(/\S/) !== null) {
		if(markdown.match(firstTokenRegex) !== null) {
			markdown = markdown.replace(firstTokenRegex, "<section class=\"slide swiper-slide\">\n\n");
		} else {
			markdown = "<section class=\"slide swiper-slide\">" + markdown;
		}

		if(markdown.match(lastTokenRegex) !== null) {
			markdown = markdown.replace(lastTokenRegex, "\n\n</section>");
		} else {
			markdown = markdown + "</section>";
		}

		markdown = markdown.replace(inbetweenTokenRegex, "\n\n</section><section class=\"slide swiper-slide\">\n\n");

		markdown = markdown.replace(/§\[.*\]\(.*\)/g, function(m){
			var videoName = m.match(/\[.*\]/)[0].slice(1,-1);
			var videoUrl = m.match(/\(.*\)/)[0].slice(1,-1);
			return '<video controls>' + videoName + '<source src="' + videoUrl + '" type="video/mp4">Your browser does not support the video tag.</video>';
		});

		markdown = markdown.replace(/!\[.*\]\(.*\)/g, function(m){
			if(m.match(/\".*\"/) !== null) {
				var imageTitle = m.match(/\".*\"/)[0].slice(1,-1);
				m = m.replace(/\".*\"/, "");
			}
			var imageAlt = m.match(/\[.*\]/)[0].slice(1,-1);
			var imageUrl = m.match(/\(.*\)/)[0].slice(1,-1);

			if(imageTitle) {
				return '<figure><img src="' + imageUrl + '" alt="' + imageAlt + '" title="' + imageTitle + '"><figcaption>' + imageTitle + '</figcaption></figure>';
			} else {
				return '<figure><img src="' + imageUrl + '" alt="' + imageAlt + '"></figure>';
			}
		});

		markdown = md.render(markdown);
	}

	return markdown;
}

module.exports = router;
