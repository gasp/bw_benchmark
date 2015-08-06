# Export for analytics 

## Count missing country codes
How many records do not have any country ?
`SELECT COUNT(*) FROM bandwidth_records WHERE country IS NULL;`

## Fill in the gaps
Run this for each record with
```
$ seq 1 1000 | xargs -Iz ./phpmamp country.php
```
this shall populate your table with countries data.

Please do not run this on prod env

## Export to csv

```
select * INTO OUTFILE '/tmp/bandwith_records_20150806.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '\\'  LINES TERMINATED BY '\n' from bandwidth_records where 1 ORDER BY date DESC;
```
