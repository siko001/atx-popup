<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Blocks {

	/**
	 * Block definitions: slug => label.
	 */
	private static $blocks = array(
		'hero'          => 'Hero',
		'two-columns'   => 'Two Columns',
		'cta-banner'    => 'CTA Banner',
		'feature-grid'  => 'Feature Grid',
		'testimonial'   => 'Testimonial',
		'newsletter'    => 'Newsletter',
		'media-slider'  => 'Media Slider',
	);

	/**
	 * Register the block category and enqueue block assets.
	 */
	public static function init() {
		add_filter( 'block_categories_all', array( __CLASS__, 'register_category' ), 10, 2 );
		add_action( 'init', array( __CLASS__, 'register_blocks' ) );
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_assets' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_frontend_assets' ) );
		add_filter( 'render_block', array( __CLASS__, 'maybe_enqueue_slider' ), 10, 2 );
	}

	/**
	 * Register the atx-popup block category.
	 */
	public static function register_category( $categories, $context ) {
		// Only add the category when editing an atx_popup post.
		if ( $context instanceof WP_Block_Editor_Context
			&& isset( $context->post )
			&& 'atx_popup' === get_post_type( $context->post )
		) {
			// Avoid duplicates.
			foreach ( $categories as $cat ) {
				if ( isset( $cat['slug'] ) && 'atx-popup' === $cat['slug'] ) {
					return $categories;
				}
			}

			array_unshift( $categories, array(
				'slug'  => 'atx-popup',
				'title' => __( 'ATX Popup', 'atx-popup' ),
				'icon'  => 'screenoptions',
			) );
		}

		return $categories;
	}

	/**
	 * Register all blocks server-side for rendering.
	 */
	public static function register_blocks() {
		foreach ( self::$blocks as $slug => $label ) {
			register_block_type( 'atx-popup/' . $slug, array(
				'api_version' => 3,
				'style'       => 'atx-popup-blocks-style',
			) );
		}
	}

	/**
	 * Enqueue block editor scripts and styles — only on the atx_popup CPT.
	 */
	public static function enqueue_editor_assets() {
		$screen = get_current_screen();

		if ( ! $screen || 'atx_popup' !== $screen->post_type ) {
			return;
		}

		$deps = array(
			'wp-blocks',
			'wp-element',
			'wp-block-editor',
			'wp-components',
			'wp-i18n',
			'wp-data',
		);

		foreach ( self::$blocks as $slug => $label ) {
			$js_path = ATX_POPUP_PATH . 'assets/js/blocks/atx-' . $slug . '.js';
			if ( file_exists( $js_path ) ) {
				wp_enqueue_script(
					'atx-popup-block-' . $slug,
					ATX_POPUP_URL . 'assets/js/blocks/atx-' . $slug . '.js',
					$deps,
					ATX_POPUP_VERSION,
					true
				);
			}
		}

		wp_enqueue_style(
			'atx-popup-blocks-editor',
			ATX_POPUP_URL . 'assets/css/blocks/atx-blocks-editor.css',
			array( 'wp-edit-blocks' ),
			ATX_POPUP_VERSION
		);
	}

	/**
	 * Enqueue frontend styles and scripts for blocks.
	 */
	public static function enqueue_frontend_assets() {
		wp_register_style(
			'atx-popup-blocks-style',
			ATX_POPUP_URL . 'assets/css/blocks/atx-blocks.css',
			array(),
			ATX_POPUP_VERSION
		);

		wp_register_script(
			'atx-popup-media-slider',
			ATX_POPUP_URL . 'assets/js/blocks/atx-media-slider-frontend.js',
			array(),
			ATX_POPUP_VERSION,
			true
		);

		wp_register_script(
			'atx-popup-testimonial-slider',
			ATX_POPUP_URL . 'assets/js/blocks/atx-testimonial-slider-frontend.js',
			array(),
			ATX_POPUP_VERSION,
			true
		);
	}

	/**
	 * Enqueue the slider script when a media-slider block is rendered.
	 */
	public static function maybe_enqueue_slider( $block_content, $block ) {
		if ( 'atx-popup/media-slider' === $block['blockName'] ) {
			wp_enqueue_script( 'atx-popup-media-slider' );
		}
		if ( 'atx-popup/testimonial' === $block['blockName'] ) {
			wp_enqueue_script( 'atx-popup-testimonial-slider' );
		}
		return $block_content;
	}
}
