How many records do not have any country ?
`SELECT COUNT(*) FROM bandwidth_records WHERE country IS NULL;`

run this for each record with
```
$ seq 1 1000 | xargs -Iz ./phpmamp country.php
```

this shall populate your table with countries data.

please do not run this on prod env
