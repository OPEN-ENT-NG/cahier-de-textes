
ALTER TABLE diary.lesson
    ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;


DROP TABLE IF EXISTS diary.histo_lesson;
DROP TABLE IF EXISTS diary.histo_homework;



CREATE TABLE diary.histo_lesson (
    yearLabel character varying(10),
    lessonId bigint,
    title text,
    room character varying(30),
    date date,
    startTime time,
    endTime time,
    description text,
    annotation text,
    teacherId character varying(40),
    teacherName character varying(120),
    subjectId character varying(40),
    subjectLabel character varying(50),
    audienceId character varying(40),
    audienceLabel character varying(20),
    structureId character varying(40)
);

CREATE INDEX idx_hl_yearLabel
   ON diary.histo_lesson (yearLabel ASC NULLS LAST);
CREATE INDEX idx_hl_date
   ON diary.histo_lesson (date ASC NULLS LAST);
CREATE INDEX idx_hl_teacherName
   ON diary.histo_lesson (teacherName ASC NULLS LAST);
CREATE INDEX idx_hl_audienceLabel
   ON diary.histo_lesson (audienceLabel ASC NULLS LAST);
CREATE INDEX idx_hl_structureId
   ON diary.histo_lesson (structureId ASC NULLS LAST);


CREATE TABLE diary.histo_homework (
    yearLabel character varying(10),
    homeworkId bigint,
    lessonId bigint,
    title text,
    description text,
    date date,
    typeId bigint,
    typeLabel character varying(50),
    teacherId character varying(40),
    teacherName character varying(120),
    subjectId character varying(40),
    subjectLabel character varying(50),
    audienceId character varying(40),
    audienceLabel character varying(20),
    structureId character varying(40)
);

CREATE INDEX idx_hh_yearLabel
   ON diary.histo_homework (yearLabel ASC NULLS LAST);
CREATE INDEX idx_hh_date
   ON diary.histo_homework (date ASC NULLS LAST);
CREATE INDEX idx_hh_teacherName
   ON diary.histo_homework (teacherName ASC NULLS LAST);
CREATE INDEX idx_hh_audienceLabel
   ON diary.histo_homework (audienceLabel ASC NULLS LAST);
CREATE INDEX idx_hh_structureId
     ON diary.histo_homework (structureId ASC NULLS LAST);

DROP TABLE IF EXISTS diary.inspector_habilitation;

CREATE TABLE diary.inspector_habilitation (
    inspectorId character varying(40),
    teacherId character varying(40),
    teacherName character varying(120),
    structureId character varying(40)
);

CREATE INDEX idx_ih_inspectorId
     ON diary.inspector_habilitation (inspectorId ASC NULLS LAST);
CREATE INDEX idx_ih_teacherId
     ON diary.inspector_habilitation (teacherId ASC NULLS LAST);
CREATE INDEX idx_ih_structureId
     ON diary.inspector_habilitation (structureId ASC NULLS LAST);