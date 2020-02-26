

function AudioPlayer(options) {
	this.options = options;
	this.element = document.querySelector(options.container);

	// Audio and sources
	this.audioElement = this.element.querySelector('audio');
	this.source = this.audioElement.querySelector('source');

	// Playlist
	this.tracks = this.element.querySelectorAll(options.tracks);
	this.trackCount = this.element.querySelector(".trackCount");

	// Playback controls
	this.controls = this.element.querySelector(options.controls);
	this.playpauseBtn = this.controls.querySelector('.playpause');
	this.prevBtn = this.controls.querySelector('.prev');
	this.nextBtn = this.controls.querySelector('.next');

	// Playing track name
	this.playingTrackName = this.controls.querySelector(".playingTrackName");

	// Time controls
	this.endTime = this.controls.querySelector('.endTime');
	this.currentTime = this.controls.querySelector('.currentTime');
	this.progressBar = this.controls.querySelector('progress');

	// Volume
	this.volumeSlider = this.controls.querySelector('.volumeSlider');
	this.mute = this.controls.querySelector('.mute');

	// Variables
	this.index = 0;
	this.playing = false;
	this.volume = 0.8;
	this.fadeVolume = 1;
}


AudioPlayer.prototype.init = function() {
	var self = this;

	self.trackCount.querySelector("small").innerHTML = self.tracks.length;

	if(self.options.controls) {
		self.playpauseBtn.addEventListener('click', function(event) {
			if(self.playing === false) {
				self.audioElement.play();
				self.playing = true;
			} else {
				self.audioElement.pause();
				self.playing = false;
			}
		});
	}

	if(self.options.controls) {
		self.mute.addEventListener('click', function(event) {
			self.muting();
		});
	}

	self.audioElement.addEventListener('play', function(event) {
		removeClass(self.playpauseBtn, "paused");
		self.playing = true;
	});

	self.audioElement.addEventListener('pause', function(event) {
		addClass(self.playpauseBtn, "paused");
		self.playing = false;
	});

	self.audioElement.addEventListener('ended', function(event) {
		if(self.index < self.tracks.length) {
			self.index++;
			self.updateTrack();
			self.audioElement.play();
		}
	});

	if(self.options.controls) {
		self.prevBtn.addEventListener('click', function(event) {
			self.index--;
			if(self.index < 0) {
				self.index = self.tracks.length - 1;
			}
			self.updateTrack();
			if(self.playing === true) {
				self.audioElement.play();
			}
		});
	}

	if(self.options.controls) {
		self.nextBtn.addEventListener('click', function(event) {
			self.index++;
			if(self.index >= self.tracks.length) {
				self.index = 0;
			}
			self.updateTrack();
			if(self.playing === true) {
				self.audioElement.play();
			}
		});
	}

	self.audioElement.addEventListener('timeupdate', function(event) {
		self.updateDuration();
	});

	self.volumeSlider.addEventListener('input', function(event) {
		if(this.value == 0) {
			addClass(self.mute, "muted");
		} else {
			removeClass(self.mute, "muted");
		}
		self.volume = this.value;
		self.updateVolume();
	});

	forEachNl(self.tracks, function(el, index) {
		getDuration(el.querySelector("a").attributes.href.value, function(length) {
			el.querySelector(".duration").innerHTML = self.formatDuration(length);
		});

		el.addEventListener('click', function(event) {
			event.preventDefault();
			self.index = index;
			self.updateTrack();
			self.audioElement.play();
			// self.playing = true;
			// removeClass(self.playpauseBtn, "paused");
		}, false);
	});

	function getDuration(src, cb) {
		var audio = new Audio();

		audio.addEventListener("loadedmetadata", function(){
			cb(audio.duration);
		});

		audio.src = src;
	}
};


AudioPlayer.prototype.updateVolume = function() {
	self = this;
	// var v = Math.log10(self.volume * self.fadeVolume) * Math.log10(6) + 1;
	// var v = Math.pow (self.volume * self.fadeVolume, 0.5);
	// var v = (Math.exp(self.volume * self.fadeVolume)-1)/(Math.E-1);
	var v = (Math.pow(10,self.volume * self.fadeVolume)-1)/(10-1);

	if(v < 0) {
		v = 0;
	}

	self.audioElement.volume = v;
};

AudioPlayer.prototype.fadeOut = function() {
	self = this;

	var intervalID = setInterval(function() {
		if (self.fadeVolume > 0) {
			self.fadeVolume -= 0.01;
			self.updateVolume();
		} else {
			// Stop the setInterval when 0 is reached
			clearInterval(intervalID);
			self.audioElement.pause();
			self.playing = false;
			self.fadeVolume = 1;
			self.updateVolume();
		}
	}, 30);
};

AudioPlayer.prototype.muting = function() {
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

AudioPlayer.prototype.updateTrack = function() {
	var self = this;
	self.source.src = self.tracks[self.index].querySelector("a").attributes.href.value;
	self.playingTrackName.innerHTML = (self.index + 1) + ". " + self.tracks[self.index].querySelector("a .trackName").innerHTML;

	self.audioElement.currentTime = 0;
	self.audioElement.load();
	self.progressBar.value = 0;
	self.currentTime.innerHTML = "0:0";
	self.endTime.innerHTML = "0:0";

	forEachNl(self.tracks, function(track) {
		removeClass(track, "selectedTrack");
	});

	addClass(self.tracks[self.index], "selectedTrack");
};


AudioPlayer.prototype.updateDuration = function() {
	//END DURATION
	var self = this;
	var duration = self.audioElement.duration;
	self.endTime.innerHTML = self.formatDuration(duration);

	// CURRENT TIME
	var currentTime = self.audioElement.currentTime;
	self.currentTime.innerHTML = self.formatDuration(currentTime);

	self.progressBar.value = (currentTime / duration);

	self.progressBar.addEventListener("click", function(event) {
		var percent = event.offsetX / this.offsetWidth;
		self.audioElement.currentTime = percent * duration;
		self.progressBar.value = percent / 100;
	});
};

AudioPlayer.prototype.formatDuration = function(length) {
	var minutes = Math.floor(length / 60);
	var seconds_int = length - minutes * 60;
	var seconds_str = seconds_int.toString();
	var seconds = Math.round(seconds_str);
	var time = minutes + ':' + seconds;
	return time;
};


// RUNS THE PLAYER
if (document.querySelector('.audioPlayer')) {
	var audioPlayer = new AudioPlayer({
		container: '.audioPlayer',
		controls: '.audioControls',
		tracks: '.track'
	});
	audioPlayer.init();
}
