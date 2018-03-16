DROP TABLE IF EXISTS diary.histo_visa;
DROP TABLE IF EXISTS diary.histo_visa_lesson;
CREATE TABLE diary.histo_visa (
    yearLabel character varying(10),
    id bigint,
    comment text,
    dateCreate timestamp,

    structureId character varying(60) not null,

    teacherId character varying(60) not null,
    teacherName character varying(60),

    subjectId character varying(60),
    subjectName character varying(60),

    audienceId character varying(60),
    audienceName character varying(60),

    ownerId character varying(60),
    ownerName character varying(60),
    ownerType character varying(60)

);

CREATE INDEX idx_hv_yearLabel
   ON diary.histo_visa (yearLabel ASC NULLS LAST);
CREATE INDEX idx_hv_teacher_id
   ON diary.histo_visa (teacherId ASC NULLS LAST);
CREATE INDEX idx_hv_teacher_name
   ON diary.histo_visa (teacherName ASC NULLS LAST);

CREATE INDEX idx_hv_subject_id
   ON diary.histo_visa (subjectId ASC NULLS LAST);
CREATE INDEX idx_hv_subject_name
   ON diary.histo_visa (subjectName ASC NULLS LAST);

CREATE INDEX idx_hv_audience_id
   ON diary.histo_visa (audienceId ASC NULLS LAST);
CREATE INDEX idx_hv_audience_name
   ON diary.histo_visa (audienceName ASC NULLS LAST);

CREATE INDEX idx_hv_date_create
   ON diary.histo_visa (dateCreate ASC NULLS LAST);


CREATE TABLE diary.histo_visa_lesson (
    yearLabel character varying(10),
    visa_id integer NOT NULL,
    lesson_id integer NOT NULL
);