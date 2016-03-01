DROP TABLE IF EXISTS diary.attachment; 
DROP TABLE IF EXISTS diary.homework;
DROP TABLE IF EXISTS diary.homework_type;
DROP TABLE IF EXISTS diary.lesson;
DROP TABLE IF EXISTS diary.teacher;

-- ----------------------------------------------------------------------------
-- Teacher table
-- ----------------------------------------------------------------------------
CREATE TABLE diary.teacher (
    teacher_id character varying(37), -- teacher's identifier in AF
    teacher_display_name character varying(120), -- how teacher's name appears on the diary
    PRIMARY KEY (teacher_id)
);

-- ----------------------------------------------------------------------------
-- Lesson table
-- ----------------------------------------------------------------------------
CREATE TABLE diary.lesson (
    lesson_id bigserial,
    subject_code character varying(20), -- lesson's subject code
    subject_label character varying(20), -- lesson's subject label
    school_id character varying(37), -- identifier of the school in the ENT
    teacher_id character varying(37), -- teacher's identifier in AF
    audience_type character varying(8), -- enum : 'CLASS' or 'GROUP' 
    audience_code character varying(20), -- identifier of the class or group in the AF
    audience_label character varying(20), -- label of the class or group 
    lesson_title character varying(50), -- lesson's title
    lesson_room character varying(8), -- room for the lesson
    lesson_color character varying(6), -- lesson's display color format is RRVVBB (hexadecimal values)
    lesson_date date, -- lesson date
    lesson_start_time time, -- lesson start hour
    lesson_end_time time, -- lesson end hour
    lesson_description text, -- lesson's description in the html rich editor
    lesson_annotation text, -- teacher's personal annotation, only him can see it
    PRIMARY KEY (lesson_id),
    CONSTRAINT teacher_id_FK FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(teacher_id) ON DELETE CASCADE
);


-- ----------------------------------------------------------------------------
-- Homework types table
-- ----------------------------------------------------------------------------
CREATE TABLE diary.homework_type (
    homework_type_id bigserial,
    school_id character varying(37), -- identifier of the school in the ENT
    homework_type_label character varying(50), -- homework type's label
    homework_type_category character varying(15), -- homework type's category. Enum to be determined
    PRIMARY KEY (homework_type_id)
);


-- ----------------------------------------------------------------------------
-- Homework table
-- ----------------------------------------------------------------------------
CREATE TABLE diary.homework (
    homework_id bigserial,
    subject_code character varying(20), -- homework's subject code
    subject_label character varying(20), -- homework's subject label
    school_id character varying(37), -- identifier of the school in the ENT
    teacher_id character varying(37), -- teacher's identifier in AF
    audience_type character varying(8), -- enum : 'CLASS' or 'GROUP' 
    audience_code character varying(20), -- identifier of the class or group in the AF
    audience_label character varying(20), -- label of the class or group 
    lesson_id bigint, -- identifier of the lesson to which the homework is attached (null if free homework)
    homework_title character varying(50), -- homework's title
    homework_description text, -- homework's description in the html rich editor
    homework_type_id integer,  -- homework's type
    homework_due_date date,  -- homework's due date
    homework_color character varying(6), -- homework's display color format is RRVVBB (hexadecimal values)
    PRIMARY KEY (homework_id),
    CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(lesson_id) ON DELETE CASCADE, 
    CONSTRAINT homework_type_id_fk FOREIGN KEY (homework_type_id)
        REFERENCES diary.homework_type(homework_type_id)  ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT teacher_id_fk FOREIGN KEY (teacher_id)
        REFERENCES diary.teacher(teacher_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Attachments table (stored in the diary storage space)
-- -----------------------------------------------------------------------------
CREATE TABLE diary.attachment (
    attachment_id bigserial,
    attachment_description text,
    attachment_file_name character varying(255) NOT NULL, -- file name displayed to the users
    attachment_file_id character varying(37) NOT NULL, -- identifier of the file in the storage api
    attachment_file_size bigint, -- file size in octets
    homework_id bigint, -- identifier of the homework to which the file is attached, null if attached to a lesson
    lesson_id bigint, -- identifier of the lesson to which the file is attached, null if attached to a homework
    PRIMARY KEY (attachment_id),
	  CONSTRAINT lesson_id_fk FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(lesson_id), 
	  CONSTRAINT homework_id_fk FOREIGN KEY (homework_id)
        REFERENCES diary.homework(homework_id)
);
