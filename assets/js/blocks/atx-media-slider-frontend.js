/**
 * ATX Media Slider – Frontend initialisation
 *
 * Finds every .atx-media-slider-block on the page and wires up
 * prev/next arrows, dot navigation, autoplay and slide/fade transitions.
 */
(function () {
	'use strict';

	function initSlider(root) {
		var track    = root.querySelector('.atx-slider-track');
		var slides   = root.querySelectorAll('.atx-slider-slide');
		var prevBtn  = root.querySelector('.atx-slider-prev');
		var nextBtn  = root.querySelector('.atx-slider-next');
		var dotsWrap = root.querySelector('.atx-slider-dots');
		var dots     = dotsWrap ? dotsWrap.querySelectorAll('.atx-dot') : [];

		if (!slides.length || !track) return;

		var current    = 0;
		var total      = slides.length;
		var mode       = root.getAttribute('data-transition') || 'fade';
		var autoplay   = root.getAttribute('data-autoplay') === 'true';
		var interval   = parseInt(root.getAttribute('data-interval'), 10) || 5000;
		var autoTimer  = null;
		var isVisible  = false;
		var liveRegion = root.querySelector('.atx-slider-live-region');

		function goTo(index) {
			if (index < 0) index = total - 1;
			if (index >= total) index = 0;

			requestAnimationFrame(function () {
				if (mode === 'slide') {
					// Move the flex track
					track.style.transform = 'translateX(-' + (index * 100) + '%)';
				} else {
					// Fade: toggle active class
					for (var i = 0; i < slides.length; i++) {
						slides[i].classList.toggle('atx-slide-active', i === index);
					}
				}

				// Update dots
				for (var j = 0; j < dots.length; j++) {
					dots[j].classList.toggle('atx-dot-active', j === index);
				}

				// Update aria-hidden on slides
				for (var a = 0; a < slides.length; a++) {
					slides[a].setAttribute('aria-hidden', a === index ? 'false' : 'true');
				}

				// Announce slide change to screen readers
				if (liveRegion) {
					liveRegion.textContent = 'Slide ' + (index + 1) + ' of ' + total;
				}

				// Pause/play videos — only play if slider is visible
				for (var k = 0; k < slides.length; k++) {
					var video = slides[k].querySelector('video');
					if (video) {
						if (k === index && isVisible) {
							video.play().catch(function () {});
						} else {
							video.pause();
						}
					}
				}

				current = index;
			});
		}

		function next() { goTo(current + 1); }
		function prev() { goTo(current - 1); }

		// Arrow clicks
		if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); resetAutoplay(); });
		if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); resetAutoplay(); });

		// Dot clicks
		for (var d = 0; d < dots.length; d++) {
			(function (idx) {
				dots[idx].addEventListener('click', function () {
					goTo(idx);
					resetAutoplay();
				});
			})(d);
		}

		// Autoplay
		function startAutoplay() {
			if (!autoplay || total <= 1 || !isVisible) return;
			stopAutoplay();
			autoTimer = setInterval(next, interval);
		}

		function stopAutoplay() {
			if (autoTimer) {
				clearInterval(autoTimer);
				autoTimer = null;
			}
		}

		function resetAutoplay() {
			stopAutoplay();
			startAutoplay();
		}

		// Pause autoplay on hover
		root.addEventListener('mouseenter', stopAutoplay);
		root.addEventListener('mouseleave', startAutoplay);

		// Touch / swipe support
		var touchStartX = 0;

		root.addEventListener('touchstart', function (e) {
			touchStartX = e.changedTouches[0].screenX;
		}, { passive: true });

		root.addEventListener('touchend', function (e) {
			var diff = touchStartX - e.changedTouches[0].screenX;
			if (Math.abs(diff) > 50) {
				if (diff > 0) { next(); } else { prev(); }
				resetAutoplay();
			}
		}, { passive: true });

		// IntersectionObserver — only play videos and autoplay when slider is visible
		var observer = null;
		if ('IntersectionObserver' in window) {
			observer = new IntersectionObserver(function (entries) {
				var entry = entries[0];
				isVisible = entry.isIntersecting;
				if (isVisible) {
					// Resume video on current slide
					var video = slides[current] && slides[current].querySelector('video');
					if (video) video.play().catch(function () {});
					startAutoplay();
				} else {
					// Pause all videos and autoplay when out of view
					for (var k = 0; k < slides.length; k++) {
						var v = slides[k].querySelector('video');
						if (v) v.pause();
					}
					stopAutoplay();
				}
			}, { threshold: 0.1 });
			observer.observe(root);
		} else {
			// Fallback: assume always visible
			isVisible = true;
		}

		// Set initial state
		goTo(0);
		if (isVisible) startAutoplay();

		// Cleanup when slider is removed from DOM (e.g. popup close)
		if ('MutationObserver' in window) {
			var parentNode = root.parentNode;
			if (parentNode) {
				var cleanupObserver = new MutationObserver(function (mutations) {
					for (var m = 0; m < mutations.length; m++) {
						var removed = mutations[m].removedNodes;
						for (var n = 0; n < removed.length; n++) {
							if (removed[n] === root || (removed[n].contains && removed[n].contains(root))) {
								stopAutoplay();
								if (observer) observer.disconnect();
								cleanupObserver.disconnect();
								return;
							}
						}
					}
				});
				cleanupObserver.observe(parentNode, { childList: true, subtree: true });
			}
		}
	}

	// Initialise all sliders once DOM is ready
	function init() {
		var sliders = document.querySelectorAll('.atx-media-slider-block');
		for (var i = 0; i < sliders.length; i++) {
			initSlider(sliders[i]);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
