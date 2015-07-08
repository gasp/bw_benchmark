<?php
/**
 * Benchmark Server
 * 7/8/15
 */

require( VENDOR . '/autoload.php' );

define( 'VERSION', '1.0' );

$app = new \Slim\Slim();

// Base Route
$app->get( '/', function() use( $app ) {
	// Check if simple ping request.
	if ( !is_null( $app->request->params( 'ping' ) ) ) {
		$app->halt( 200, 'ok' );
	} else {
		$app->halt( 200, 'bandwidth-benchmark v. ' . VERSION );
	}
});

// Run the app.
$app->run();