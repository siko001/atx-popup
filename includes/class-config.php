<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Config {

	const META_PREFIX = '_atx_popup_';

	const BREAKPOINTS = array(
		'tablet' => 1024,
		'mobile' => 768,
	);

	public static $devices = array( 'desktop', 'tablet', 'mobile' );

	public static $size_props = array(
		'width'         => array( 'label' => 'Width',      'default_val' => '',    'default_unit' => '%',  'units' => array( 'px', '%', 'vw' ) ),
		'min_width'     => array( 'label' => 'Min Width',  'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%', 'vw' ) ),
		'max_width'     => array( 'label' => 'Max Width',  'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%', 'vw' ) ),
		'height'        => array( 'label' => 'Height',     'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%', 'vh' ) ),
		'min_height'    => array( 'label' => 'Min Height', 'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%', 'vh' ) ),
		'max_height'    => array( 'label' => 'Max Height', 'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%', 'vh' ) ),
		'padding'       => array( 'label' => 'Padding',    'default_val' => '',    'default_unit' => 'px', 'units' => array( 'px', '%' ) ),
		'border_radius' => array( 'label' => 'Radius',     'default_val' => '8',   'default_unit' => 'px', 'units' => array( 'px', '%' ) ),
	);

	public static $defaults = array(
		'active'           => '0',
		'overlay_color'    => 'rgba(0,0,0,0.6)',
		'animation'        => 'fade-in',
		'anim_duration'    => '400',
		'anim_easing'      => 'ease-out',
		'anim_reverse'     => '0',
		'anim_distance'    => '100',
		'anim_scale'       => '60',
		'anim_degrees'     => '90',
		'targeting'        => 'all',
		'target_ids'       => array(),
		'close_fixed'      => '0',
		'close_bg'         => 'rgba(255,255,255,0.85)',
		'close_color'      => '#333333',
		'close_hover_bg'   => 'rgba(255,255,255,1)',
		'close_hover_color'=> '#000000',
		'close_size'       => '36',
		'close_icon_size'  => '18',
		'close_radius'     => '50',
		'close_top'        => '10',
		'close_right'      => '10',
		'close_icon'       => '',
		'cookie_days'      => '7',
		'cookie_version'   => '1',
		'trigger'          => 'load',
		'trigger_delay'    => '0',
		'scroll_percent'   => '50',
		'time_on_site'     => '30',
		'scroll_element'   => '',
		'trigger_selector' => '',
	);

	public static $animations = array(
		'fade-in'     => 'Fade In',
		'slide-up'    => 'Slide Up',
		'slide-down'  => 'Slide Down',
		'slide-left'  => 'Slide Left',
		'slide-right' => 'Slide Right',
		'zoom-in'     => 'Zoom In',
		'zoom-out'    => 'Zoom Out',
		'flip-x'      => 'Flip Horizontal',
		'flip-y'      => 'Flip Vertical',
		'rotate-in'   => 'Rotate In',
		'bounce-in'   => 'Bounce In',
	);

	public static $easings = array(
		'ease'        => 'Ease',
		'ease-in'     => 'Ease In',
		'ease-out'    => 'Ease Out',
		'ease-in-out' => 'Ease In Out',
		'linear'      => 'Linear',
	);

	public static $triggers = array(
		'load'        => 'Page Load',
		'scroll'      => 'Scroll Percentage',
		'exit-intent'  => 'Exit Intent',
		'time-on-site'      => 'Time on Site',
		'scroll-to-element' => 'Scroll to Element',
		'manual'            => 'Element Only',
	);

	public static $save_fields = array(
		'overlay_color'    => 'sanitize_text_field',
		'animation'        => 'sanitize_text_field',
		'anim_duration'    => 'absint',
		'anim_easing'      => 'sanitize_text_field',
		'anim_distance'    => 'absint',
		'anim_scale'       => 'absint',
		'anim_degrees'     => 'absint',
		'close_bg'         => 'sanitize_text_field',
		'close_color'      => 'sanitize_text_field',
		'close_hover_bg'   => 'sanitize_text_field',
		'close_hover_color'=> 'sanitize_text_field',
		'close_size'       => 'absint',
		'close_icon_size'  => 'absint',
		'close_radius'     => 'absint',
		'close_top'        => 'absint',
		'close_right'      => 'absint',
		'close_icon'       => 'esc_url_raw',
		'targeting'        => 'sanitize_text_field',
		'cookie_days'      => 'absint',
		'trigger'          => 'sanitize_text_field',
		'trigger_delay'    => 'absint',
		'scroll_percent'   => 'absint',
		'time_on_site'     => 'absint',
		'scroll_element'   => 'sanitize_text_field',
		'trigger_selector' => 'sanitize_text_field',
	);

	public static $allowed_units = array( 'px', '%', 'vw', 'vh' );

	/**
	 * Get a single meta value with default fallback.
	 */
	public static function get_meta( $post_id, $key, $default = '' ) {
		$value = get_post_meta( $post_id, self::META_PREFIX . $key, true );

		if ( '' === $value || false === $value ) {
			if ( isset( self::$defaults[ $key ] ) ) {
				return self::$defaults[ $key ];
			}
			return $default;
		}

		return $value;
	}

	/**
	 * Get all popup meta for a post, including per-device sizing.
	 */
	public static function get_all_meta( $post_id ) {
		$meta = array();

		foreach ( self::$defaults as $key => $default ) {
			$meta[ $key ] = self::get_meta( $post_id, $key, $default );
		}

		// Per-device sizing fields.
		foreach ( self::$devices as $device ) {
			foreach ( self::$size_props as $prop_key => $prop_info ) {
				$field_key = $prop_key . '_' . $device;
				$meta[ $field_key . '_val' ]  = self::get_meta( $post_id, $field_key . '_val', $prop_info['default_val'] );
				$meta[ $field_key . '_unit' ] = self::get_meta( $post_id, $field_key . '_unit', $prop_info['default_unit'] );
			}
		}

		return $meta;
	}
}
