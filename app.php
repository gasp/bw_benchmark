<?php
/**
 * Benchmark Server
 * 7/8/15
 */

require( VENDOR . '/autoload.php' );
require( ROOT . '/config.php' );

define( 'VERSION', '1.2.1' );

$app = new \Slim\Slim();

/**
 * Configuration array.
 */
$config = array(
	'mysql' => array(
		'host' => DB_HOST,
		'user' => DB_USER,
		'pass' => DB_PASS,
		'dbname' => DB_NAME,
	)
);

/**
 * Base route for testing server.
 */
$app->get( '/', function() use( $app ) {
	// Check if simple ping request.
	if ( !is_null( $app->request->params( 'ping' ) ) ) {
		$app->halt( 200, 'ok' );
	} else {
		$app->halt( 200, 'bandwidth-benchmark v. ' . VERSION );
	}
});

/**
 * API routes.
 */
$app->group( '/api', function() use( $app ) {
	$app->response()->header('Access-Control-Allow-Origin', '*');
	$app->response()->header('Access-Control-Allow-Headers', 'origin, content-type, accept');
	$app->response()->header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

	// OPTIONS requests.
	$app->options( '/:type+', function() {});

	/**
	 * Route for inserting bandwidth data to the database.
	 */
	$app->post( '/bandwidth', function() use( $app ) {
		try {
			// Payload.
			$body = $app->request()->getBody();
			$data = json_decode( $body );
			// User agent.
			$user_agent = $app->request()->getUserAgent();
			// IP.
			$ip = $_SERVER['REMOTE_ADDR'];
			//
			$referrer = $app->request()->getReferrer();

			// Insert to the database.
			$sqlquery = "INSERT INTO bandwidth_records (js, swf, user_agent, ip, referrer) "
			. "VALUES(:js_bandwidth, :swf_bandwidth, :user_agent, :ip, :referrer)";
			$sql = $app->db->prepare( $sqlquery );
			$sql->bindParam( ':js_bandwidth', $data->js, PDO::PARAM_STR );
			$sql->bindParam( ':swf_bandwidth', $data->swf, PDO::PARAM_STR );
			$sql->bindParam( ':user_agent', $user_agent, PDO::PARAM_STR );
			$sql->bindParam( ':ip', $ip, PDO::PARAM_STR );
			$sql->bindParam( ':referrer', $referrer, PDO::PARAM_STR );
			$sql->execute();

		} catch( \Exception $e ) {
			error_log( 'Error inserting bw record to DB: ' . $e->getMessage() );
			$app->halt( 500 );
		}

		$app->halt( 200 , 'true');
	})->name('bandwidth-api');

});

/**
 * The Database object.
 */
$app->container->singleton( 'db', function() use ($app, $config) {
	$mysql = $config['mysql'];
	$db = new PDO("mysql:host={$mysql['host']};dbname={$mysql['dbname']}", $mysql['user'], $mysql['pass'] );
	return $db;
});

// Run the app.
$app->run();
