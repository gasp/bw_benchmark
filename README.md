# Bandwidth Benchmark

## Server Info

### Steps for Install

1. Set your host document root to _server/public/_
2. run `./composer.phar install`
3. Create a _config.php_ file based off of _config.dist.php_ and save to _config.php_
4. The database should follow the following schema:

```
CREATE TABLE `bandwidth_records` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `benchmark` decimal(20,10) unsigned NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

Make sure to then modify the endpoint in _benchmark.js_ to point to the host running the bandwidth logging api, with the path _/api/bandwidth_. For example: `lab.videodesk.com/bw_benchmark/api/bandwidth`.
