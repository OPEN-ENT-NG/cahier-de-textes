DROP TABLE IF EXISTS diary.attachment; 
DROP TABLE IF EXISTS diary.homework;
DROP TABLE IF EXISTS diary.homework_type;
DROP TABLE IF EXISTS diary.lesson;
DROP TABLE IF EXISTS diary.teacher;
DROP TABLE IF EXISTS diary.audience;
DROP TABLE IF EXISTS diary.subject;

CREATE TYPE diary.resource_state AS ENUM ('draft', 'published');

CREATE TABLE diary.teacher (
    id character varying(37),
    teacher_display_name character varying(120),
    PRIMARY KEY (id)
);


CREATE TABLE diary.audience (
    id character varying(37),
    school_id character varying(37),
    audience_type character varying(8),
    audience_label character varying(20),
    PRIMARY KEY (id)
);

CREATE TABLE diary.subject (
    id character varying(37),
    school_id character varying(37),
    subject_label character varying(20),
    teacher_id character varying(37),
    PRIMARY KEY (id),
    CONSTRAINT teacher_id_FK FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(id) ON DELETE CASCADE
);

CREATE TABLE diary.lesson (
    id bigserial,
    subject_id character varying(37),
    school_id character varying(37),
    teacher_id character varying(37),
    audience_id character varying(37),
    lesson_title character varying(50),
    lesson_room character varying(8),
    lesson_color character varying(6),
    lesson_date date,
    lesson_start_time time,
    lesson_end_time time,
    lesson_description text,
    lesson_annotation text,
    lesson_state diary.resource_state DEFAULT 'draft',
    PRIMARY KEY (id),
    CONSTRAINT teacher_id_FK FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(id) ON DELETE CASCADE,
    CONSTRAINT audience_id_FK FOREIGN KEY (audience_id)
        REFERENCES diary.audience(id) ON DELETE CASCADE,
    CONSTRAINT subject_id_FK FOREIGN KEY (subject_id)
        REFERENCES diary.subject(id) ON DELETE CASCADE
);

CREATE TABLE diary.homework_type (
    id bigserial,
    school_id character varying(37),
    homework_type_label character varying(50),
    homework_type_category character varying(15),
    PRIMARY KEY (id)
);

CREATE TABLE diary.homework (
    id bigserial,
    subject_id character varying(37),
    school_id character varying(37),
    teacher_id character varying(37),
    audience_id character varying(37),
    lesson_id bigint,
    homework_title character varying(50),
    homework_description text,
    homework_type_id integer,
    homework_due_date date,
    homework_color character varying(6),
    homework_state diary.resource_state DEFAULT 'draft',
    PRIMARY KEY (id),
    CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(id) ON DELETE CASCADE,
    CONSTRAINT homework_type_id_fk FOREIGN KEY (homework_type_id)
        REFERENCES diary.homework_type(id)  ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT teacher_id_fk FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(id) ON DELETE CASCADE,
    CONSTRAINT audience_id_fk FOREIGN KEY (audience_id)
        REFERENCES diary.audience(id) ON DELETE CASCADE,
    CONSTRAINT subject_id_fk FOREIGN KEY (subject_id)
        REFERENCES diary.subject(id) ON DELETE CASCADE
);

CREATE TABLE diary.attachment (
    id bigserial,
    attachment_description text,
    attachment_file_name character varying(255) NOT NULL,
    attachment_file_id character varying(37) NOT NULL,
    attachment_file_size bigint,
    homework_id bigint,
    lesson_id bigint,
    PRIMARY KEY (id),
	  CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(id),
	  CONSTRAINT homework_id_fk FOREIGN KEY (homework_id)
        REFERENCES diary.homework(id)
);
