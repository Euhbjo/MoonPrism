create table admin
(
    id       int unsigned auto_increment
        primary key,
    name     varchar(45) not null,
    password varchar(45) not null,
    constraint name_UNIQUE
        unique (name)
)
    charset = utf8mb3;

