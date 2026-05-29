<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Meta_Boxes {

	public static function register() {
		add_meta_box(
			'atx_popup_settings',
			__( 'Popup Settings', 'atx-popup' ),
			array( __CLASS__, 'render' ),
			'atx_popup',
			'side',
			'default'
		);
	}

	public static function render( $post ) {
		wp_nonce_field( 'atx_popup_save', 'atx_popup_nonce' );

		$meta        = ATX_Popup_Config::get_all_meta( $post->ID );
		$preview_url = add_query_arg( 'atx_preview', $post->ID, home_url( '/' ) );

		// Pre-fetch target pages/posts for the checklist.
		$target_posts = array();
		foreach ( array( 'page', 'post' ) as $pt ) {
			$items = get_posts( array(
				'post_type'      => $pt,
				'post_status'    => 'publish',
				'posts_per_page' => 200,
				'orderby'        => 'title',
				'order'          => 'ASC',
			) );

			if ( ! empty( $items ) ) {
				$target_posts[ $pt ] = $items;
			}
		}

		$target_ids = $meta['target_ids'];
		if ( ! is_array( $target_ids ) ) {
			$target_ids = array();
		}

		$animations   = ATX_Popup_Config::$animations;
		$easings      = ATX_Popup_Config::$easings;
		$triggers     = ATX_Popup_Config::$triggers;
		$size_props   = ATX_Popup_Config::$size_props;
		$devices      = ATX_Popup_Config::$devices;

		include ATX_POPUP_PATH . 'templates/admin/meta-box.php';
	}

	public static function save( $post_id, $post ) {
		if ( ! isset( $_POST['atx_popup_nonce'] ) || ! wp_verify_nonce( $_POST['atx_popup_nonce'], 'atx_popup_save' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$prefix = ATX_Popup_Config::META_PREFIX;

		// Active toggle — enforce single active.
		$is_active = isset( $_POST['atx_popup_active'] ) ? '1' : '0';

		if ( '1' === $is_active ) {
			$others = get_posts( array(
				'post_type'      => 'atx_popup',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'post__not_in'   => array( $post_id ),
				'meta_key'       => $prefix . 'active',
				'meta_value'     => '1',
				'fields'         => 'ids',
			) );

			foreach ( $others as $other_id ) {
				update_post_meta( $other_id, $prefix . 'active', '0' );
			}
		}

		update_post_meta( $post_id, $prefix . 'active', $is_active );

		// Checkboxes.
		$close_fixed = isset( $_POST['atx_popup_close_fixed'] ) ? '1' : '0';
		update_post_meta( $post_id, $prefix . 'close_fixed', $close_fixed );

		$anim_reverse = isset( $_POST['atx_popup_anim_reverse'] ) ? '1' : '0';
		update_post_meta( $post_id, $prefix . 'anim_reverse', $anim_reverse );

		// Simple fields.
		foreach ( ATX_Popup_Config::$save_fields as $key => $sanitize ) {
			$post_key   = 'atx_popup_' . $key;
			$mirror_key = $post_key . '_mirror';

			if ( isset( $_POST[ $post_key ] ) ) {
				$value = call_user_func( $sanitize, $_POST[ $post_key ] );
			} elseif ( isset( $_POST[ $mirror_key ] ) ) {
				$value = call_user_func( $sanitize, $_POST[ $mirror_key ] );
			} else {
				continue;
			}

			update_post_meta( $post_id, $prefix . $key, $value );
		}

		// Per-device sizing fields.
		foreach ( ATX_Popup_Config::$devices as $device ) {
			foreach ( ATX_Popup_Config::$size_props as $prop_key => $prop_info ) {
				$field_key = $prop_key . '_' . $device;

				$val_key = 'atx_popup_' . $field_key . '_val';
				$raw     = isset( $_POST[ $val_key ] ) ? $_POST[ $val_key ] : '';
				$val     = ( '' !== $raw && false !== $raw ) ? strval( intval( $raw ) ) : '';
				update_post_meta( $post_id, $prefix . $field_key . '_val', $val );

				$unit_key = 'atx_popup_' . $field_key . '_unit';
				$unit     = isset( $_POST[ $unit_key ] ) ? sanitize_text_field( $_POST[ $unit_key ] ) : 'px';
				if ( ! in_array( $unit, ATX_Popup_Config::$allowed_units, true ) ) {
					$unit = 'px';
				}
				update_post_meta( $post_id, $prefix . $field_key . '_unit', $unit );
			}
		}

		// Target IDs.
		$target_ids = array();
		if ( isset( $_POST['atx_popup_target_ids'] ) && is_array( $_POST['atx_popup_target_ids'] ) ) {
			$target_ids = array_map( 'absint', $_POST['atx_popup_target_ids'] );
			$target_ids = array_map( 'strval', $target_ids );
		}
		update_post_meta( $post_id, $prefix . 'target_ids', $target_ids );

		delete_transient( 'atx_popup_active' );
	}
}
