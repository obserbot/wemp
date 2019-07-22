



2 databases:

    en_edu_drupal

    en_edu_extra
        wechat_users


```
MariaDB [en_edu_extra]> describe wechat_users;
+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| id             | int(11)      | NO   | PRI | NULL    | auto_increment |
| open_id        | tinytext     | YES  |     | NULL    |                |
| session_key    | tinytext     | YES  |     | NULL    |                |
| session3rd     | tinytext     | YES  |     | NULL    |                |
| nickname       | tinytext     | YES  |     | NULL    |                |
| sex            | int(11)      | YES  |     | NULL    |                |
| created        | int(11)      | YES  |     | NULL    |                |
| subscribe_time | int(11)      | YES  |     | NULL    |                |
| info           | text         | YES  |     | NULL    |                |
| status         | int(11)      | YES  |     | NULL    |                |
| uid            | int(11)      | YES  |     | NULL    |                |
| avatar_url     | varchar(255) | YES  |     | NULL    |                |
| union_id       | tinytext     | YES  |     | NULL    |                |
+----------------+--------------+------+-----+---------+----------------+
```

