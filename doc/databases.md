

## pgadmin

pgadmin=# \d wemphit
                                       Table "public.wemphit"
   Column   |           Type           | Collation | Nullable |               Default               
------------+--------------------------+-----------+----------+-------------------------------------
 id         | integer                  |           | not null | nextval('wemphit_id_seq'::regclass)
 wyuid      | integer                  |           |          | 
 path       | character varying(64)    |           |          | 
 is_landing | boolean                  |           |          | false
 infojsonb  | jsonb                    |           |          | 
 created_at | timestamp with time zone |           | not null | now()
Indexes:
    "wemphit_pkey" PRIMARY KEY, btree (id)





## Drupal and extra

2 databases:

    en_edu_drupal

    en_edu_extra
        wechat_users
        log


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
| points         | int(11)      | YES  |     | 0       |                |
+----------------+--------------+------+-----+---------+----------------+


MariaDB [en_edu_extra]> desc log;
+------------+-------------+------+-----+-------------------+----------------+
| Field      | Type        | Null | Key | Default           | Extra          |
+------------+-------------+------+-----+-------------------+----------------+
| id         | int(11)     | NO   | PRI | NULL              | auto_increment |
| info       | tinytext    | YES  |     | NULL              |                |
| created    | datetime    | YES  |     | CURRENT_TIMESTAMP |                |
| type       | varchar(32) | YES  |     | NULL              |                |
| appid      | tinyint(4)  | YES  |     | 0                 |                |
| session3rd | varchar(64) | YES  |     |                   |                |
+------------+-------------+------+-----+-------------------+----------------+

appid

- 0 WEMP

type

- access
- login


```


### Points

Tables:

- points column in wechat_users table
- point_events
- point_event_types

#### point_event_types

```
MariaDB [en_edu_extra]> describe point_event_types;
+--------+--------------+------+-----+---------+----------------+
| Field  | Type         | Null | Key | Default | Extra          |
+--------+--------------+------+-----+---------+----------------+
| id     | int(11)      | NO   | PRI | NULL    | auto_increment |
| title  | tinytext     | YES  |     | NULL    |                |
| descp  | varchar(255) | YES  |     | NULL    |                |
| points | int(11)      | YES  |     | NULL    |                |
+--------+--------------+------+-----+---------+----------------+

MariaDB [en_edu_extra]> select * from point_event_types;
+----+----------+-------+--------+
| id | title    | descp | points |
+----+----------+-------+--------+
|  1 | Register | NULL  |     20 |
|  2 | Enroll   | NULL  |     -5 |
+----+----------+-------+--------+
```

#### point_events

```
MariaDB [en_edu_extra]> describe point_events;
+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| id             | int(11)      | NO   | PRI | NULL    | auto_increment |
| title          | tinytext     | YES  |     | NULL    |                |
| wechat_user_id | int(11)      | YES  |     | NULL    |                |
| type_id        | int(11)      | YES  |     | NULL    |                |
| descp          | varchar(255) | YES  |     | NULL    |                |
+----------------+--------------+------+-----+---------+----------------+
```

