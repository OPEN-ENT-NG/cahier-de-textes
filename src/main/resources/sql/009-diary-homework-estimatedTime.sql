ALTER  TABLE  diary.progression_homework
    ADD  estimatedTime BIGINT  DEFAULT 0 NOT NULL;

ALTER  TABLE  diary.homework
    ADD  estimatedTime BIGINT  DEFAULT 0 NOT NULL;