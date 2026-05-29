<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Frontend {

	private static $popup = null;
	private static $meta  = array();

	public static function init() {
		if ( is_admin() ) {
			return;
		}

		$is_preview = isset( $_GET['atx_preview'] ) && is_user_logged_in();
		$preview_id = $is_preview ? absint( $_GET['atx_preview'] ) : 0;
		$prefix     = ATX_Popup_Config::META_PREFIX;

		if ( $is_preview && $preview_id > 0 ) {
			$popup = get_post( $preview_id );
			if ( ! $popup || 'atx_popup' !== $popup->post_type ) {
				return;
			}
		} elseif ( $is_preview ) {
			$popups = get_posts( array(
				'post_type'      => 'atx_popup',
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'meta_key'       => $prefix . 'active',
				'meta_value'     => '1',
				'posts_per_page' => 1,
			) );

			if ( empty( $popups ) ) {
				return;
			}
			$popup = $popups[0];
		} else {
			$cache_key = 'atx_popup_active';
			$popup_id = get_transient( $cache_key );

			if ( false === $popup_id ) {
				$popups = get_posts( array(
					'post_type'      => 'atx_popup',
					'post_status'    => 'publish',
					'meta_key'       => $prefix . 'active',
					'meta_value'     => '1',
					'posts_per_page' => 1,
					'fields'         => 'ids',
				) );

				$popup_id = ! empty( $popups ) ? $popups[0] : 0;
				set_transient( $cache_key, $popup_id, HOUR_IN_SECONDS );
			}

			if ( ! $popup_id ) {
				return;
			}

			$popup = get_post( $popup_id );
			if ( ! $popup ) {
				return;
			}
		}

		// Page targeting (skip in preview mode).
		if ( ! $is_preview ) {
			$targeting = get_post_meta( $popup->ID, $prefix . 'targeting', true );

			if ( 'specific' === $targeting ) {
				$target_ids = get_post_meta( $popup->ID, $prefix . 'target_ids', true );
				if ( ! is_array( $target_ids ) ) {
					$target_ids = array();
				}

				$current_id = (string) get_queried_object_id();
				if ( ! in_array( $current_id, $target_ids, true ) ) {
					return;
				}
			}
		}

		$should_show = apply_filters( 'atx_popup_should_show', true, $popup->ID );
		if ( ! $should_show ) {
			return;
		}

		self::$popup = $popup;
		self::$meta  = ATX_Popup_Config::get_all_meta( $popup->ID );

		do_action( 'atx_popup_loaded', $popup );

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'wp_footer', array( __CLASS__, 'render' ) );
	}

	/**
	 * Build CSS declarations for a device from saved sizing meta.
	 */
	/**
	 * Build CSS for a device. Returns array with 'container' and 'content' rules.
	 */
	private static function build_size_css( $device ) {
		$m         = self::$meta;
		$container = '';
		$content   = '';

		foreach ( ATX_Popup_Config::$size_props as $prop_key => $prop_info ) {
			$field_key = $prop_key . '_' . $device;
			$val  = $m[ $field_key . '_val' ] ?? '';
			$unit = $m[ $field_key . '_unit' ] ?? 'px';

			if ( '' === $val || false === $val ) {
				continue;
			}

			$css_prop = str_replace( '_', '-', $prop_key );
			$rule     = $css_prop . ':' . intval( $val ) . esc_attr( $unit ) . ';';

			// Padding goes on the content div so scrollbar stays outside.
			if ( 'padding' === $prop_key ) {
				$content .= $rule;
			} else {
				$container .= $rule;
			}
		}

		return array( 'container' => $container, 'content' => $content );
	}

	public static function enqueue() {
		wp_enqueue_style(
			'atx-popup-frontend',
			ATX_POPUP_URL . 'assets/css/atx-popup-frontend.css',
			array(),
			ATX_POPUP_VERSION
		);

		$m           = self::$meta;
		$breakpoints = ATX_Popup_Config::BREAKPOINTS;
		$css         = '';

		// Overlay background color.
		$css .= '#atx-popup-overlay{background-color:' . esc_attr( $m['overlay_color'] ) . ';}';

		// Responsive sizing — container gets size props, content gets padding.
		$desktop = self::build_size_css( 'desktop' );
		$tablet  = self::build_size_css( 'tablet' );
		$mobile  = self::build_size_css( 'mobile' );

		if ( $desktop['container'] ) {
			$css .= '#atx-popup-container{' . $desktop['container'] . '}';
		}
		if ( $desktop['content'] ) {
			$css .= '#atx-popup-content{' . $desktop['content'] . '}';
		}
		if ( $tablet['container'] || $tablet['content'] ) {
			$css .= '@media(max-width:' . $breakpoints['tablet'] . 'px){';
			if ( $tablet['container'] ) $css .= '#atx-popup-container{' . $tablet['container'] . '}';
			if ( $tablet['content'] )   $css .= '#atx-popup-content{' . $tablet['content'] . '}';
			$css .= '}';
		}
		if ( $mobile['container'] || $mobile['content'] ) {
			$css .= '@media(max-width:' . $breakpoints['mobile'] . 'px){';
			if ( $mobile['container'] ) $css .= '#atx-popup-container{' . $mobile['container'] . '}';
			if ( $mobile['content'] )   $css .= '#atx-popup-content{' . $mobile['content'] . '}';
			$css .= '}';
		}

		// Close button.
		$size      = intval( $m['close_size'] );
		$icon_size = intval( $m['close_icon_size'] );

		$css .= '#atx-popup-close{';
		$css .= 'background:' . esc_attr( $m['close_bg'] ) . ';';
		$css .= 'color:' . esc_attr( $m['close_color'] ) . ';';
		$css .= 'width:' . $size . 'px;height:' . $size . 'px;';
		$css .= 'font-size:' . $icon_size . 'px;';
		$css .= 'border-radius:' . intval( $m['close_radius'] ) . '%;';
		$css .= 'top:' . intval( $m['close_top'] ) . 'px;';
		$css .= 'right:' . intval( $m['close_right'] ) . 'px;';
		$css .= '}';
		$css .= '#atx-popup-close:hover,#atx-popup-close:focus{';
		$css .= 'background:' . esc_attr( $m['close_hover_bg'] ) . ';';
		$css .= 'color:' . esc_attr( $m['close_hover_color'] ) . ';';
		$css .= '}';

		wp_add_inline_style( 'atx-popup-frontend', $css );

		// GSAP from CDN.
		wp_enqueue_script(
			'gsap',
			'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
			array(),
			'3.12.5',
			true
		);

		wp_enqueue_script(
			'atx-popup-frontend',
			ATX_POPUP_URL . 'assets/js/atx-popup-frontend.js',
			array( 'gsap' ),
			ATX_POPUP_VERSION,
			true
		);

		// Pass animation config to JS.
		wp_localize_script( 'atx-popup-frontend', 'atxPopupAnim', array(
			'duration' => intval( $m['anim_duration'] ) / 1000,
			'easing'   => $m['anim_easing'],
			'reverse'  => $m['anim_reverse'] === '1',
			'distance' => intval( $m['anim_distance'] ),
			'scale'    => intval( $m['anim_scale'] ) / 100,
			'degrees'  => intval( $m['anim_degrees'] ),
		) );

		wp_localize_script( 'atx-popup-frontend', 'atxPopupTrack', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'popupId' => self::$popup->ID,
		) );
	}

	public static function render() {
		if ( ! self::$popup ) {
			return;
		}

		$popup   = self::$popup;
		$meta    = self::$meta;
		$content = do_blocks( $popup->post_content );

		if ( ! has_blocks( $popup->post_content ) ) {
			$content = wpautop( $content );
		}

		$content = apply_filters( 'atx_popup_content', $content, $popup->ID );

		$is_preview        = isset( $_GET['atx_preview'] ) && is_user_logged_in();
		$container_classes = 'atx-popup-anim-' . esc_attr( $meta['animation'] );

		if ( '1' === $meta['close_fixed'] ) {
			$container_classes .= ' atx-close-fixed';
		}

		include ATX_POPUP_PATH . 'templates/frontend/popup.php';
	}
}
