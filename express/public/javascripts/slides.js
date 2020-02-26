
var mySwiper = new Swiper ('.swiper-container', {
	pagination: {
		el: '.swiper-pagination',
	},

	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	loop: {
		loop: true
	},
    preloadImages: false,
    // Enable lazy loading
    lazy: true
});

if(isMobile.any) {
	addClass(document.querySelector('body'), "isMobile");
}