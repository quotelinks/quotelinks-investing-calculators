/**
 * Quotelinks Investing Calculators: auto-height for calculator frames on the front end.
 * Each calculator posts {type: "ql-calc-height", h} to its parent page; this sets the height of
 * the frame that sent it. Only frames added by this plugin with auto-height on are resized.
 */
( function () {
	'use strict';
	if ( window.qlicResize ) {
		return;
	}
	window.qlicResize = true;
	var ORIGINS = { 'https://www.quotelinks.com': true, 'https://quotelinks.com': true };
	window.addEventListener( 'message', function ( e ) {
		var d = e.data;
		if ( ! ORIGINS[ e.origin ] || ! d || d.type !== 'ql-calc-height' ) {
			return;
		}
		var h = Math.round( Number( d.h ) );
		if ( ! ( h > 100 && h < 5000 ) ) {
			return;
		}
		var frames = document.querySelectorAll( 'iframe.qlic-frame[data-qlic-auto]' );
		for ( var i = 0; i < frames.length; i++ ) {
			if ( frames[ i ].contentWindow === e.source ) {
				frames[ i ].style.height = h + 'px';
				break;
			}
		}
	} );
} )();
