DROP TABLE IF EXISTS diary.visa;
CREATE TABLE diary.visa (
    id bigserial,
    comment text,
    structure_id character varying(60) not null,
    session_id bigint not null,
    owner_id character varying(60),

    created     TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    modified    TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),

    PRIMARY KEY (id),
    CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES diary.lesson(id)
);