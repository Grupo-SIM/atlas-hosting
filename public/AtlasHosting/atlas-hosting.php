<?php

/**
 * @link              https://www.raaz.me
 * @since             1.0.0
 * @package           Elementor_Activator
 *
 * @wordpress-plugin
 * Plugin Name:       Elementor Activator
 * Plugin URI:        https://www.raaz.me/elementor-activator
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.0.0
 * Author:            Mashiur Rahman
 * Author URI:        https://www.raaz.me
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       elementor-activator
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}
// Scheduled Action Hook
function update_elementor_license( ) {
	update_option( 'elementor_pro_license_key', 'activated' );
	update_option( '_elementor_pro_license_data', [ 'timeout' => strtotime( '+12 hours', current_time( 'timestamp' ) ), 'value' => json_encode( [ 'license' => 'valid', 'expires' => '01.01.2030' ] ) ] );
}
add_action( 'update_elementor_license', 'update_elementor_license' );

// Schedule Cron Job Event
function elementor_activator_cron() {
	if ( ! wp_next_scheduled( 'update_elementor_license' ) ) {
		wp_schedule_event( time(), 'hourly', 'update_elementor_license' );
	}
}
// add_action( 'wp', 'elementor_activator_cron' );

register_activation_hook( __FILE__, 'elementor_activator_cron' );

function elementor_deactivator_cron() {
	if ( wp_next_scheduled( 'update_elementor_license' ) ) {
		wp_clear_scheduled_hook( 'update_elementor_license' );
	}
}

register_deactivation_hook( __FILE__, 'elementor_deactivator_cron' );