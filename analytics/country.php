<?php
require 'vendor/autoload.php';
require '../config.php';
use GeoIp2\Database\Reader;

$config = array(
	'mysql' => array(
		'host' => DB_HOST,
		'user' => DB_USER,
		'pass' => DB_PASS,
		'dbname' => DB_NAME,
	)
);

$mysql = $config['mysql'];
$db = new PDO("mysql:host={$mysql['host']};dbname={$mysql['dbname']}", $mysql['user'], $mysql['pass'] );

if (is_null($db)) {
	exit('failed to connect to database'."\n");
}

$sqlselect = "SELECT id, ip FROM bandwidth_records WHERE ip IS NOT NULL AND country IS NULL LIMIT 1";
foreach ($db->query($sqlselect) as $row) {
  $id = $row['id'];
  $ip = $row['ip'];
}

if(!isset($id)) {
  exit('no more ip to parse'."\n");
}

// This creates the Reader object, which should be reused across
// lookups.
$reader = new Reader('./GeoIP2-Country.mmdb');

try {
  // Replace "city" with the appropriate method for your database, e.g.,
  // "country".
  $record = $reader->country($ip);
  $country = $record->country->isoCode;
} catch (Exception $e) {
  echo "error while fetching ip $ip";
  $country = '';
}

if(empty($country)) {
  echo "\n";
  echo 'empty result for ip '.$ip."\n";
  $country = '--';
}
$sqlupdate = "UPDATE `bandwidth_records` SET `country` = '$country' WHERE `bandwidth_records`.`id` = $id;";
$db->query($sqlupdate);

echo "setted $country for $ip\n";
