<?php
/**
 * Plugin Name:       Quotelinks Investing Calculators
 * Plugin URI:        https://www.quotelinks.com/calculators/
 * Description:       22 free investing calculators in one block: compound interest, dividends, inflation, stock returns, portfolio backtest, bond yield and more.
 * Version:           1.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Quotelinks
 * Author URI:        https://www.quotelinks.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       quotelinks-investing-calculators
 *
 * @package QuotelinksInvestingCalculators
 */

defined( 'ABSPATH' ) || exit;

define( 'QLIC_VERSION', '1.0.0' );

/*
 * Edition: "wporg" (WordPress.org directory: the credit line is shown only after the site owner
 * opts in) or "direct" (download from quotelinks.com: the credit line is on unless switched off).
 * Set by build_plugin.py.
 */
define( 'QLIC_EDITION', 'wporg' );

/** Where the calculators are served from. */
define( 'QLIC_SITE', 'https://www.quotelinks.com' );

/**
 * Calculator list (generated from the calculators build; see tools/gen_calc_meta.py).
 *
 * @return array<string, array> Calculators keyed by slug, in hub order.
 */
function qlic_calculators() {
	static $calcs = null;
	if ( null === $calcs ) {
		$calcs = array();
		$data  = wp_json_file_decode( __DIR__ . '/block/calculators.json', array( 'associative' => true ) );
		if ( is_array( $data ) && ! empty( $data['calculators'] ) ) {
			foreach ( $data['calculators'] as $calc ) {
				$calcs[ $calc['slug'] ] = $calc;
			}
		}
	}
	return $calcs;
}

/**
 * Registers the block and passes the calculator list to the editor script.
 */
function qlic_register_block() {
	$block = register_block_type( __DIR__ . '/block' );
	if ( ! $block ) {
		return;
	}
	$GLOBALS['qlic_view_handle'] = ! empty( $block->view_script_handles ) ? $block->view_script_handles[0] : '';
	if ( empty( $block->editor_script_handles ) ) {
		return;
	}
	$calcs = array();
	foreach ( qlic_calculators() as $calc ) {
		$calcs[] = $calc;
	}
	wp_add_inline_script(
		$block->editor_script_handles[0],
		'window.qlicData = ' . wp_json_encode(
			array(
				'edition'     => QLIC_EDITION,
				'site'        => QLIC_SITE,
				'calculators' => $calcs,
			)
		) . ';',
		'before'
	);
	wp_set_script_translations( $block->editor_script_handles[0], 'quotelinks-investing-calculators' );
}
add_action( 'init', 'qlic_register_block' );

/**
 * Cleans the starting values for one calculator. Mirrors the rules of the embed-code
 * generator on quotelinks.com: unknown keys are dropped, every value is checked by type.
 *
 * @param array $calc   Calculator definition.
 * @param mixed $values Raw values keyed by URL parameter.
 * @return array<string, string> Clean values.
 */
function qlic_clean_params( $calc, $values ) {
	$out = array();
	if ( ! is_array( $values ) ) {
		return $out;
	}
	foreach ( $calc['params'] as $p ) {
		if ( ! isset( $values[ $p['k'] ] ) || is_array( $values[ $p['k'] ] ) ) {
			continue;
		}
		$raw = trim( (string) $values[ $p['k'] ] );
		if ( '' === $raw ) {
			continue;
		}
		switch ( $p['t'] ) {
			case 'sym':
				$v = strtoupper( $raw );
				if ( preg_match( '/^[A-Z][A-Z0-9.\-]{0,9}$/', $v ) ) {
					$out[ $p['k'] ] = $v;
				}
				break;
			case 'pf':
				$v = strtoupper( str_replace( ' ', '', $raw ) );
				if ( preg_match( '/^[A-Z0-9.\-]{1,10}:[\d.]+(,[A-Z0-9.\-]{1,10}:[\d.]+){0,14}$/', $v ) ) {
					$out[ $p['k'] ] = $v;
				}
				break;
			case 'ym':
				if ( preg_match( '/^\d{4}(-\d{2})?$/', $raw ) ) {
					$out[ $p['k'] ] = $raw;
				}
				break;
			case 'enum':
				foreach ( $p['o'] as $opt ) {
					if ( $opt[0] === $raw ) {
						$out[ $p['k'] ] = $raw;
					}
				}
				break;
			default:
				$v = preg_replace( '/[^\d.\-]/', '', $raw );
				if ( '' !== $v && is_numeric( $v ) ) {
					$out[ $p['k'] ] = $v;
				}
		}
	}
	return $out;
}

