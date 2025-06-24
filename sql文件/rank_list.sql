create table rank_list
(
    id           bigint unsigned auto_increment
        primary key,
    song_list_id bigint unsigned          not null,
    consumer_id  bigint unsigned          not null,
    score        int unsigned default '0' not null,
    constraint consumerId
        unique (consumer_id, song_list_id)
)
    charset = utf8mb3;

