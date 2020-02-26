

function VideoPlayer(options) {
	this.options = options;
	this.element = options.container;

	// Video and sources
	this.videoElement = this.element.querySelector('video');
	this.source = this.videoElement.querySelector('source');

	// Playback controls
	this.controls = this.element.querySelector(options.controls);
	this.playpauseBtn = this.controls.querySelector('.playpause');

	// Playing track name
	this.playingTrackName = this.controls.querySelector(".playingTrackName");

	// Time controls
	this.endTime = this.controls.querySelector('.endTime');
	this.currentTime = this.controls.querySelector('.currentTime');
	this.progressBar = this.controls.querySelector('progress');

	// Volume
	this.volumeSlider = this.controls.querySelector('.volume');
	this.mute = this.controls.querySelector('.mute');

	// Variables
	this.playing = false;
	this.volume = 0.8;
	this.fadeVolume = 1;
}

VideoPlayer.prototype.init = function() {
	var self = this;

	if(self.options.controls) {
		self.playpauseBtn.addEventListener('click', function(event) {
			if(self.playing === false) {
				self.videoElement.play();
				self.playing = true;
			} else {
				self.videoElement.pause();
				self.playing = false;
			}
		});
	}

	if(self.options.controls) {
		self.mute.addEventListener('click', function(event) {
			// addClass(self.playpauseBtn, "paused");
			self.muting();
		});
	}

	self.videoElement.addEventListener('play', function(event) {
		removeClass(self.playpauseBtn, "paused");
		self.playing = true;
	});

	self.videoElement.addEventListener('pause', function(event) {
		addClass(self.playpauseBtn, "paused");
		self.playing = false;
	});

	self.videoElement.addEventListener('timeupdate', function(event) {
		self.updateDuration();
	});

	self.volumeSlider.addEventListener('input', function(event) {
		self.volume = this.value;
		self.updateVolume();
	});
};


VideoPlayer.prototype.updateVolume = function() {
	self = this;
	// var v = Math.log10(self.volume * self.fadeVolume) * Math.log10(6) + 1;
	// var v = Math.pow (self.volume * self.fadeVolume, 0.5);
	// var v = (Math.exp(self.volume * self.fadeVolume)-1)/(Math.E-1);
	var v = (Math.pow(10,self.volume * self.fadeVolume)-1)/(10-1);

	if(v < 0 || isNaN(v)) {
		v = 0;
	}

	self.videoElement.volume = v;
};


VideoPlayer.prototype.fadeOut = function() {
	self = this;

	var intervalID = setInterval(function() {
		if (self.fadeVolume > 0) {
			self.fadeVolume -= 0.01;
			self.updateVolume();
		} else {
			// Stop the setInterval when 0 is reached
			clearInterval(intervalID);
			self.videoElement.pause();
			self.playing = false;
			self.fadeVolume = 1;
			self.updateVolume();
		}
	}, 30);
};

VideoPlayer.prototype.updateDuration = function() {
	//END DURATION
	var self = this;
	var duration = self.videoElement.duration;
	self.endTime.innerText = formatDuration(duration);

	// CURRENT TIME
	var currentTime = self.videoElement.currentTime;
	self.currentTime.innerText = formatDuration(currentTime);

	self.progressBar.value = (currentTime / duration);

	self.progressBar.addEventListener("click", function(event) {
		var percent = event.offsetX / this.offsetWidth;
		self.videoElement.currentTime = percent * duration;
		self.progressBar.value = percent / 100;
	});

	function formatDuration(length) {
		var minutes = Math.floor(length / 60);
		var seconds_int = length - minutes * 60;
		var seconds_str = seconds_int.toString();
		var seconds = Math.round(seconds_str);
		var time = minutes + ':' + seconds;
		return time;
	}
};

VideoPlayer.prototype.muting = function() {
	self = this;

	if(self.volumeSlider.value == 0) {
		self.volumeSlider.value = 0.8;
		self.volume = 0.8;
		removeClass(self.mute, "muted");
	} else {
		self.volumeSlider.value = 0;
		self.volume = 0;
		addClass(self.mute, "muted");
	}

	self.updateVolume();
};


// RUNS THE PLAYER
if (!isMobile.any && document.querySelector('.videoPlayer')) {
	var videoPElements = document.querySelectorAll('.videoPlayer');
	var videoPlayers = [];

	forEachNl(videoPElements, function(videoPELement) {
		var vp = new VideoPlayer({
			container: videoPELement,
			controls: '.videoControls'
		});
		vp.init();
		videoPlayers.push(vp);
	});
}

if(isMobile.any && document.querySelector('.videoPlayer')) {
	var videoPElements = document.querySelectorAll('.videoPlayer video');

	forEachNl(videoPElements, function(videoPELement) {
		videoPELement.setAttribute("controls", "controls");
	});
}