DROP TABLE IF EXISTS diary.progression;
DROP TABLE IF EXISTS diary.lessonprogression;

CREATE TABLE diary.progression (
    id bigserial,
    level character varying(60),
    title character varying(60) not null,
    description text,
    teacherId character varying(60) not null,
    PRIMARY KEY (id)
);

CREATE INDEX idx_p_teacher_id
   ON diary.progression (teacherId ASC NULLS LAST);


CREATE TABLE diary.lessonprogression (
    id bigserial,
    type character varying(60),
    title character varying(60) not null,
    description text,
    subjectLabel character varying(60),
    teacherName  character varying(60),
    color character varying(25),
    annotation text,
    orderIndex bigint,
    teacherId character varying(60) not null,
    homeworks text,
    subject text,
    attachments text ,

    progressionId bigint not null,

    PRIMARY KEY (id)
);


CREATE INDEX idx_lp_teacher_id
   ON diary.lessonprogression (teacherId ASC NULLS LAST);

CREATE INDEX idx_lp_progression_id
   ON diary.lessonprogression (progressionId ASC NULLS LAST);