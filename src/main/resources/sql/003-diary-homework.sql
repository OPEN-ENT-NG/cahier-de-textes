DROP TABLE IF EXISTS diary.homework;
DROP TABLE IF EXISTS diary.homework_type;

CREATE TABLE diary.homework_type (
  id          bigserial,
  label       character varying(50),
  PRIMARY KEY (id)
);

CREATE TABLE diary.homework (
  id bigserial,
  subject_id    character varying(37) NOT NULL,
  structure_id  character varying(37) NOT NULL,
  teacher_id    character varying(37) NOT NULL,
  audience_id   character varying(37) NOT NULL,
  title         character varying(50) NOT NULL,
  color         character varying(6),
  description   text,
  is_published  BOOLEAN DEFAULT FALSE NOT NULL,

  session_id     bigint,
  due_date      date,
  type_id       integer NOT NULL,
  workload      BIGINT DEFAULT 0 NOT NULL,

  owner_id      character varying(37) NOT NULL,
  created       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  modified      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES diary.session(id),
  CONSTRAINT fk_type_id FOREIGN KEY (type_id) REFERENCES diary.homework_type(id)
);