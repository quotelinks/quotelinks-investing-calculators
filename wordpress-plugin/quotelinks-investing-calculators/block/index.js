/**
 * Quotelinks Investing Calculator block (editor).
 * Plain ES5 with wp.element.createElement: no build step, this file is the source.
 */
( function ( wp ) {
	'use strict';

	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useRef = wp.element.useRef;
	var useState = wp.element.useState;
	var __ = wp.i18n.__;
	var be = wp.blockEditor;
	var C = wp.components;
	var useSelect = wp.data.useSelect;
	var useDispatch = wp.data.useDispatch;

	var DATA = window.qlicData || { edition: 'wporg', site: 'https://www.quotelinks.com', calculators: [] };
	var SITE = DATA.site;
	var DIRECT = DATA.edition === 'direct';
	var CALCS = {};
	DATA.calculators.forEach( function ( c ) {
		CALCS[ c.slug ] = c;
	} );
	var PREF_SCOPE = 'quotelinks/investing-calculator';
	var ORIGINS = { 'https://www.quotelinks.com': true, 'https://quotelinks.com': true };
	var MAXW = { wide: 760, narrow: 400 };
	var CURRENCIES = [
		[ 'USD', 'US dollar ($)' ], [ 'EUR', 'Euro (€)' ], [ 'GBP', 'British pound (£)' ],
		[ 'CAD', 'Canadian dollar' ], [ 'AUD', 'Australian dollar' ], [ 'NZD', 'New Zealand dollar' ],
		[ 'CHF', 'Swiss franc' ], [ 'INR', 'Indian rupee (₹)' ], [ 'JPY', 'Japanese yen (¥)' ],
		[ 'SGD', 'Singapore dollar' ], [ 'ZAR', 'South African rand' ]
	];

	/* Same checks as qlic_clean_params() in PHP and the embed generator on quotelinks.com. */
	function cleanParams( calc, values ) {
		var out = [];
		values = values || {};
		calc.params.forEach( function ( p ) {
			var raw = values[ p.k ];
			if ( raw === undefined || raw === null ) {
				return;
			}
			raw = String( raw ).trim();
			if ( raw === '' ) {
				return;
			}
			var v;
			if ( p.t === 'sym' ) {
				v = raw.toUpperCase();
				if ( /^[A-Z][A-Z0-9.\-]{0,9}$/.test( v ) ) {
					out.push( [ p.k, v ] );
				}
			} else if ( p.t === 'pf' ) {
				v = raw.replace( / /g, '' ).toUpperCase();
				if ( /^[A-Z0-9.\-]{1,10}:[\d.]+(,[A-Z0-9.\-]{1,10}:[\d.]+){0,14}$/.test( v ) ) {
					out.push( [ p.k, v ] );
				}
			} else if ( p.t === 'ym' ) {
				if ( /^\d{4}(-\d{2})?$/.test( raw ) ) {
					out.push( [ p.k, raw ] );
				}
			} else if ( p.t === 'enum' ) {
				p.o.forEach( function ( o ) {
					if ( o[ 0 ] === raw ) {
						out.push( [ p.k, raw ] );
					}
				} );
			} else {
				v = raw.replace( /[^\d.\-]/g, '' );
				if ( v !== '' && isFinite( Number( v ) ) ) {
					out.push( [ p.k, v ] );
				}
			}
		} );
		return out;
	}

	function frameSrc( calc, a ) {
		var q = [];
		if ( a.theme === 'dark' || a.theme === 'auto' ) {
			q.push( [ 'theme', a.theme ] );
		}
		if ( a.currency && a.currency !== 'USD' ) {
			q.push( [ 'currency', a.currency ] );
		}
		q = q.concat( cleanParams( calc, a.params ) );
		return SITE + '/calculators/embed/' + calc.slug + '.html' + ( q.length ? '?' + q.map( function ( p ) {
			return p[ 0 ] + '=' + encodeURIComponent( p[ 1 ] );
		} ).join( '&' ) : '' );
	}

	function calcIcon( c ) {
		return el( 'svg', { viewBox: '0 0 24 24', width: 24, height: 24, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true },
			el( 'rect', { width: 24, height: 24, rx: 5, fill: c.bg } ),
			el( 'g', { color: '#fff', transform: 'translate(3 3) scale(.75)', dangerouslySetInnerHTML: { __html: c.icon } } )
		);
	}

	var blockIcon = el( 'svg', { viewBox: '0 0 24 24', width: 24, height: 24, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true },
		el( 'rect', { x: 4.5, y: 2.5, width: 15, height: 19, rx: 2, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 } ),
		el( 'rect', { x: 7.5, y: 5.5, width: 9, height: 4, rx: 0.8, fill: 'currentColor' } ),
		el( 'path', { d: 'M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round' } )
	);

	function stop( e ) {
		e.preventDefault();
	}

	function Edit( props ) {
		var a = props.attributes;
		var set = props.setAttributes;
		var calc = CALCS[ a.calc ] || DATA.calculators[ 0 ];
		var frameRef = useRef( null );
		var hState = useState( null );
		var autoH = hState[ 0 ];
		var setAutoH = hState[ 1 ];

		var pref = useSelect( function ( select ) {
			var s = select( 'core/preferences' );
			return s ? s.get( PREF_SCOPE, 'credit' ) : undefined;
		}, [] );
		var prefs = useDispatch( 'core/preferences' );

		/* The site owner already answered the credit question for an earlier calculator. */
		useEffect( function () {
			if ( ! DIRECT && a.credit === '' && ( pref === 'yes' || pref === 'no' ) ) {
				set( { credit: pref } );
			}
		}, [ pref, a.credit ] );

		var src = calc ? frameSrc( calc, a ) : '';

		useEffect( function () {
			setAutoH( null );
			var f = frameRef.current;
			if ( ! f ) {
				return undefined;
			}
			var win = f.ownerDocument.defaultView;
			function onMsg( e ) {
				if ( ! ORIGINS[ e.origin ] || ! e.data || e.data.type !== 'ql-calc-height' || e.source !== f.contentWindow ) {
					return;
				}
				var h = Math.round( Number( e.data.h ) );
				if ( h > 100 && h < 5000 ) {
					setAutoH( h );
				}
			}
			win.addEventListener( 'message', onMsg );
			return function () {
				win.removeEventListener( 'message', onMsg );
			};
		}, [ src ] );

		var blockProps = be.useBlockProps( { className: 'qlic-editor' } );
		if ( ! calc ) {
			return el( 'div', blockProps, __( 'This calculator is not available.', 'quotelinks-investing-calculators' ) );
		}

		function choose( v ) {
			set( { credit: v } );
			if ( ! DIRECT && prefs && prefs.set ) {
				prefs.set( PREF_SCOPE, 'credit', v );
			}
		}
		function setParam( k, v ) {
			var p = Object.assign( {}, a.params );
			if ( v === '' ) {
				delete p[ k ];
			} else {
				p[ k ] = v;
			}
			set( { params: p } );
		}

		var layout = a.layout === 'narrow' ? 'narrow' : 'wide';
		var maxw = MAXW[ layout ];
		var fixedH = layout === 'narrow' ? calc.h[ 1 ] : calc.h[ 0 ];
		var height = a.autoHeight && autoH ? autoH : fixedH;
		var showCredit = a.credit === 'yes' || ( DIRECT && a.credit !== 'no' );
		var ask = ! DIRECT && a.credit === '' && pref !== 'yes' && pref !== 'no';

		var inspector = el( be.InspectorControls, null,
			el( C.PanelBody, { title: __( 'Calculator', 'quotelinks-investing-calculators' ) },
				el( C.SelectControl, {
					label: __( 'Calculator', 'quotelinks-investing-calculators' ),
					value: calc.slug,
					options: DATA.calculators.map( function ( c ) {
						return { label: c.title, value: c.slug };
					} ),
					onChange: function ( v ) {
						set( { calc: v, params: {} } );
					},
					__nextHasNoMarginBottom: true
				} ),
				el( 'p', { className: 'components-base-control__help' }, calc.desc ),
				el( C.SelectControl, {
					label: __( 'Layout', 'quotelinks-investing-calculators' ),
					value: layout,
					options: [
						{ label: __( 'Article width (up to 760 px)', 'quotelinks-investing-calculators' ), value: 'wide' },
						{ label: __( 'Sidebar (up to 400 px)', 'quotelinks-investing-calculators' ), value: 'narrow' }
					],
					onChange: function ( v ) {
						set( { layout: v } );
					},
					__nextHasNoMarginBottom: true
				} ),
				el( C.SelectControl, {
					label: __( 'Theme', 'quotelinks-investing-calculators' ),
					value: a.theme,
					options: [
						{ label: __( 'Light', 'quotelinks-investing-calculators' ), value: 'light' },
						{ label: __( 'Dark', 'quotelinks-investing-calculators' ), value: 'dark' },
						{ label: __( 'Auto (follows the visitor\'s device)', 'quotelinks-investing-calculators' ), value: 'auto' }
					],
					onChange: function ( v ) {
						set( { theme: v } );
					},
					__nextHasNoMarginBottom: true
				} ),
				el( C.SelectControl, {
					label: __( 'Currency', 'quotelinks-investing-calculators' ),
					help: __( 'Changes the currency symbol and number format. Stock prices stay in US dollars.', 'quotelinks-investing-calculators' ),
					value: a.currency,
					options: CURRENCIES.map( function ( c ) {
						return { label: c[ 1 ], value: c[ 0 ] };
					} ),
					onChange: function ( v ) {
						set( { currency: v } );
					},
					__nextHasNoMarginBottom: true
				} ),
				el( C.ToggleControl, {
					label: __( 'Auto-height', 'quotelinks-investing-calculators' ),
					help: __( 'Resizes the frame to fit the calculator. When off, the frame keeps a fixed height.', 'quotelinks-investing-calculators' ),
					checked: !! a.autoHeight,
					onChange: function ( v ) {
						set( { autoHeight: v } );
					},
					__nextHasNoMarginBottom: true
				} ),
				el( 'p', null, el( C.ExternalLink, { href: SITE + '/calculators/' + calc.slug + '.html' },
					__( 'How this calculator works', 'quotelinks-investing-calculators' ) ) )
			),
			el( C.PanelBody, { title: __( 'Starting values', 'quotelinks-investing-calculators' ), initialOpen: false },
				el( 'p', { className: 'components-base-control__help' },
					__( 'Optional. Leave a field empty to use the calculator\'s default. Visitors can change every value.', 'quotelinks-investing-calculators' ) ),
				calc.params.map( function ( p ) {
					var val = a.params && a.params[ p.k ] !== undefined ? String( a.params[ p.k ] ) : '';
					if ( p.t === 'enum' ) {
						return el( C.SelectControl, {
							key: calc.slug + p.k,
							label: p.l,
							value: val,
							options: [ { label: __( 'Default', 'quotelinks-investing-calculators' ), value: '' } ].concat( p.o.map( function ( o ) {
								return { label: o[ 1 ], value: o[ 0 ] };
							} ) ),
							onChange: function ( v ) {
								setParam( p.k, v );
							},
							__nextHasNoMarginBottom: true
						} );
					}
					return el( C.TextControl, {
						key: calc.slug + p.k,
						label: p.l,
						help: p.h,
						value: val,
						placeholder: p.d || '',
						onChange: function ( v ) {
							setParam( p.k, v );
						},
						__nextHasNoMarginBottom: true
					} );
				} )
			),
			el( C.PanelBody, { title: __( 'Credit link', 'quotelinks-investing-calculators' ) },
				el( C.ToggleControl, {
					label: __( 'Show the "by Quotelinks" credit link', 'quotelinks-investing-calculators' ),
					help: DIRECT ?
						__( 'A small link under the calculator to its page on quotelinks.com. Keeping it on helps keep these calculators free.', 'quotelinks-investing-calculators' ) :
						__( 'Adds a small link under the calculator to its page on quotelinks.com. It is only shown if you turn it on.', 'quotelinks-investing-calculators' ),
					checked: showCredit,
					onChange: function ( v ) {
						choose( v ? 'yes' : 'no' );
					},
					__nextHasNoMarginBottom: true
				} )
			)
		);

		var askBox = ask ? el( 'div', { className: 'qlic-ask', role: 'group', 'aria-label': __( 'Credit link', 'quotelinks-investing-calculators' ) },
			el( 'p', { className: 'qlic-ask-q' }, __( 'Show a small "Calculator by Quotelinks" credit link under the calculator?', 'quotelinks-investing-calculators' ) ),
			el( 'p', null, __( 'It links to the calculator\'s page on quotelinks.com and helps keep these calculators free. Nothing is added to your page unless you choose Yes.', 'quotelinks-investing-calculators' ) ),
			el( 'div', { className: 'qlic-ask-btns' },
				el( C.Button, { variant: 'secondary', onClick: function () {
					choose( 'yes' );
				} }, __( 'Yes, show the credit link', 'quotelinks-investing-calculators' ) ),
				el( C.Button, { variant: 'secondary', onClick: function () {
					choose( 'no' );
				} }, __( 'No thanks', 'quotelinks-investing-calculators' ) )
			),
			el( 'p', { className: 'qlic-ask-note' }, __( 'Your answer is remembered for calculators you add later. You can change it any time in the block settings.', 'quotelinks-investing-calculators' ) )
		) : null;

		return el( 'div', blockProps,
			inspector,
			askBox,
			el( 'div', { className: 'qlic-frame-wrap', style: { maxWidth: maxw + 'px' } },
				el( 'div', { className: 'qlic-shield', 'aria-hidden': true } ),
				el( 'iframe', {
					ref: frameRef,
					className: 'qlic-frame',
					src: src,
					title: calc.label,
					style: { maxWidth: maxw + 'px', height: height + 'px' }
				} )
			),
			showCredit ? el( 'p', { className: 'qlic-credit', style: { maxWidth: maxw + 'px' } },
				el( 'a', { href: SITE + '/calculators/' + calc.slug + '.html', onClick: stop }, calc.label ),
				' by ',
				el( 'a', { href: SITE + '/', onClick: stop }, 'Quotelinks' )
			) : null
		);
	}

	wp.blocks.registerBlockType( 'quotelinks/investing-calculator', {
		icon: blockIcon,
		edit: Edit,
		save: function () {
			return null;
		},
		variations: DATA.calculators.map( function ( c ) {
			return {
				name: c.slug,
				title: c.title,
				description: c.desc,
				icon: calcIcon( c ),
				attributes: { calc: c.slug },
				keywords: [ c.short, c.label, 'calculator' ],
				scope: [ 'inserter', 'transform' ],
				isActive: function ( blockAttributes, variationAttributes ) {
					return blockAttributes.calc === variationAttributes.calc;
				}
			};
		} )
	} );
}( window.wp ) );
