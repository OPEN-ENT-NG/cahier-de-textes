DROP TABLE IF EXISTS diary.homework_progress;
DROP TABLE IF EXISTS diary.homework_state;

CREATE TABLE diary.homework_state (
    id          bigint,
    label       character varying(50),
    PRIMARY KEY (id)
);

CREATE TABLE diary.homework_progress (
    user_id         character varying(37) NOT NULL,
    homework_id     bigint,
    state_id        bigint,
    created         TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    modified        TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, homework_id),
    CONSTRAINT fk_homework_id FOREIGN KEY (homework_id) REFERENCES diary.homework(id) ON DELETE CASCADE,
    CONSTRAINT fk_state_id FOREIGN KEY (state_id) REFERENCES diary.homework_state(id)
);
