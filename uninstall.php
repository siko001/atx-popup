<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete all popup posts and their meta.
$popups = get_posts( array(
	'post_type'      => 'atx_popup',
	'post_status'    => 'any',
	'posts_per_page' => -1,
	'fields'         => 'ids',
) );

foreach ( $popups as $popup_id ) {
	wp_delete_post( $popup_id, true );
}
