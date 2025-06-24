create table song_list
(
    id           int unsigned auto_increment
        primary key,
    title        varchar(255)             not null,
    pic          varchar(255)             null,
    introduction text                     null,
    style        varchar(10) default '无' null
)
    charset = utf8mb3;

