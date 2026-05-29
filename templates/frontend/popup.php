<?php
/**
 * Frontend popup template.
 *
 * @var WP_Post $popup
 * @var array   $meta
 * @var string  $content
 * @var bool    $is_preview
 * @var string  $container_classes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<style>#atx-popup-overlay:not(.is-visible){display:none!important}</style>
<div id="atx-popup-overlay"
	data-trigger="<?php echo esc_attr( $meta['trigger'] ); ?>"
	data-delay="<?php echo esc_attr( $meta['trigger_delay'] ); ?>"
	data-scroll="<?php echo esc_attr( $meta['scroll_percent'] ); ?>"
	data-cookie-days="<?php echo esc_attr( $meta['cookie_days'] ); ?>"
	data-animation="<?php echo esc_attr( $meta['animation'] ); ?>"
	data-popup-id="<?php echo esc_attr( $popup->ID ); ?>"
	data-cookie-version="<?php echo esc_attr( $meta['cookie_version'] ); ?>"
	data-time-on-site="<?php echo esc_attr( $meta['time_on_site'] ); ?>"
	data-selector="<?php echo esc_attr( $meta['trigger_selector'] ); ?>"
	data-scroll-element="<?php echo esc_attr( $meta['scroll_element'] ); ?>"
	<?php echo $is_preview ? 'data-preview="1"' : ''; ?>>

	<div id="atx-popup-container" class="<?php echo esc_attr( $container_classes ); ?>" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr( $popup->post_title ); ?>">

		<button id="atx-popup-close" aria-label="<?php esc_attr_e( 'Close popup', 'atx-popup' ); ?>">
			<?php if ( ! empty( $meta['close_icon'] ) ) : ?>
				<img src="<?php echo esc_url( $meta['close_icon'] ); ?>" alt="Close" class="atx-close-icon" />
			<?php else : ?>
				&times;
			<?php endif; ?>
		</button>

		<div id="atx-popup-content">
			<?php
			// Popup content is created by editors — allow form elements + interactive blocks.
			$allowed = wp_kses_allowed_html( 'post' );
			$allowed['form']     = array( 'action' => true, 'method' => true, 'class' => true, 'id' => true, 'style' => true, 'aria-label' => true );
			$allowed['input']    = array( 'type' => true, 'name' => true, 'value' => true, 'placeholder' => true, 'required' => true, 'class' => true, 'id' => true, 'style' => true, 'aria-label' => true );
			$allowed['textarea'] = array( 'name' => true, 'placeholder' => true, 'rows' => true, 'cols' => true, 'class' => true, 'id' => true, 'style' => true, 'aria-label' => true );
			$allowed['select']   = array( 'name' => true, 'class' => true, 'id' => true, 'style' => true, 'aria-label' => true );
			$allowed['option']   = array( 'value' => true, 'selected' => true );
			$allowed['button']   = array( 'type' => true, 'class' => true, 'id' => true, 'style' => true, 'aria-label' => true, 'data-index' => true, 'aria-roledescription' => true, 'role' => true );
			$allowed['video']    = array( 'src' => true, 'autoplay' => true, 'muted' => true, 'loop' => true, 'playsinline' => true, 'class' => true, 'style' => true, 'preload' => true, 'aria-hidden' => true );
			// Allow data-* and aria-* on divs and spans
			$allowed['div']['data-index'] = true;
			$allowed['div']['data-autoplay'] = true;
			$allowed['div']['data-interval'] = true;
			$allowed['div']['data-transition'] = true;
			$allowed['div']['data-arrows'] = true;
			$allowed['div']['data-dots'] = true;
			$allowed['div']['role'] = true;
			$allowed['div']['aria-roledescription'] = true;
			$allowed['div']['aria-label'] = true;
			$allowed['div']['aria-hidden'] = true;
			$allowed['div']['aria-live'] = true;
			$allowed['span']['aria-hidden'] = true;
			$allowed['span']['role'] = true;
			$allowed['blockquote'] = array( 'class' => true, 'style' => true, 'cite' => true );
			echo wp_kses( $content, $allowed );
			?>
		</div>
	</div>
</div>
