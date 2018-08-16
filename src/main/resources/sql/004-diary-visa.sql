DROP TABLE IF EXISTS diary.session_visa;
DROP TABLE IF EXISTS diary.visa;

ALTER TABLE diary.session
DROP COLUMN IF EXISTS session_id;

CREATE TABLE diary.visa (
    id bigserial,
    comment text,
    nb_sessions INT not null,
    structure_id character varying(60) not null,
    teacher_id character varying(60) not null,

    pdf_details character varying(60),

    owner_type character varying(60) DEFAULT 'headmaster', /*headmaster or inspector*/
    owner_id character varying(60),
    created     TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    modified    TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),

    PRIMARY KEY (id)
);


CREATE TABLE diary.session_visa (
    session_id bigint
  , visa_id bigint not null
  , primary key(session_id, visa_id)
  , CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES diary.session(id)
  , CONSTRAINT fk_visa_id FOREIGN KEY (visa_id) REFERENCES diary.visa(id)

);
