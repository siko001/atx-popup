<?php
/**
 * Plugin Name: ATX Popup
 * Description: A Gutenberg-powered popup builder with targeting, triggers, and animation options.
 * Version: 1.2.0
 * Author: ATX - Neil VM
 * Author URI: https://identita.com
 * Text Domain: atx-popup
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ATX_POPUP_VERSION', '1.3.0' );
define( 'ATX_POPUP_PATH', plugin_dir_path( __FILE__ ) );
define( 'ATX_POPUP_URL', plugin_dir_url( __FILE__ ) );

add_action( 'init', function () {
	load_plugin_textdomain( 'atx-popup', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
} );

require_once ATX_POPUP_PATH . 'includes/class-config.php';
require_once ATX_POPUP_PATH . 'includes/class-cpt.php';
require_once ATX_POPUP_PATH . 'includes/class-meta-boxes.php';
require_once ATX_POPUP_PATH . 'includes/class-admin-assets.php';
require_once ATX_POPUP_PATH . 'includes/class-frontend.php';
require_once ATX_POPUP_PATH . 'includes/class-blocks.php';
require_once ATX_POPUP_PATH . 'includes/class-dashboard.php';
require_once ATX_POPUP_PATH . 'src/Support/GitHubPluginUpdater.php';

register_activation_hook( __FILE__, function () {
	flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, function () {
	flush_rewrite_rules();
} );

ATX_Popup_Blocks::init();
ATX_Popup_Dashboard::init();


add_action( 'init', array( 'ATX_Popup_CPT', 'register' ) );
add_action( 'admin_init', array( 'ATX_Popup_CPT', 'hooks' ) );
add_action( 'add_meta_boxes', array( 'ATX_Popup_Meta_Boxes', 'register' ) );
add_action( 'save_post_atx_popup', array( 'ATX_Popup_Meta_Boxes', 'save' ), 10, 2 );
add_action( 'admin_enqueue_scripts', array( 'ATX_Popup_Admin_Assets', 'enqueue' ) );
add_action( 'enqueue_block_editor_assets', array( 'ATX_Popup_Admin_Assets', 'enqueue_editor' ) );
add_action( 'wp', array( 'ATX_Popup_Frontend', 'init' ) );
add_action( 'wp_ajax_atx_popup_reset_cookies', 'atx_popup_reset_cookies' );

function atx_popup_reset_cookies() {
	check_ajax_referer( 'atx_reset_cookies', 'nonce' );

	$post_id = absint( $_POST['post_id'] ?? 0 );
	if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
		wp_send_json_error( 'Unauthorized' );
	}

	$current = (int) get_post_meta( $post_id, ATX_Popup_Config::META_PREFIX . 'cookie_version', true );
	update_post_meta( $post_id, ATX_Popup_Config::META_PREFIX . 'cookie_version', $current + 1 );

	wp_send_json_success( array( 'version' => $current + 1 ) );
}



add_action( 'wp_ajax_atx_popup_track', 'atx_popup_track_event' );
add_action( 'wp_ajax_nopriv_atx_popup_track', 'atx_popup_track_event' );

function atx_popup_track_event() {
	$post_id = absint( $_POST['popup_id'] ?? 0 );
	$event   = sanitize_text_field( $_POST['event'] ?? '' );

	if ( ! $post_id || ! in_array( $event, array( 'impression', 'close' ), true ) ) {
		wp_send_json_error();
	}

	$meta_key = '_atx_popup_stat_' . $event;
	$current  = (int) get_post_meta( $post_id, $meta_key, true );
	update_post_meta( $post_id, $meta_key, $current + 1 );

	wp_send_json_success();
}

add_action('plugins_loaded', function () {
	if (is_admin() && class_exists('\\Src\\Support\\GitHubPluginUpdater')) {
		(new \Src\Support\GitHubPluginUpdater(__FILE__, __DIR__))->register();
	}
});
