DROP TABLE IF EXISTS diary.attachment; 
DROP TABLE IF EXISTS diary.homework;
DROP TABLE IF EXISTS diary.homework_type;
DROP TABLE IF EXISTS diary.lesson;
DROP TABLE IF EXISTS diary.teacher;


CREATE TABLE diary.teacher (
    teacher_id character varying(37),
    teacher_display_name character varying(120),
    PRIMARY KEY (teacher_id)
);


CREATE TABLE diary.lesson (
    lesson_id bigserial,
    subject_code character varying(20),
    subject_label character varying(20),
    school_id character varying(37),
    teacher_id character varying(37),
    audience_type character varying(8),
    audience_code character varying(20),
    audience_label character varying(20),
    lesson_title character varying(50),
    lesson_room character varying(8),
    lesson_color character varying(6),
    lesson_date date,
    lesson_start_time time,
    lesson_end_time time,
    lesson_description text,
    lesson_annotation text,
    PRIMARY KEY (lesson_id),
    CONSTRAINT teacher_id_FK FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(teacher_id) ON DELETE CASCADE
);


CREATE TABLE diary.homework_type (
    homework_type_id bigserial,
    school_id character varying(37),
    homework_type_label character varying(50),
    homework_type_category character varying(15),
    PRIMARY KEY (homework_type_id)
);


CREATE TABLE diary.homework (
    homework_id bigserial,
    subject_code character varying(20),
    subject_label character varying(20),
    school_id character varying(37),
    teacher_id character varying(37),
    audience_type character varying(8),
    audience_code character varying(20),
    audience_label character varying(20),
    lesson_id bigint,
    homework_title character varying(50),
    homework_description text,
    homework_type_id integer,
    homework_due_date date,
    homework_color character varying(6),
    PRIMARY KEY (homework_id),
    CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(lesson_id) ON DELETE CASCADE, 
    CONSTRAINT homework_type_id_fk FOREIGN KEY (homework_type_id)
        REFERENCES diary.homework_type(homework_type_id)  ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT teacher_id_fk FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(teacher_id) ON DELETE CASCADE
);

CREATE TABLE diary.attachment (
    attachment_id bigserial,
    attachment_description text,
    attachment_file_name character varying(255) NOT NULL,
    attachment_file_id character varying(37) NOT NULL,
    attachment_file_size bigint,
    homework_id bigint,
    lesson_id bigint,
    PRIMARY KEY (attachment_id),
	  CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(lesson_id), 
	  CONSTRAINT homework_id_fk FOREIGN KEY (homework_id)
        REFERENCES diary.homework(homework_id)
);
