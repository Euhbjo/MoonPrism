create table user_support
(
    id         int auto_increment
        primary key,
    comment_id int         not null,
    user_id    varchar(45) not null
)
    charset = latin1;

