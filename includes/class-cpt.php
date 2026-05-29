<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_CPT {

	public static function register() {
		register_post_type( 'atx_popup', array(
			'labels'              => array(
				'name'               => __( 'ATX Popups', 'atx-popup' ),
				'singular_name'      => __( 'Popup', 'atx-popup' ),
				'add_new'            => __( 'Add New Popup', 'atx-popup' ),
				'add_new_item'       => __( 'Add New Popup', 'atx-popup' ),
				'edit_item'          => __( 'Edit Popup', 'atx-popup' ),
				'new_item'           => __( 'New Popup', 'atx-popup' ),
				'view_item'          => __( 'View Popup', 'atx-popup' ),
				'search_items'       => __( 'Search Popups', 'atx-popup' ),
				'not_found'          => __( 'No popups found', 'atx-popup' ),
				'not_found_in_trash' => __( 'No popups found in Trash', 'atx-popup' ),
				'all_items'          => __( 'All Popups', 'atx-popup' ),
			),
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'supports'            => array( 'title', 'editor' ),
			'menu_icon'           => 'dashicons-welcome-widgets-menus',
			'menu_position'       => 58,
			'exclude_from_search' => true,
			'has_archive'         => false,
			'rewrite'             => false,
		) );
	}

	public static function hooks() {
		add_filter( 'manage_atx_popup_posts_columns', array( __CLASS__, 'add_columns' ) );
		add_action( 'manage_atx_popup_posts_custom_column', array( __CLASS__, 'render_columns' ), 10, 2 );
		add_filter( 'post_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
	}

	public static function add_columns( $columns ) {
		$new = array();

		foreach ( $columns as $key => $label ) {
			$new[ $key ] = $label;

			if ( 'title' === $key ) {
				$new['atx_active']      = __( 'Active', 'atx-popup' );
				$new['atx_preview']     = __( 'Preview', 'atx-popup' );
				$new['atx_impressions'] = __( 'Impressions', 'atx-popup' );
				$new['atx_closes']      = __( 'Closes', 'atx-popup' );
			}
		}

		return $new;
	}

	public static function render_columns( $column, $post_id ) {
		if ( 'atx_active' === $column ) {
			$active = get_post_meta( $post_id, ATX_Popup_Config::META_PREFIX . 'active', true );

			if ( '1' === $active ) {
				echo '<span class="atx-status-active">&#9679; ' . esc_html__( 'Active', 'atx-popup' ) . '</span>';
			} else {
				echo '<span class="atx-status-inactive">&mdash;</span>';
			}
		}

		if ( 'atx_impressions' === $column ) {
			echo intval( get_post_meta( $post_id, '_atx_popup_stat_impression', true ) );
		}

		if ( 'atx_closes' === $column ) {
			echo intval( get_post_meta( $post_id, '_atx_popup_stat_close', true ) );
		}

		if ( 'atx_preview' === $column ) {
			$url = add_query_arg( 'atx_preview', $post_id, home_url( '/' ) );
			echo '<a href="' . esc_url( $url ) . '" target="_blank" class="atx-column-preview" title="' . esc_attr__( 'Preview this popup', 'atx-popup' ) . '">';
			echo '<span class="dashicons dashicons-visibility"></span>';
			echo '</a>';
		}
	}

	public static function row_actions( $actions, $post ) {
		if ( 'atx_popup' !== $post->post_type ) {
			return $actions;
		}

		$url = add_query_arg( 'atx_preview', $post->ID, home_url( '/' ) );
		$actions['atx_preview'] = '<a href="' . esc_url( $url ) . '" target="_blank">' . esc_html__( 'Preview Popup', 'atx-popup' ) . '</a>';

		return $actions;
	}
}
