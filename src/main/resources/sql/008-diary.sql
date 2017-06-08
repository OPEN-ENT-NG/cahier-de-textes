DROP TABLE IF EXISTS diary.visa;

CREATE TABLE diary.visa (
    id bigserial,

    comment text,
    dateCreate date,

    teacherId character varying(60) not null,
    teacherName character varying(60),

    subjectId character varying(60),
    subjectName character varying(60),

    audienceId character varying(60),
    audienceName character varying(60),

    ownerId character varying(60),
    ownerName character varying(60),
    ownerType character varying(60),

    PRIMARY KEY (id)
);

CREATE INDEX idx_v_teacher_id
   ON diary.visa (teacherId ASC NULLS LAST);
CREATE INDEX idx_v_teacher_name
   ON diary.visa (teacherName ASC NULLS LAST);

CREATE INDEX idx_v_subject_id
   ON diary.visa (subjectId ASC NULLS LAST);
CREATE INDEX idx_v_subject_name
   ON diary.visa (subjectName ASC NULLS LAST);

CREATE INDEX idx_v_audience_id
   ON diary.visa (audienceId ASC NULLS LAST);
CREATE INDEX idx_v_audience_name
   ON diary.visa (audienceName ASC NULLS LAST);

CREATE INDEX idx_v_date_create
   ON diary.visa (dateCreate ASC NULLS LAST);


CREATE TABLE diary.visa_lesson (
    visa_id integer NOT NULL,
    lesson_id integer NOT NULL
);


