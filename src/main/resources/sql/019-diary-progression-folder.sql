DROP TABLE IF EXISTS diary.progression_folder;

CREATE TABLE diary.progression_folder (
  id bigserial,
  parent_id    bigint,
  teacher_id   character varying(37) NOT NULL,
  title         character varying(50) NOT NULL,

  created       TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  modified      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),

  CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES diary.progression_folder(id) ON DELETE SET NULL
);

ALTER  TABLE  diary.progression_session
    ADD  progression_folder_id bigint,
    ADD CONSTRAINT fk_progression_folder_id FOREIGN KEY (progression_folder_id) REFERENCES diary.progression_folder(id) ON DELETE SET NU