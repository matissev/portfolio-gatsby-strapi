

function ajaxify(linkEl, callback) {
	forEachNl(document.querySelectorAll(linkEl), function(el) {
		var url = el.attributes.href.value;
		el.addEventListener('click', function(event) {
			event.preventDefault();
			history.pushState({}, 'Article', url);

			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
					if (xmlhttp.status == 200) {
						callback(xmlhttp.responseText);
					} else if (xmlhttp.status == 400) {
						console.log('There was an error 400');
					} else {
						console.log('something else other than 200 was returned');
						console.log(xmlhttp.responseText);
					}
				}
			};

			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}, false);
	});
}

function injectPartial(partialEl, containerEl, response) {
	var container = document.querySelector(containerEl);
	container.innerHTML = "";
	currentPopup = new DOMParser().parseFromString(response, 'text/html');
	var content = currentPopup.documentElement.querySelector(partialEl);
	container.appendChild(content);
}

ajaxify('.projects-page a.project', function(response){
	injectPartial('.project-page', '.project-overlay', response);
	if (document.querySelector('.slides')) {
		var slides = new Slides({
			container: '.project-page',
			slide: '.slide',
			controls: '.sliderControls'
		});
		slides.init();
	}

	if (document.querySelector('.audioPlayer')) {
		var audioPlayer = new AudioPlayer({
			container: '.audioPlayer',
			controls: '.audioControls',
			tracks: '.track'
		});
		audioPlayer.init();
	}

	addClass(document.querySelector('.project-overlay'), 'show');

	forEachNl(document.querySelectorAll('.close-button'), function(el) {
		el.addEventListener('click', function(event) {
			event.preventDefault();
			removeClass(document.querySelector('.project-overlay'), 'show');
			// window.history.back();
		}, false);
	});

	document.querySelector('video').load(); // Be careful with this
	document.querySelector('video').controls = false;
	document.querySelector('video').controls = true;
});


forEachNl(document.querySelectorAll('.close-button'), function(el) {
	el.addEventListener('click', function(event) {
		event.preventDefault();
		removeClass(document.querySelector('.project-overlay'), 'show');
		// audioPlayer.fadeOut();
		// window.history.back();
	}, false);
});