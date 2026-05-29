<?php
/**
 * Admin meta box template.
 *
 * @var WP_Post $post
 * @var array   $meta
 * @var string  $preview_url
 * @var array   $target_ids
 * @var array   $target_posts
 * @var array   $animations
 * @var array   $easings
 * @var array   $triggers
 * @var array   $size_props
 * @var array   $devices
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="atx-popup-meta-box">

	<!-- Preview + Reset -->
	<div class="atx-preview-bar">
		<a href="<?php echo esc_url( $preview_url ); ?>" target="_blank" class="atx-preview-link" title="<?php esc_attr_e( 'Preview this popup', 'atx-popup' ); ?>">
			<span class="dashicons dashicons-visibility"></span>
		</a>
		<code class="atx-preview-code">?atx_preview=<?php echo intval( $post->ID ); ?></code>
		<button type="button" class="atx-reset-cookies-btn" data-post-id="<?php echo intval( $post->ID ); ?>" data-nonce="<?php echo esc_attr( wp_create_nonce( 'atx_reset_cookies' ) ); ?>" title="<?php esc_attr_e( 'Show popup again to all visitors who dismissed it', 'atx-popup' ); ?>">
			<span class="dashicons dashicons-update"></span>
		</button>
	</div>

	<!-- Quick Device Toggle -->
	<div class="atx-quick-device-toggle">
		<button type="button" class="atx-device-btn is-active" data-device="desktop" title="<?php esc_attr_e( 'Desktop', 'atx-popup' ); ?>">
			<span class="dashicons dashicons-desktop"></span>
		</button>
		<button type="button" class="atx-device-btn" data-device="tablet" title="<?php esc_attr_e( 'Tablet', 'atx-popup' ); ?>">
			<span class="dashicons dashicons-tablet"></span>
		</button>
		<button type="button" class="atx-device-btn" data-device="mobile" title="<?php esc_attr_e( 'Mobile', 'atx-popup' ); ?>">
			<span class="dashicons dashicons-smartphone"></span>
		</button>
	</div>

	<hr />

	<!-- Active Toggle -->
	<div class="atx-popup-field">
		<label>
			<input type="checkbox" name="atx_popup_active" value="1" <?php checked( $meta['active'], '1' ); ?> />
			<?php esc_html_e( 'Active (show this popup)', 'atx-popup' ); ?>
		</label>
		<p class="description"><?php esc_html_e( 'Only one popup can be active at a time.', 'atx-popup' ); ?></p>
	</div>

	<hr />

	<!-- Overlay Color -->
	<div class="atx-popup-field">
		<label for="atx_popup_overlay_color"><?php esc_html_e( 'Overlay Color', 'atx-popup' ); ?></label>
		<input
			type="text"
			id="atx_popup_overlay_color"
			name="atx_popup_overlay_color"
			value="<?php echo esc_attr( $meta['overlay_color'] ); ?>"
			class="atx-color-picker"
			data-alpha-enabled="true"
			data-default-color="rgba(0,0,0,0.6)" />
	</div>

	<!-- Animation (collapsible) -->
	<div class="atx-collapsible">
		<div class="atx-collapsible-toggle" role="button" tabindex="0">
			<span class="dashicons dashicons-arrow-right-alt2 atx-collapsible-arrow"></span>
			<?php esc_html_e( 'Animation', 'atx-popup' ); ?>
		</div>
		<div class="atx-collapsible-content" hidden>

			<div class="atx-popup-field">
				<label for="atx_popup_animation"><?php esc_html_e( 'Style', 'atx-popup' ); ?></label>
				<select id="atx_popup_animation" name="atx_popup_animation">
					<?php foreach ( $animations as $value => $label ) : ?>
						<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $meta['animation'], $value ); ?>>
							<?php echo esc_html( __( $label, 'atx-popup' ) ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</div>

			<div class="atx-anim-grid">
				<div>
					<label for="atx_popup_anim_duration"><?php esc_html_e( 'Duration (ms)', 'atx-popup' ); ?></label>
					<input type="number" id="atx_popup_anim_duration" name="atx_popup_anim_duration"
						value="<?php echo esc_attr( $meta['anim_duration'] ); ?>" min="0" max="3000" step="50" />
				</div>
				<div>
					<label for="atx_popup_anim_easing"><?php esc_html_e( 'Easing', 'atx-popup' ); ?></label>
					<select id="atx_popup_anim_easing" name="atx_popup_anim_easing">
						<?php foreach ( $easings as $value => $label ) : ?>
							<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $meta['anim_easing'], $value ); ?>>
								<?php echo esc_html( __( $label, 'atx-popup' ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</div>
			</div>

			<!-- Reverse on close -->
			<div class="atx-popup-field">
				<label>
					<input type="checkbox" name="atx_popup_anim_reverse" value="1" <?php checked( $meta['anim_reverse'], '1' ); ?> />
					<?php esc_html_e( 'Reverse animation on close', 'atx-popup' ); ?>
				</label>
			</div>

			<!-- Contextual animation params -->
			<div class="atx-anim-param" data-anim-for="slide-up slide-down slide-left slide-right" <?php
				echo in_array( $meta['animation'], array( 'slide-up', 'slide-down', 'slide-left', 'slide-right' ) ) ? '' : 'hidden';
			?>>
				<label for="atx_popup_anim_distance"><?php esc_html_e( 'Distance (vh/vw)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_anim_distance" name="atx_popup_anim_distance"
					value="<?php echo esc_attr( $meta['anim_distance'] ); ?>" min="10" max="200" step="5" />
				<p class="description"><?php esc_html_e( '100 = full viewport', 'atx-popup' ); ?></p>
			</div>

			<div class="atx-anim-param" data-anim-for="zoom-in zoom-out bounce-in" <?php
				echo in_array( $meta['animation'], array( 'zoom-in', 'zoom-out', 'bounce-in' ) ) ? '' : 'hidden';
			?>>
				<label for="atx_popup_anim_scale"><?php esc_html_e( 'Start Scale (%)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_anim_scale" name="atx_popup_anim_scale"
					value="<?php echo esc_attr( $meta['anim_scale'] ); ?>" min="0" max="300" step="5" />
				<p class="description"><?php esc_html_e( '100 = no change. Below 100 = smaller. Above 100 = bigger.', 'atx-popup' ); ?></p>
			</div>

			<div class="atx-anim-param" data-anim-for="flip-x flip-y rotate-in" <?php
				echo in_array( $meta['animation'], array( 'flip-x', 'flip-y', 'rotate-in' ) ) ? '' : 'hidden';
			?>>
				<label for="atx_popup_anim_degrees"><?php esc_html_e( 'Rotation (degrees)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_anim_degrees" name="atx_popup_anim_degrees"
					value="<?php echo esc_attr( $meta['anim_degrees'] ); ?>" min="0" max="360" step="5" />
			</div>

		</div>
	</div>

	<!-- Close Button (collapsible) -->
	<div class="atx-collapsible">
		<div class="atx-collapsible-toggle" role="button" tabindex="0">
			<span class="dashicons dashicons-arrow-right-alt2 atx-collapsible-arrow"></span>
			<?php esc_html_e( 'Close Button', 'atx-popup' ); ?>
		</div>
		<div class="atx-collapsible-content" hidden>

			<div class="atx-popup-field">
				<label>
					<input type="checkbox" name="atx_popup_close_fixed" value="1" <?php checked( $meta['close_fixed'], '1' ); ?> />
					<?php esc_html_e( 'Fixed (sticky on scroll)', 'atx-popup' ); ?>
				</label>
			</div>

			<div class="atx-popup-field">
				<label><?php esc_html_e( 'Background', 'atx-popup' ); ?></label>
				<input type="text" name="atx_popup_close_bg" value="<?php echo esc_attr( $meta['close_bg'] ); ?>"
					class="atx-color-picker" data-alpha-enabled="true" data-default-color="rgba(255,255,255,0.85)" />
			</div>

			<div class="atx-popup-field">
				<label><?php esc_html_e( 'Icon Color', 'atx-popup' ); ?></label>
				<input type="text" name="atx_popup_close_color" value="<?php echo esc_attr( $meta['close_color'] ); ?>"
					class="atx-color-picker" data-default-color="#333333" />
			</div>

			<div class="atx-popup-field">
				<label><?php esc_html_e( 'Hover Background', 'atx-popup' ); ?></label>
				<input type="text" name="atx_popup_close_hover_bg" value="<?php echo esc_attr( $meta['close_hover_bg'] ); ?>"
					class="atx-color-picker" data-alpha-enabled="true" data-default-color="rgba(255,255,255,1)" />
			</div>

			<div class="atx-popup-field">
				<label><?php esc_html_e( 'Hover Icon Color', 'atx-popup' ); ?></label>
				<input type="text" name="atx_popup_close_hover_color" value="<?php echo esc_attr( $meta['close_hover_color'] ); ?>"
					class="atx-color-picker" data-default-color="#000000" />
			</div>

			<div class="atx-close-grid">
				<div>
					<label><?php esc_html_e( 'Size (px)', 'atx-popup' ); ?></label>
					<input type="number" name="atx_popup_close_size" value="<?php echo esc_attr( $meta['close_size'] ); ?>" min="16" max="80" step="1" />
				</div>
				<div>
					<label><?php esc_html_e( 'Icon Size (px)', 'atx-popup' ); ?></label>
					<input type="number" name="atx_popup_close_icon_size" value="<?php echo esc_attr( $meta['close_icon_size'] ); ?>" min="8" max="60" step="1" />
				</div>
				<div>
					<label><?php esc_html_e( 'Radius (%)', 'atx-popup' ); ?></label>
					<input type="number" name="atx_popup_close_radius" value="<?php echo esc_attr( $meta['close_radius'] ); ?>" min="0" max="50" step="1" />
				</div>
				<div>
					<label><?php esc_html_e( 'Top (px)', 'atx-popup' ); ?></label>
					<input type="number" name="atx_popup_close_top" value="<?php echo esc_attr( $meta['close_top'] ); ?>" min="0" max="100" step="1" />
				</div>
				<div>
					<label><?php esc_html_e( 'Right (px)', 'atx-popup' ); ?></label>
					<input type="number" name="atx_popup_close_right" value="<?php echo esc_attr( $meta['close_right'] ); ?>" min="0" max="100" step="1" />
				</div>
			</div>

			<div class="atx-popup-field">
				<label><?php esc_html_e( 'Custom Icon', 'atx-popup' ); ?></label>
				<div class="atx-close-icon-wrap">
					<?php if ( $meta['close_icon'] ) : ?>
						<img src="<?php echo esc_url( $meta['close_icon'] ); ?>" class="atx-close-icon-preview" />
					<?php endif; ?>
					<input type="hidden" name="atx_popup_close_icon" id="atx_popup_close_icon" value="<?php echo esc_attr( $meta['close_icon'] ); ?>" />
					<button type="button" class="button atx-close-icon-upload"><?php esc_html_e( 'Choose Icon', 'atx-popup' ); ?></button>
					<button type="button" class="button atx-close-icon-remove" <?php echo $meta['close_icon'] ? '' : 'hidden'; ?>><?php esc_html_e( 'Remove', 'atx-popup' ); ?></button>
				</div>
				<p class="description"><?php esc_html_e( 'Upload an SVG or image. Leave empty for default x.', 'atx-popup' ); ?></p>
			</div>

		</div>
	</div>

	<!-- Sizing (collapsible) -->
	<div class="atx-collapsible">
		<div class="atx-collapsible-toggle" role="button" tabindex="0">
			<span class="dashicons dashicons-arrow-right-alt2 atx-collapsible-arrow"></span>
			<?php esc_html_e( 'Sizing', 'atx-popup' ); ?>
		</div>
		<div class="atx-collapsible-content" hidden>

			<div class="atx-device-toggle">
				<button type="button" class="atx-device-btn is-active" data-device="desktop" title="Desktop">
					<span class="dashicons dashicons-desktop"></span>
				</button>
				<button type="button" class="atx-device-btn" data-device="tablet" title="Tablet">
					<span class="dashicons dashicons-tablet"></span>
				</button>
				<button type="button" class="atx-device-btn" data-device="mobile" title="Mobile">
					<span class="dashicons dashicons-smartphone"></span>
				</button>
			</div>

			<?php foreach ( $devices as $device ) : ?>
				<div class="atx-device-panel" data-device="<?php echo esc_attr( $device ); ?>" <?php echo 'desktop' !== $device ? 'hidden' : ''; ?>>
					<?php foreach ( $size_props as $prop_key => $prop_info ) :
						$field_key       = $prop_key . '_' . $device;
						$val             = $meta[ $field_key . '_val' ];
						$unit            = $meta[ $field_key . '_unit' ];
						$available_units = $prop_info['units'];
					?>
						<div class="atx-size-row">
							<span class="atx-size-label"><?php echo esc_html( $prop_info['label'] ); ?></span>
							<div class="atx-size-controls">
								<input
									type="number"
									name="atx_popup_<?php echo esc_attr( $field_key ); ?>_val"
									class="atx-size-input"
									data-device="<?php echo esc_attr( $device ); ?>"
									data-prop="<?php echo esc_attr( str_replace( '_', '-', $prop_key ) ); ?>"
									value="<?php echo esc_attr( $val ); ?>"
									placeholder="&mdash;"
									min="0"
									step="1" />
								<div class="atx-unit-toggle">
									<?php foreach ( $available_units as $u ) : ?>
										<button
											type="button"
											class="atx-unit-btn<?php echo $unit === $u ? ' is-active' : ''; ?>"
											data-unit="<?php echo esc_attr( $u ); ?>"><?php echo esc_html( $u ); ?></button>
									<?php endforeach; ?>
								</div>
								<input
									type="hidden"
									name="atx_popup_<?php echo esc_attr( $field_key ); ?>_unit"
									class="atx-unit-value"
									value="<?php echo esc_attr( $unit ); ?>" />
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			<?php endforeach; ?>

		</div>
	</div>

	<!-- Display Options (collapsible) -->
	<div class="atx-collapsible">
		<div class="atx-collapsible-toggle" role="button" tabindex="0">
			<span class="dashicons dashicons-arrow-right-alt2 atx-collapsible-arrow"></span>
			<?php esc_html_e( 'Display Options', 'atx-popup' ); ?>
		</div>
		<div class="atx-collapsible-content" hidden>

			<div class="atx-popup-field">
				<label for="atx_popup_trigger"><?php esc_html_e( 'Trigger', 'atx-popup' ); ?></label>
				<select id="atx_popup_trigger" name="atx_popup_trigger">
					<?php foreach ( $triggers as $value => $label ) : ?>
						<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $meta['trigger'], $value ); ?>>
							<?php echo esc_html( __( $label, 'atx-popup' ) ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</div>

			<div class="atx-popup-field atx-popup-trigger-field" data-trigger="load">
				<label for="atx_popup_trigger_delay"><?php esc_html_e( 'Delay (seconds)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_trigger_delay" name="atx_popup_trigger_delay"
					value="<?php echo esc_attr( $meta['trigger_delay'] ); ?>" min="0" max="60" step="1" />
			</div>

			<div class="atx-popup-field atx-popup-trigger-field" data-trigger="scroll">
				<label for="atx_popup_scroll_percent"><?php esc_html_e( 'Scroll Percentage (%)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_scroll_percent" name="atx_popup_scroll_percent"
					value="<?php echo esc_attr( $meta['scroll_percent'] ); ?>" min="1" max="100" step="1" />
			</div>

			<div class="atx-popup-field atx-popup-trigger-field" data-trigger="time-on-site" <?php echo 'time-on-site' !== $meta['trigger'] ? 'style="display:none"' : ''; ?>>
				<label for="atx_popup_time_on_site"><?php esc_html_e( 'Time on site (seconds)', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_time_on_site" name="atx_popup_time_on_site" value="<?php echo esc_attr( $meta['time_on_site'] ); ?>" min="1" max="600" step="1" class="small-text" />
			</div>

			<div class="atx-popup-trigger-field" data-trigger="scroll-to-element" <?php echo 'scroll-to-element' !== $meta['trigger'] ? 'style="display:none"' : ''; ?>>
				<label for="atx_popup_scroll_element"><?php esc_html_e( 'Element CSS selector', 'atx-popup' ); ?></label>
				<input type="text" id="atx_popup_scroll_element" name="atx_popup_scroll_element" value="<?php echo esc_attr( $meta['scroll_element'] ); ?>" class="regular-text" placeholder="#my-section, .my-class" />
				<p class="description"><?php esc_html_e( 'Popup appears when this element scrolls into view.', 'atx-popup' ); ?></p>
			</div>

			<div class="atx-popup-field">
				<label for="atx_popup_cookie_days"><?php esc_html_e( 'Hide for (days) after close', 'atx-popup' ); ?></label>
				<input type="number" id="atx_popup_cookie_days" name="atx_popup_cookie_days"
					value="<?php echo esc_attr( $meta['cookie_days'] ); ?>" min="0" max="365" step="1" />
				<p class="description"><?php esc_html_e( '0 = session only.', 'atx-popup' ); ?></p>
			</div>

			<div class="atx-popup-field">
				<label for="atx_popup_targeting"><?php esc_html_e( 'Show On', 'atx-popup' ); ?></label>
				<select id="atx_popup_targeting" name="atx_popup_targeting">
					<option value="all" <?php selected( $meta['targeting'], 'all' ); ?>><?php esc_html_e( 'All Pages', 'atx-popup' ); ?></option>
					<option value="specific" <?php selected( $meta['targeting'], 'specific' ); ?>><?php esc_html_e( 'Specific Pages', 'atx-popup' ); ?></option>
				</select>
			</div>

			<div class="atx-popup-field atx-popup-targeting-list" <?php echo 'specific' !== $meta['targeting'] ? 'hidden' : ''; ?>>
				<?php foreach ( $target_posts as $pt => $items ) :
					$pt_object = get_post_type_object( $pt );
				?>
					<strong><?php echo esc_html( $pt_object->labels->name ); ?></strong>
					<div class="atx-popup-checklist">
						<?php foreach ( $items as $item ) :
							$checked = in_array( (string) $item->ID, $target_ids, true ) ? 'checked' : '';
						?>
							<label><input type="checkbox" name="atx_popup_target_ids[]" value="<?php echo esc_attr( $item->ID ); ?>" <?php echo $checked; ?> /> <?php echo esc_html( $item->post_title ); ?></label>
						<?php endforeach; ?>
					</div>
				<?php endforeach; ?>
			</div>

		</div>
	</div>

	<!-- Open by Element (collapsible) -->
	<div class="atx-collapsible">
		<div class="atx-collapsible-toggle" role="button" tabindex="0">
			<span class="dashicons dashicons-arrow-right-alt2 atx-collapsible-arrow"></span>
			<?php esc_html_e( 'Open by Element', 'atx-popup' ); ?>
		</div>
		<div class="atx-collapsible-content" hidden>

			<div class="atx-popup-field">
				<label for="atx_popup_trigger_selector"><?php esc_html_e( 'Click Selector', 'atx-popup' ); ?></label>
				<textarea id="atx_popup_trigger_selector" name="atx_popup_trigger_selector"
					rows="3"
					placeholder="#btn-one, #btn-two, .open-popup"><?php echo esc_textarea( $meta['trigger_selector'] ); ?></textarea>
				<p class="description"><?php esc_html_e( 'Clicking these elements opens the popup. Comma-separate multiple IDs/classes.', 'atx-popup' ); ?></p>
			</div>

			<p class="description atx-element-only-note">
				<?php esc_html_e( 'Works alongside any trigger. Set trigger to "Element Only" to disable auto-open.', 'atx-popup' ); ?>
			</p>

		</div>
	</div>

	<!-- Hidden mirror to guarantee selector value is submitted -->
	<input type="hidden" name="atx_popup_trigger_selector_mirror" id="atx_popup_trigger_selector_mirror"
		value="<?php echo esc_attr( $meta['trigger_selector'] ); ?>" />

</div>
