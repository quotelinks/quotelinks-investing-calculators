<?php
/**
 * Server-side render of the Quotelinks Investing Calculator block.
 *
 * @package QuotelinksInvestingCalculators
 *
 * @var array $attributes Block attributes.
 */

defined( 'ABSPATH' ) || exit;

// qlic_render_calculator() escapes every value it outputs; get_block_wrapper_attributes() is escaped by core.
echo qlic_render_calculator( $attributes, get_block_wrapper_attributes() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