/**
 * Builds the calculator HTML (iframe plus the optional credit line). Every value is escaped here.
 *
 * @param array  $atts    Block attributes: calc, layout, theme, currency, autoHeight, credit, params.
 * @param string $wrapper Extra wrapper attributes (already escaped), e.g. from get_block_wrapper_attributes().
 * @return string HTML.
 */
function qlic_render_calculator( $atts, $wrapper = '' ) {
	$calcs = qlic_calculators();
	$slug  = isset( $atts['calc'] ) ? (string) $atts['calc'] : '';
	if ( ! isset( $calcs[ $slug ] ) ) {
		return '';
	}
	$calc   = $calcs[ $slug ];
	$narrow = isset( $atts['layout'] ) && 'narrow' === $atts['layout'];
	$maxw   = $narrow ? 400 : 760;
	$height = $narrow ? (int) $calc['h'][1] : (int) $calc['h'][0];

	$query = array();
	$theme = isset( $atts['theme'] ) ? (string) $atts['theme'] : 'light';
	if ( in_array( $theme, array( 'dark', 'auto' ), true ) ) {
		$query['theme'] = $theme;
	}
	$currency = isset( $atts['currency'] ) ? strtoupper( (string) $atts['currency'] ) : 'USD';
	if ( 'USD' !== $currency && preg_match( '/^[A-Z]{3}$/', $currency ) ) {
		$query['currency'] = $currency;
	}
	$query = array_merge( $query, qlic_clean_params( $calc, isset( $atts['params'] ) ? $atts['params'] : array() ) );

	$src = QLIC_SITE . '/calculators/embed/' . $slug . '.html';
	if ( $query ) {
		$src .= '?' . http_build_query( $query, '', '&', PHP_QUERY_RFC3986 );
	}
	$credit = isset( $atts['credit'] ) ? (string) $atts['credit'] : '';
	$show   = 'yes' === $credit || ( 'direct' === QLIC_EDITION && 'no' !== $credit );
	$auto   = ! isset( $atts['autoHeight'] ) || false !== $atts['autoHeight'];

	$html  = '<div ' . $wrapper . '>';
	$html .= sprintf(
		'<iframe class="qlic-frame" src="%1$s" title="%2$s" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"%3$s style="max-width:%4$dpx;height:%5$dpx"></iframe>',
		esc_url( $src ),
		esc_attr( $calc['label'] ),
		$auto ? ' data-qlic-auto="1"' : '',
		$maxw,
		$height
	);
	if ( $show ) {
		$html .= sprintf(
			'<p class="qlic-credit" style="max-width:%1$dpx"><a href="%2$s">%3$s</a> by <a href="%4$s">Quotelinks</a></p>',
			$maxw,
			esc_url( QLIC_SITE . '/calculators/' . $slug . '.html' ),
			esc_html( $calc['label'] ),
			esc_url( QLIC_SITE . '/' )
		);
	}
	$html .= '</div>';
	return $html;
}

/* Shortcode for the classic editor and page builders (direct-download edition only). */
if ( file_exists( __DIR__ . '/includes/shortcode.php' ) ) {
	require_once __DIR__ . '/includes/shortcode.php';
}
