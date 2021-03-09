ALTER TABLE diary.session
    ADD COLUMN archive_school_year character varying(10);

ALTER TABLE diary.homework
    ADD COLUMN archive_school_year character varying(10);

CREATE
OR REPLACE VIEW diary.notebook
AS (
SELECT
    id,
    subject_id,
    structure_id,
    teacher_id,
    audience_id,
    description,
    null as annotation,
    null as title,
    type_id,
    workload,
    modified,
    is_published,
    estimatedtime,
    session_id,
    due_date as date,
    null as start_time,
    null as end_time,
    'HOMEWORK' as type,
    exceptional_label
    FROM
    diary.homework
    WHERE archive_school_year IS NULL
UNION
SELECT
    id,
    subject_id,
    structure_id,
    teacher_id,
    audience_id,
    description,
    annotation,
    title,
    type_id,
    null as workload,
    modified,
    is_published,
    null as estimatedtime,
    null as session_id,
    date,
    start_time,
    end_time,
    'SESSION' as type,
    exceptional_label
    FROM
    diary.session
    WHERE archive_school_year IS NULL
);

CREATE TABLE diary.notebook_archive
(
    id                  bigserial,
    structure_id        character varying(37)  NOT NULL,
    structure_label     character varying(100) NOT NULL,
    teacher_id          character varying(37)  NOT NULL,
    teacher_first_name  character varying(50)  NOT NULL,
    teacher_last_name   character varying(50)  NOT NULL,
    audience_label      character varying(50)  NOT NULL,
    subject_label       character varying(50)  NOT NULL,
    archive_school_year character varying(10)  NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    file_id             character varying(37)  NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE diary.session_visa
DROP CONSTRAINT fk_visa_id;

ALTER TABLE diary.homework_visa
DROP CONSTRAINT fk_visa_id;


ALTER TABLE diary.session_visa
    ADD CONSTRAINT fk_visa_id FOREIGN KEY (visa_id) REFERENCES diary.visa (id) ON DELETE CASCADE;

ALTER TABLE diary.homework_visa
    ADD CONSTRAINT fk_visa_id FOREIGN KEY (visa_id) REFERENCES diary.visa (id) ON DELETE CASCADE;