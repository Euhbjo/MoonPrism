create table comment
(
    id           int unsigned auto_increment
        primary key,
    user_id      int unsigned             not null,
    song_id      int unsigned             null,
    song_list_id int unsigned             null,
    content      varchar(255)             null,
    create_time  datetime                 null,
    type         tinyint                  not null,
    up           int unsigned default '0' not null
)
    charset = utf8mb3;

