# Bandwidth Benchmark

## Server Info

### dependencies

Composer
- one-liner: `curl -sS https://getcomposer.org/installer | php`
- doc: [getcomposer.org](https://getcomposer.org/download/)

node & npm
- one-liner: `brew install node`
- doc: [lmgtfy](http://lmgtfy.com/?q=brew+install+composer)

gulp
- one-liner: `npm install -g gulp`
- doc: [gulpjs](http://gulpjs.com/)

### Steps for Install

1. Set your host document root to _server/public/_
2. run `./composer.phar install`
3. Create a _config.php_ file based off of _config.dist.php_ and save to _config.php_
4. The database should follow the following schema:

```
CREATE TABLE `bandwidth_records` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `js` decimal(20,10) unsigned NULL,
  `swf` decimal(20,10) unsigned NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip` char(45) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
```

```
ALTER TABLE `bandwidth_records` ADD `referrer` CHAR(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL AFTER `ip`;
```

```
ALTER TABLE `bandwidth_records` ADD `country` CHAR(3) BINARY CHARACTER SET ascii COLLATE ascii_bin NULL DEFAULT NULL AFTER `referrer`;
```
5. run `npm install` to install local nodejs packages
6. run `gulp install` to perform an installation

Make sure to then modify the endpoint in _benchmark.js_ to point to the host running the bandwidth logging api, with the path _/api/bandwidth_. For example: `lab.videodesk.com/bw_benchmark/api/bandwidth`.
