(function () {
	'use strict';

	const MS_PER_DAY = 86400000;
	const overlay = document.getElementById('atx-popup-overlay');
	if (!overlay) return;

	const config = {
		trigger:       overlay.dataset.trigger || 'load',
		delay:         parseInt(overlay.dataset.delay, 10) || 0,
		scroll:        parseInt(overlay.dataset.scroll, 10) || 50,
		cookieDays:    parseInt(overlay.dataset.cookieDays, 10) || 7,
		animation:     overlay.dataset.animation || 'fade-in',
		popupId:       overlay.dataset.popupId || '0',
		cookieVersion: overlay.dataset.cookieVersion || '1',
		timeOnSite:    parseInt(overlay.getAttribute('data-time-on-site')) || 30,
		selector:      (overlay.dataset.selector || '').trim(),
		scrollElement: overlay.getAttribute('data-scroll-element') || ''
	};

	function trackEvent(event) {
		if (typeof atxPopupTrack === 'undefined') return;
		var data = new FormData();
		data.append('action', 'atx_popup_track');
		data.append('popup_id', atxPopupTrack.popupId);
		data.append('event', event);
		fetch(atxPopupTrack.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' });
	}

	const isPreview   = overlay.dataset.preview === '1';
	const COOKIE_NAME = 'atx_popup_closed_' + config.popupId + '_v' + config.cookieVersion;
	const LEGACY_COOKIE = 'atx_popup_closed_' + config.popupId;

	// Animation config from PHP.
	const hasAnimConfig = typeof atxPopupAnim !== 'undefined';
	const animDuration  = hasAnimConfig ? parseFloat(atxPopupAnim.duration) : 0.4;
	const animEasing    = hasAnimConfig ? atxPopupAnim.easing : 'ease-out';
	const animReverse   = hasAnimConfig ? !!atxPopupAnim.reverse : false;
	const animDistance   = hasAnimConfig ? parseInt(atxPopupAnim.distance, 10) : 100;
	const animScale     = hasAnimConfig ? parseFloat(atxPopupAnim.scale) : 0.6;
	const animDegrees   = hasAnimConfig ? parseInt(atxPopupAnim.degrees, 10) : 90;

	// Map CSS easing names to GSAP easing.
	const gsapEasing = {
		'ease':        'power2.inOut',
		'ease-in':     'power2.in',
		'ease-out':    'power2.out',
		'ease-in-out': 'power3.inOut',
		'linear':      'none',
	};

	const ease = gsapEasing[animEasing] || 'power2.out';

	// Build start properties using admin-configurable values.
	const dist  = animDistance + 'vh';
	const distX = animDistance + 'vw';
	// For zoom-out, scale is inverted (e.g. 60% admin = 1.4 start scale).
	const zoomOutScale = 2 - animScale;

	const animStartProps = {
		'fade-in':     { opacity: 0 },
		'slide-up':    { opacity: 0, y: dist },
		'slide-down':  { opacity: 0, y: '-' + dist },
		'slide-left':  { opacity: 0, x: distX },
		'slide-right': { opacity: 0, x: '-' + distX },
		'zoom-in':     { opacity: 0, scale: animScale },
		'zoom-out':    { opacity: 0, scale: zoomOutScale },
		'flip-x':      { opacity: 0, rotationY: animDegrees },
		'flip-y':      { opacity: 0, rotationX: animDegrees },
		'rotate-in':   { opacity: 0, rotation: -animDegrees, scale: animScale },
		'bounce-in':   { opacity: 0, scale: animScale * 0.2 },
	};

	// --- Cookie helpers ---

	function getCookie(name) {
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? match[2] : null;
	}

	function setCookie(name, value, days) {
		let expires = '';
		if (days > 0) {
			const date = new Date();
			date.setTime(date.getTime() + days * MS_PER_DAY);
			expires = '; expires=' + date.toUTCString();
		}
		document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
	}

	// --- State ---
	let hasSelector = config.selector.length > 0;
	if (hasSelector) {
		try {
			document.querySelector(config.selector);
		} catch (e) {
			hasSelector = false;
		}
	}
	const isManual    = config.trigger === 'manual';
	const hasCookie   = !!(getCookie(COOKIE_NAME) || getCookie(LEGACY_COOKIE));
	const canReopen   = hasSelector || isManual || isPreview;

	if (hasCookie && !canReopen) {
		overlay.remove();
		return;
	}

	const container = document.getElementById('atx-popup-container');
	let shown = false;
	let openTimeline = null;
	var previousFocus = null;

	// Focus trap
	var focusableSelector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

	function trapFocus(e) {
		if (e.key !== 'Tab') return;
		var focusable = container.querySelectorAll(focusableSelector);
		if (!focusable.length) return;
		var first = focusable[0];
		var last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function showPopup() {
		if (shown) return;
		shown = true;

		const startProps = animStartProps[config.animation] || { opacity: 0 };
		const bounceEase = config.animation === 'bounce-in' ? 'back.out(1.7)' : ease;

		// 1. Set starting state BEFORE making visible (prevents flash).
		gsap.set(overlay, { opacity: 0 });
		if (container) {
			gsap.set(container, startProps);
		}

		// 2. Now make it visible in DOM.
		overlay.classList.add('is-visible');
		document.body.style.overflow = 'hidden';

		// 3. Animate in.
		if (openTimeline) openTimeline.kill();
		openTimeline = gsap.timeline();

		openTimeline.to(overlay, {
			opacity: 1,
			duration: animDuration,
			ease: ease
		});

		if (container) {
			openTimeline.to(container, {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
				rotation: 0,
				rotationX: 0,
				rotationY: 0,
				duration: animDuration,
				ease: bounceEase
			}, 0);
		}

		trackEvent('impression');
		document.dispatchEvent(new CustomEvent('atx_popup_shown', { detail: { popupId: config.popupId } }));

		// Focus trap: store previous focus, activate trap, focus close button.
		previousFocus = document.activeElement;
		document.addEventListener('keydown', trapFocus);
		var closeBtn = document.getElementById('atx-popup-close');
		if (closeBtn) closeBtn.focus();
	}

	function onCloseComplete() {
		overlay.classList.remove('is-visible');
		document.body.style.overflow = '';

		if (container) {
			gsap.set(container, { clearProps: 'all' });
		}
		gsap.set(overlay, { clearProps: 'opacity' });
	}

	function closePopup() {
		if (!shown) return;

		document.removeEventListener('keydown', trapFocus);
		if (previousFocus) previousFocus.focus();

		trackEvent('close');
		document.dispatchEvent(new CustomEvent('atx_popup_closed', { detail: { popupId: config.popupId } }));

		if (animReverse && openTimeline && openTimeline.progress() > 0) {
			// Reverse the open animation.
			openTimeline.eventCallback('onReverseComplete', onCloseComplete);
			openTimeline.reverse();
		} else {
			// Default: quick fade out.
			if (openTimeline) openTimeline.kill();

			gsap.to(overlay, {
				opacity: 0,
				duration: animDuration * 0.6,
				ease: 'power2.in',
				onComplete: onCloseComplete
			});
		}

		if (canReopen) {
			shown = false;
		}

		if (!isPreview) {
			setCookie(COOKIE_NAME, '1', config.cookieDays);
		}
	}

	// --- Bind close events ---

	const closeBtn = document.getElementById('atx-popup-close');
	if (closeBtn) {
		closeBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			closePopup();
		});
	}

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			closePopup();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && shown) {
			closePopup();
		}
	}, { passive: true });

	// --- Auto trigger ---

	if (!hasCookie || isPreview) {
		if (config.trigger === 'load') {
			const delay = config.delay > 0 ? config.delay * 1000 : 100;
			setTimeout(showPopup, delay);
		} else if (config.trigger === 'scroll') {
			let scrollTicking = false;
			const onScroll = () => {
				if (scrollTicking) return;
				scrollTicking = true;
				requestAnimationFrame(() => {
					scrollTicking = false;
					const docHeight = document.documentElement.scrollHeight - window.innerHeight;
					if (docHeight <= 0) return;
					const scrolled = (window.scrollY / docHeight) * 100;
					if (scrolled >= config.scroll) {
						window.removeEventListener('scroll', onScroll);
						showPopup();
					}
				});
			};
			window.addEventListener('scroll', onScroll, { passive: true });
		} else if (config.trigger === 'time-on-site') {
			setTimeout(function() {
				if (!shown) showPopup();
			}, config.timeOnSite * 1000);
		} else if (config.trigger === 'exit-intent') {
			const onMouseLeave = (e) => {
				if (e.clientY <= 0) {
					document.removeEventListener('mouseleave', onMouseLeave);
					showPopup();
				}
			};
			document.addEventListener('mouseleave', onMouseLeave);
		} else if (config.trigger === 'scroll-to-element' && config.scrollElement) {
			var targetEl;
			try {
				targetEl = document.querySelector(config.scrollElement);
			} catch(e) {
				targetEl = null;
			}
			if (targetEl && 'IntersectionObserver' in window) {
				var scrollObserver = new IntersectionObserver(function(entries) {
					if (entries[0].isIntersecting && !shown) {
						showPopup();
						scrollObserver.disconnect();
					}
				}, { threshold: 0.1 });
				scrollObserver.observe(targetEl);
			}
		}
	}

	// --- Element click opener ---

	if (hasSelector) {
		document.addEventListener('click', (e) => {
			if (shown) return;
			const el = e.target.closest(config.selector);
			if (el) {
				e.preventDefault();
				showPopup();
			}
		});
	}
})();
