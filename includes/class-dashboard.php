<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ATX_Popup_Dashboard {

	public static function init() {
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'register_widget' ) );
	}

	public static function register_widget() {
		wp_add_dashboard_widget(
			'atx_popup_stats',
			__( 'Popup Performance', 'atx-popup' ),
			array( __CLASS__, 'render_widget' )
		);
	}

	public static function render_widget() {
		$popups = get_posts( array(
			'post_type'      => 'atx_popup',
			'post_status'    => 'any',
			'posts_per_page' => -1,
		) );

		if ( empty( $popups ) ) {
			echo '<p>' . esc_html__( 'No popups created yet.', 'atx-popup' ) . '</p>';
			return;
		}

		$total_impressions = 0;
		$total_closes      = 0;
		$best_popup        = null;
		$best_impressions  = 0;
		$popup_data        = array();

		foreach ( $popups as $popup ) {
			$impressions = (int) get_post_meta( $popup->ID, '_atx_popup_stat_impression', true );
			$closes      = (int) get_post_meta( $popup->ID, '_atx_popup_stat_close', true );
			$is_active   = get_post_meta( $popup->ID, '_atx_popup_active', true ) === '1';

			$total_impressions += $impressions;
			$total_closes      += $closes;

			if ( $impressions > $best_impressions ) {
				$best_impressions = $impressions;
				$best_popup       = $popup;
			}

			$popup_data[] = array(
				'id'          => $popup->ID,
				'title'       => $popup->post_title ?: __( '(no title)', 'atx-popup' ),
				'impressions' => $impressions,
				'closes'      => $closes,
				'active'      => $is_active,
				'edit_url'    => get_edit_post_link( $popup->ID, 'raw' ),
			);
		}

		$close_rate = $total_impressions > 0
			? round( ( $total_closes / $total_impressions ) * 100, 1 )
			: 0;

		$engagement_rate = $total_impressions > 0
			? round( ( ( $total_impressions - $total_closes ) / $total_impressions ) * 100, 1 )
			: 0;

		?>
		<style>
			.atx-dash-stats {
				display: flex;
				gap: 12px;
				margin-bottom: 16px;
			}
			.atx-dash-stat {
				flex: 1;
				background: #f6f7f7;
				border-radius: 6px;
				padding: 12px;
				text-align: center;
			}
			.atx-dash-stat-number {
				font-size: 24px;
				font-weight: 700;
				line-height: 1.2;
				color: #1d2327;
			}
			.atx-dash-stat-label {
				font-size: 11px;
				color: #646970;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				margin-top: 4px;
			}
			.atx-dash-stat.atx-dash-highlight {
				background: #f0f6fc;
				border: 1px solid #c3d4e6;
			}
			.atx-dash-table {
				width: 100%;
				border-collapse: collapse;
				font-size: 13px;
			}
			.atx-dash-table th {
				text-align: left;
				padding: 8px 6px;
				border-bottom: 1px solid #dcdcde;
				font-weight: 600;
				color: #1d2327;
			}
			.atx-dash-table td {
				padding: 8px 6px;
				border-bottom: 1px solid #f0f0f0;
				vertical-align: middle;
			}
			.atx-dash-table tr:last-child td {
				border-bottom: none;
			}
			.atx-dash-active {
				display: inline-block;
				width: 8px;
				height: 8px;
				border-radius: 50%;
				margin-right: 6px;
			}
			.atx-dash-active.is-active { background: #00a32a; }
			.atx-dash-active.is-inactive { background: #dcdcde; }
			.atx-dash-best {
				margin-top: 12px;
				padding: 10px 12px;
				background: #fcf9e8;
				border: 1px solid #e3d18a;
				border-radius: 6px;
				font-size: 13px;
			}
			.atx-dash-best strong { color: #1d2327; }
		</style>

		<div class="atx-dash-stats">
			<div class="atx-dash-stat">
				<div class="atx-dash-stat-number"><?php echo number_format_i18n( $total_impressions ); ?></div>
				<div class="atx-dash-stat-label"><?php esc_html_e( 'Impressions', 'atx-popup' ); ?></div>
			</div>
			<div class="atx-dash-stat">
				<div class="atx-dash-stat-number"><?php echo number_format_i18n( $total_closes ); ?></div>
				<div class="atx-dash-stat-label"><?php esc_html_e( 'Closes', 'atx-popup' ); ?></div>
			</div>
			<div class="atx-dash-stat atx-dash-highlight">
				<div class="atx-dash-stat-number"><?php echo esc_html( $engagement_rate ); ?>%</div>
				<div class="atx-dash-stat-label"><?php esc_html_e( 'Engagement', 'atx-popup' ); ?></div>
			</div>
			<div class="atx-dash-stat">
				<div class="atx-dash-stat-number"><?php echo esc_html( $close_rate ); ?>%</div>
				<div class="atx-dash-stat-label"><?php esc_html_e( 'Close Rate', 'atx-popup' ); ?></div>
			</div>
		</div>

		<?php if ( $best_popup ) : ?>
			<div class="atx-dash-best">
				<?php esc_html_e( 'Top performer:', 'atx-popup' ); ?>
				<strong>
					<a href="<?php echo esc_url( get_edit_post_link( $best_popup->ID, 'raw' ) ); ?>">
						<?php echo esc_html( $best_popup->post_title ?: __( '(no title)', 'atx-popup' ) ); ?>
					</a>
				</strong>
				&mdash; <?php echo number_format_i18n( $best_impressions ); ?> <?php esc_html_e( 'impressions', 'atx-popup' ); ?>
			</div>
		<?php endif; ?>

		<?php if ( count( $popup_data ) > 1 ) : ?>
			<table class="atx-dash-table" style="margin-top: 16px;">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Popup', 'atx-popup' ); ?>ssss</th>
						<th><?php esc_html_e( 'Views', 'atx-popup' ); ?></th>
						<th><?php esc_html_e( 'Closes', 'atx-popup' ); ?></th>
						<th><?php esc_html_e( 'Rate', 'atx-popup' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $popup_data as $pd ) :
						$rate = $pd['impressions'] > 0
							? round( ( ( $pd['impressions'] - $pd['closes'] ) / $pd['impressions'] ) * 100, 1 )
							: 0;
					?>
						<tr>
							<td>
								<span class="atx-dash-active <?php echo $pd['active'] ? 'is-active' : 'is-inactive'; ?>"></span>
								<a href="<?php echo esc_url( $pd['edit_url'] ); ?>"><?php echo esc_html( $pd['title'] ); ?></a>
							</td>
							<td><?php echo number_format_i18n( $pd['impressions'] ); ?></td>
							<td><?php echo number_format_i18n( $pd['closes'] ); ?></td>
							<td><?php echo esc_html( $rate ); ?>%</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
		<?php
	}
}
