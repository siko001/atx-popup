/**
 * ATX Testimonial Slider – Frontend
 */
(function () {
	'use strict';

	function initSlider(root) {
		var slides   = root.querySelectorAll('.atx-testimonial-slide');
		var prevBtn  = root.querySelector('.atx-testi-prev');
		var nextBtn  = root.querySelector('.atx-testi-next');
		var dotsWrap = root.querySelector('.atx-testi-dots');
		var dots     = dotsWrap ? dotsWrap.querySelectorAll('.atx-testi-dot') : [];

		if (slides.length <= 1) return;

		var current    = 0;
		var total      = slides.length;
		var autoplay   = root.getAttribute('data-autoplay') === 'true';
		var interval   = parseInt(root.getAttribute('data-interval'), 10) || 5000;
		var timer      = null;
		var isVisible  = false;
		var liveRegion = root.querySelector('.atx-testi-live-region');

		function goTo(index) {
			if (index < 0) index = total - 1;
			if (index >= total) index = 0;

			requestAnimationFrame(function () {
				for (var i = 0; i < slides.length; i++) {
					slides[i].classList.toggle('atx-testi-active', i === index);
					slides[i].setAttribute('aria-hidden', i === index ? 'false' : 'true');
				}
				for (var j = 0; j < dots.length; j++) {
					dots[j].classList.toggle('atx-testi-dot-active', j === index);
				}

				// Announce slide change to screen readers
				if (liveRegion) {
					liveRegion.textContent = 'Testimonial ' + (index + 1) + ' of ' + total;
				}

				current = index;
			});
		}

		function next() { goTo(current + 1); }
		function prev() { goTo(current - 1); }

		if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); reset(); });
		if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); reset(); });

		for (var d = 0; d < dots.length; d++) {
			(function (idx) {
				dots[idx].addEventListener('click', function () { goTo(idx); reset(); });
			})(d);
		}

		function start() {
			if (!autoplay || total <= 1 || !isVisible) return;
			stop();
			timer = setInterval(next, interval);
		}
		function stop() { if (timer) { clearInterval(timer); timer = null; } }
		function reset() { stop(); start(); }

		root.addEventListener('mouseenter', stop);
		root.addEventListener('mouseleave', start);

		// Touch swipe
		var touchX = 0;
		root.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
		root.addEventListener('touchend', function (e) {
			var diff = touchX - e.changedTouches[0].screenX;
			if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); reset(); }
		}, { passive: true });

		// IntersectionObserver — only autoplay when slider is visible
		var observer = null;
		if ('IntersectionObserver' in window) {
			observer = new IntersectionObserver(function (entries) {
				isVisible = entries[0].isIntersecting;
				if (isVisible) {
					start();
				} else {
					stop();
				}
			}, { threshold: 0.1 });
			observer.observe(root);
		} else {
			isVisible = true;
		}

		goTo(0);
		if (isVisible) start();

		// Cleanup when slider is removed from DOM (e.g. popup close)
		if ('MutationObserver' in window) {
			var parentNode = root.parentNode;
			if (parentNode) {
				var cleanupObserver = new MutationObserver(function (mutations) {
					for (var m = 0; m < mutations.length; m++) {
						var removed = mutations[m].removedNodes;
						for (var n = 0; n < removed.length; n++) {
							if (removed[n] === root || (removed[n].contains && removed[n].contains(root))) {
								stop();
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

	function init() {
		var sliders = document.querySelectorAll('.atx-testimonial-slider');
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
