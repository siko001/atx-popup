<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Admin_Assets {

	public static function enqueue( $hook ) {
		$screen = get_current_screen();

		if ( ! $screen || 'atx_popup' !== $screen->post_type ) {
			return;
		}

		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );

		wp_enqueue_script(
			'wp-color-picker-alpha',
			ATX_POPUP_URL . 'assets/js/wp-color-picker-alpha.min.js',
			array( 'wp-color-picker' ),
			'3.0.2',
			true
		);

		wp_enqueue_style(
			'atx-popup-admin',
			ATX_POPUP_URL . 'assets/css/atx-popup-admin.css',
			array( 'wp-color-picker' ),
			ATX_POPUP_VERSION
		);

		wp_enqueue_media();

		wp_enqueue_script(
			'atx-popup-admin',
			ATX_POPUP_URL . 'assets/js/atx-popup-admin.js',
			array( 'jquery', 'wp-color-picker-alpha' ),
			ATX_POPUP_VERSION,
			true
		);

		// Pass data to the admin JS.
		global $post;
		$preview_url = '';
		$preview_id  = 0;
		if ( $post && 'atx_popup' === $post->post_type ) {
			$preview_id  = $post->ID;
			$preview_url = add_query_arg( 'atx_preview', $post->ID, home_url( '/' ) );
		}

		wp_localize_script( 'atx-popup-admin', 'atxPopupAdmin', array(
			'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
			'editorCssUrl' => ATX_POPUP_URL . 'assets/css/atx-popup-editor.css?ver=' . ATX_POPUP_VERSION,
			'previewUrl'   => $preview_url,
			'previewId'    => $preview_id,
		) );
	}

	/**
	 * Enqueue editor-specific styles inside the block editor (including iframe).
	 */
	public static function enqueue_editor() {
		$screen = get_current_screen();

		if ( ! $screen || 'atx_popup' !== $screen->post_type ) {
			return;
		}

		// Editor-specific styles (dark background, card look).
		wp_enqueue_style(
			'atx-popup-editor',
			ATX_POPUP_URL . 'assets/css/atx-popup-editor.css',
			array(),
			ATX_POPUP_VERSION
		);

		// Load the FRONTEND block CSS into the editor so blocks look the same.
		wp_enqueue_style(
			'atx-popup-blocks-frontend-in-editor',
			ATX_POPUP_URL . 'assets/css/blocks/atx-blocks.css',
			array(),
			ATX_POPUP_VERSION
		);

		// Load the popup frontend CSS (for content styling consistency).
		wp_enqueue_style(
			'atx-popup-frontend-in-editor',
			ATX_POPUP_URL . 'assets/css/atx-popup-frontend.css',
			array(),
			ATX_POPUP_VERSION
		);

		// Override popup-specific selectors for editor context.
		$editor_overrides = '
			/* Map editor wrapper to popup content selectors */
			.editor-styles-wrapper { overflow: hidden; }
			.editor-styles-wrapper img { max-width: 100%; height: auto; }
			.editor-styles-wrapper .atx-slider-slide img,
			.editor-styles-wrapper .atx-slider-slide video {
				max-width: none; width: 100%; height: 100%; object-fit: cover;
			}
			.editor-styles-wrapper .atx-media-slider-block,
			.editor-styles-wrapper .atx-testimonial-block,
			.editor-styles-wrapper .atx-testimonial-slider,
			.editor-styles-wrapper .atx-hero-block,
			.editor-styles-wrapper .atx-cta-banner-block,
			.editor-styles-wrapper .atx-feature-grid-block,
			.editor-styles-wrapper .atx-newsletter-block,
			.editor-styles-wrapper .atx-two-columns-block {
				overflow: hidden; box-sizing: border-box; max-width: 100%;
			}
			.editor-styles-wrapper .atx-two-columns-block { display: flex; flex-wrap: nowrap; }
			.editor-styles-wrapper .atx-two-columns-block > * { min-width: 0; overflow: hidden; }
		';
		wp_add_inline_style( 'atx-popup-frontend-in-editor', $editor_overrides );
	}
}
