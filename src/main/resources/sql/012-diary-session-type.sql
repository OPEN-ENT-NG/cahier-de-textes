ALTER TABLE diary.session DROP CONSTRAINT IF EXISTS fk_session_type;
ALTER TABLE diary.progression_session DROP CONSTRAINT IF EXISTS fk_psession_type;
ALTER TABLE diary.session DROP COLUMN IF EXISTS type_id;
ALTER TABLE diary.progression_session DROP COLUMN IF EXISTS type_id;


DROP TABLE IF EXISTS diary.session_type;

CREATE TABLE diary.session_type (
  id            bigserial,
  structure_id  character varying(37) NOT NULL,
  label         character varying(50),
  rank          bigint,
  PRIMARY KEY (id)
);


ALTER TABLE diary.session
    ADD COLUMN type_id integer,
    ADD CONSTRAINT fk_session_type FOREIGN KEY (type_id) REFERENCES diary.session_type(id) ON DELETE CASCADE;


ALTER TABLE diary.progression_session
    ADD COLUMN type_id integer,
    ADD CONSTRAINT pfk_session_type FOREIGN KEY (type_id) REFERENCES diary.session_type(id) ON DELETE CASCADE;