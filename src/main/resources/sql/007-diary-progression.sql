CREATE TABLE diary.progression_session (
  id bigserial,
  subject_id    character varying(37) NOT NULL,
  title         character varying(50) NOT NULL,
  description   text,
  annotation    text,
  owner_id      character varying(37) NOT NULL,
  created       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  modified      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);


CREATE TABLE diary.progression_homework (
  id bigserial,
  subject_id    character varying(37) NOT NULL,
  description   text,

  progression_session_id     bigint,
  type_id       integer NOT NULL,

  owner_id      character varying(37) NOT NULL,
  created       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  modified      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT fk_session_id FOREIGN KEY (progression_session_id) REFERENCES diary.progression_session(id) ON DELETE CASCADE,
  CONSTRAINT fk_type_id FOREIGN KEY (type_id) REFERENCES diary.homework_type(id)
);