(function ($) {
	'use strict';

	let currentDevice = 'desktop';

	// -------------------------------------------------
	// Conditional animation param fields
	// -------------------------------------------------
	$(document).on('change', '#atx_popup_animation', function () {
		const val = $(this).val();
		$('.atx-anim-param').each(function () {
			const anims = $(this).data('anim-for').toString().split(' ');
			if (anims.indexOf(val) !== -1) {
				$(this).removeAttr('hidden');
			} else {
				$(this).attr('hidden', '');
			}
		});
	});

	// -------------------------------------------------
	// Conditional trigger fields
	// -------------------------------------------------
	$(document).on('change', '#atx_popup_trigger', function () {
		const val = $(this).val();
		$('.atx-popup-trigger-field').each(function () {
			const triggers = $(this).data('trigger').toString().split(' ');
			$(this).toggle(triggers.indexOf(val) !== -1);
		});
	});

	// -------------------------------------------------
	// Conditional page targeting
	// -------------------------------------------------
	$(document).on('change', '#atx_popup_targeting', function () {
		$('.atx-popup-targeting-list').toggle($(this).val() === 'specific');
	});

	// -------------------------------------------------
	// Device toggle
	// -------------------------------------------------
	$(document).on('click', '.atx-device-btn', function (e) {
		e.preventDefault();
		e.stopPropagation();

		const $btn = $(this);
		const device = $btn.data('device');

		if (device === currentDevice) return;
		currentDevice = device;

		$('.atx-device-btn').removeClass('is-active');
		$btn.addClass('is-active');

		$('.atx-device-panel').each(function () {
			const $panel = $(this);
			if ($panel.data('device') === device) {
				$panel.removeAttr('hidden');
			} else {
				$panel.attr('hidden', '');
			}
		});

		syncEditorPreview();
		return false;
	});

	// -------------------------------------------------
	// Unit toggle buttons
	// -------------------------------------------------
	$(document).on('click', '.atx-unit-btn', function (e) {
		e.preventDefault();
		e.stopPropagation();

		const $btn = $(this);
		const $row = $btn.closest('.atx-size-row');

		$row.find('.atx-unit-btn').removeClass('is-active');
		$btn.addClass('is-active');
		$row.find('.atx-unit-value').val($btn.data('unit'));

		syncEditorPreview();
		return false;
	});

	// -------------------------------------------------
	// Live preview — resize the iframe
	// -------------------------------------------------

	function getActiveDeviceSizing() {
		const $panel = $(`.atx-device-panel[data-device="${currentDevice}"]`);
		const sizing = {};

		$panel.find('.atx-size-row').each(function () {
			const $row = $(this);
			const prop = $row.find('.atx-size-input').data('prop');
			const val = $row.find('.atx-size-input').val();
			const unit = $row.find('.atx-unit-value').val() || 'px';

			if (val !== '' && val !== undefined) {
				sizing[prop] = val + unit;
			}
		});

		return sizing;
	}

	function syncEditorPreview() {
		const sizing = getActiveDeviceSizing();

		// The Gutenberg editor wrapper — this is what we need to resize
		const $wrapper = $('.editor-styles-wrapper');
		if (!$wrapper.length) return;

		// Also try the Gutenberg iframe (not ACF/TinyMCE iframes)
		const $gutenbergIframe = $('iframe.edit-site-visual-editor__editor-canvas, iframe[name="editor-canvas"]');
		const $target = $gutenbergIframe.length ? $gutenbergIframe : $wrapper;

		// Reset all sizing
		$target.css({
			'width': '',
			'min-width': '',
			'max-width': '',
			'height': '',
			'min-height': '',
			'max-height': '',
			'border-radius': '',
			'padding': ''
		});

		// Apply device-specific sizing
		const sizeProps = ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'border-radius'];
		sizeProps.forEach(function (prop) {
			if (sizing[prop]) {
				$target[0].style.setProperty(prop, sizing[prop], 'important');
			}
		});

		// Always set a base width so max-width has something to constrain
		if (!sizing['width']) {
			$target[0].style.setProperty('width', '100%', 'important');
		}

		// If no width AND no max-width, default to 90%
		if (!sizing['width'] && !sizing['max-width']) {
			$target[0].style.setProperty('width', '90%', 'important');
		}

		// Base styles
		$target[0].style.setProperty('margin-left', 'auto', 'important');
		$target[0].style.setProperty('margin-right', 'auto', 'important');
		$target[0].style.setProperty('box-shadow', '0 8px 40px rgba(0,0,0,0.25)', 'important');
		$target[0].style.setProperty('transition', 'all 0.3s ease', 'important');
		$target[0].style.setProperty('background', '#fff', 'important');
		$target[0].style.setProperty('border-radius', sizing['border-radius'] || '8px', 'important');
		$target[0].style.setProperty('overflow-y', 'auto', 'important');

		// Apply padding to the content area inside the editor (not the wrapper itself)
		var $content = $target.find('.is-root-container, .block-editor-block-list__layout').first();
		if ($content.length) {
			if (sizing['padding']) {
				$content[0].style.setProperty('padding', sizing['padding'], 'important');
			} else {
				$content[0].style.removeProperty('padding');
			}
		}

		// Sync overlay color as editor background
		syncOverlayBackground();
	}

	function syncOverlayBackground() {
		var color = $('#atx_popup_overlay_color').val() || 'rgba(0,0,0,0.6)';
		$('.editor-styles-wrapper').parent().css('background', color);
	}

	// Size input changes.
	$(document).on('input change', '.atx-size-input', () => syncEditorPreview());

	// Sync trigger_selector to its hidden mirror field.
	$(document).on('input change', '#atx_popup_trigger_selector', function () {
		$('#atx_popup_trigger_selector_mirror').val($(this).val());
	});

	// -------------------------------------------------
	// Reset cookies button
	// -------------------------------------------------
	$(document).on('click', '.atx-reset-cookies-btn', function (e) {
		e.preventDefault();
		e.stopPropagation();

		const $btn = $(this);
		const postId = $btn.data('post-id');
		const nonce = $btn.data('nonce');

		$btn.addClass('is-spinning');

		$.post(atxPopupAdmin.ajaxUrl, {
			action: 'atx_popup_reset_cookies',
			post_id: postId,
			nonce: nonce
		}).done((response) => {
			if (response.success) {
				$btn.removeClass('is-spinning').addClass('is-done');
				setTimeout(() => $btn.removeClass('is-done'), 2000);
			}
		}).fail(() => {
			$btn.removeClass('is-spinning');
		});
	});

	// -------------------------------------------------
	// Collapsible sections
	// -------------------------------------------------
	$(document).on('click', '.atx-collapsible-toggle', function (e) {
		e.preventDefault();
		e.stopPropagation();

		const $section = $(this).closest('.atx-collapsible');
		const $content = $section.find('.atx-collapsible-content');

		$section.toggleClass('is-open');

		if ($section.hasClass('is-open')) {
			$content.removeAttr('hidden').slideDown(200);

			// Init color pickers inside this section if not yet done.
			$content.find('.atx-color-picker').each(function () {
				if (!$(this).closest('.wp-picker-container').length) {
					$(this).wpColorPicker();
				}
			});
		} else {
			$content.slideUp(200, function () {
				$(this).attr('hidden', '');
			});
		}

		return false;
	});

	$(document).on('keydown', '.atx-collapsible-toggle', function (e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$(this).trigger('click');
		}
	});

	// -------------------------------------------------
	// Close icon media uploader
	// -------------------------------------------------
	$(document).on('click', '.atx-close-icon-upload', function (e) {
		e.preventDefault();

		const $wrap = $(this).closest('.atx-close-icon-wrap');
		const $input = $wrap.find('#atx_popup_close_icon');

		const frame = wp.media({
			title: 'Choose Close Icon',
			multiple: false,
			library: { type: ['image', 'image/svg+xml'] }
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			$input.val(attachment.url);

			$wrap.find('.atx-close-icon-preview').remove();
			$wrap.prepend($('<img>').attr('src', attachment.url).addClass('atx-close-icon-preview'));
			$wrap.find('.atx-close-icon-remove').removeAttr('hidden');
		});

		frame.open();
	});

	$(document).on('click', '.atx-close-icon-remove', function (e) {
		e.preventDefault();

		const $wrap = $(this).closest('.atx-close-icon-wrap');
		$wrap.find('#atx_popup_close_icon').val('');
		$wrap.find('.atx-close-icon-preview').remove();
		$(this).attr('hidden', '');
	});

	// -------------------------------------------------
	// Init: wait for meta box & editor iframe via MutationObserver.
	// -------------------------------------------------
	function waitForElement(selector, callback) {
		try {
			var el = document.querySelector(selector);
			if (el) {
				callback(el);
				return;
			}
		} catch (e) {}
		var observer = new MutationObserver(function (mutations, obs) {
			try {
				var found = document.querySelector(selector);
				if (found) {
					obs.disconnect();
					callback(found);
				}
			} catch (e) {}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	// Init color pickers & field visibility once the meta box exists.
	waitForElement('.atx-popup-meta-box', function () {
		// Init all top-level color pickers (alpha plugin reads data-alpha-enabled)
		$('.atx-popup-meta-box > .atx-popup-field .atx-color-picker').wpColorPicker();

		// Watch overlay color — poll since wp-color-picker-alpha events are unreliable
		var lastOverlayColor = $('#atx_popup_overlay_color').val() || '';
		setInterval(function () {
			var current = $('#atx_popup_overlay_color').val() || '';
			if (current !== lastOverlayColor) {
				lastOverlayColor = current;
				syncOverlayBackground();
			}
		}, 300);

		// Set initial trigger field visibility.
		const triggerVal = $('#atx_popup_trigger').val();
		if (triggerVal) {
			$('.atx-popup-trigger-field').each(function () {
				const triggers = $(this).data('trigger').toString().split(' ');
				$(this).toggle(triggers.indexOf(triggerVal) !== -1);
			});
		}

		// Set initial targeting visibility.
		if ($('#atx_popup_targeting').val() !== 'specific') {
			$('.atx-popup-targeting-list').attr('hidden', '');
		}

		// Sync editor preview once iframe or editor wrapper is ready.
		waitForElement('iframe, .editor-styles-wrapper', function () {
			setTimeout(syncEditorPreview, 500);
		});

		// Re-sync when switching between Visual/Code editor modes.
		// WordPress destroys and recreates the DOM — we need to re-apply styles.
		var editorObserver = new MutationObserver(function () {
			var $wrapper = $('.editor-styles-wrapper');
			if ($wrapper.length && !$wrapper.data('atx-synced')) {
				$wrapper.data('atx-synced', true);
				setTimeout(syncEditorPreview, 300);
			}
		});
		editorObserver.observe(document.body, { childList: true, subtree: true });
	});

})(jQuery);
