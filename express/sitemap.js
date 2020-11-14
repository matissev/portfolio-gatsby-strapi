const express = require('express');
const app = express();
const router = express.Router({mergeParams: true});
const config = require('./config');
const locales = require('./locales/locales');

const { createApolloFetch } = require('apollo-fetch');

const fetch = createApolloFetch({
  uri: 'http://localhost:8023/graphql',
});

const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

let sitemap;


router.get('/', function(req, res) {
	res.header('Content-Type', 'application/xml');
	res.header('Content-Encoding', 'gzip');
	// if we have a cached entry send it
	if (sitemap) {
		res.send(sitemap);
		return;
	}
	try {
		fetch({
		  query: `{
			pages {
			  Image_Accueil {
			    url
			  },
			  Titre_Img_Accueil_EN,
			  Titre_Img_Accueil_FR,
			  Description_Img_Accueil_EN,
			  Description_Img_Accueil_FR,
			  updatedAt
			},
			projets {
		      Titre_FR,
		      Titre_EN,
		      updatedAt,
		      Slug_FR,
		      Slug_EN,
		      Contenu_FR,
		      Contenu_EN,
		      Image {
		        url
		      },
		      Titre_Img_FR,
		      Titre_Img_EN,
		      Description_Img_FR,
		      Description_Img_EN,
			}
		  }`,
		}).then(gqlres => {
			var smStream = new SitemapStream({ hostname: config.hostName });
			const pipeline = smStream.pipe(createGzip());

			smStream = buildSitemap(smStream, gqlres.data);

			smStream.end();
	 
			// cache the response
			streamToPromise(pipeline).then(sm => sitemap = sm)
			// stream the response
			pipeline.pipe(res).on('error', (e) => {throw e})
		});
	} catch (e) {
		console.error(e);
		res.status(500).end();
	}
});

function buildSitemap(smStream, data) {
	var pages = ["home","projects","about","contact"];
	var pageObject;


	// MAIN PAGES

	for (var p = 0; p < pages.length; p++) {
		for (var locale in locales) {
			pageObject = {
				url: locales[locale].route + locales[locale][pages[p]].route, changefreq: 'daily', priority: 0.6,
				links: [],
				lastmod: data.pages[0].updatedAt
			};

			for (var alt in locales) {
				pageObject.links.push({
					lang: locales[alt].lng,
					url: locales[alt].route + locales[alt][pages[p]].route
				});
			}

			if(pages[p] === "home") {
				pageObject.img = [{
					url: config.mediashostName + data.pages[0].Image_Accueil.url,
					caption: data.pages[0]["Description_Img_Accueil_" + locales[locale].LNG],
					title: data.pages[0]["Titre_Img_Accueil_" + locales[locale].LNG]
				}];
			}

			smStream.write(pageObject);
		}
	}

	// PROJECTS

	for (var p = 0; p < data.projets.length; p++) {
		for (var locale in locales) {
			pageObject = {
				url: locales[locale].route + locales[locale].projects.route + "/" + data.projets[p]["Slug_" + locales[locale].LNG], changefreq: 'daily', priority: 0.6,
				links: [],
				video: [],
				img: [],
				lastmod: data.projets[p].updatedAt
			};

			for (var alt in locales) {
				pageObject.links.push({
					lang: locales[alt].lng,
					url: locales[alt].route + locales[alt].projects.route + "/" + data.projets[p]["Slug_" + locales[alt].LNG], changefreq: 'daily', priority: 0.6,
				});
			}

			var medias = extractMedias(data.projets[0]["Contenu_" + locales[locale].LNG]);

			pageObject.img.push({
				url: config.mediashostName + data.projets[p].Image.url,
				caption: data.projets[p]["Description_Img_" + locales[locale].LNG],
				title: data.projets[p]["Titre_Img_" + locales[locale].LNG]
			});

			for (var image in medias.images) {
				pageObject.img.push({
					url: config.mediashostName + medias.images[image].url,
					caption: medias.images[image].alt,
					title: medias.images[image].title
				});
			}

			for (var video in medias.videos) {
				pageObject.video.push({
					content_loc: config.mediashostName + medias.videos[video].url,
					description: medias.videos[video].desc,
					title: medias.videos[video].title,
					thumbnail_loc: config.mediashostName + data.projets[p].Image.url
				});
			}

			smStream.write(pageObject);
		}
	}



	return smStream;
}

function extractMedias(markdown) {
	var inbetweenTokenRegex = /\n+\s*\+{3}\+*\s*\n+/g;

	var medias =  {
		videos: [],
		images: []
	};

	var slides = [];

	if(markdown.match(/\S/) !== null) {
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
				medias.videos.push({
					title: title,
					desc: foundVideos[0].match(/\[.*\]/)[0].slice(1,-1),
					url: foundVideos[0].match(/\(.*\)/)[0].slice(1,-1),
				});
			} else if (foundImages) {
				title = foundImages[0].match(/\".*\"/);
				foundImages[0] = foundImages[0].replace(/\".*\"/, "");
				title = title ? title[0].slice(1,-1) : "";

				// If any image has been found, take the first one and create a slide
				medias.images.push({
					title: title,
					alt: foundImages[0].match(/\[.*\]/)[0].slice(1,-1),
					url: foundImages[0].match(/\(.*\)/)[0].slice(1,-1)
				});
			}
		}
	}

	return medias;
}

module.exports = router;