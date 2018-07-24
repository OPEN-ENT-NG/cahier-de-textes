DROP TABLE IF EXISTS diary.session;

CREATE TABLE diary.session (
  id bigserial,
  subject_id    character varying(37) NOT NULL,
  structure_id  character varying(37) NOT NULL,
  teacher_id    character varying(37) NOT NULL,
  audience_id   character varying(37) NOT NULL,
  title         character varying(50) NOT NULL,
  room          character varying(8),
  color         character varying(6),
  date          date NOT NULL,
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  description   text,
  annotation    text,
  is_published  BOOLEAN DEFAULT FALSE NOT NULL,
  course_id     character varying(100),

  owner_id      character varying(37) NOT NULL,
  created       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  modified      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);