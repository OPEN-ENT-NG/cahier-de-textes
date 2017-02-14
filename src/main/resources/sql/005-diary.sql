DROP TABLE IF EXISTS diary.attachment CASCADE;

CREATE TABLE diary.attachment (
    id bigserial,
    user_id character varying(37),
    document_id character varying(37),
    creation_date date,
    document_label character varying(50),
    PRIMARY KEY (id)
);

ALTER TABLE diary.attachment ADD CONSTRAINT attachment_document_id UNIQUE (document_id);

CREATE TABLE diary.lesson_has_attachment (
    lesson_id bigint,
    attachment_id bigint,
    PRIMARY KEY (lesson_id, attachment_id),
    CONSTRAINT attachment_id_FK FOREIGN KEY (attachment_id)
        REFERENCES diary.attachment(id) ON DELETE CASCADE,
    CONSTRAINT lesson_id_FK FOREIGN KEY (lesson_id)
        REFERENCES diary.lesson(id) ON DELETE CASCADE
);

CREATE TABLE diary.homework_has_attachment (
    homework_id bigint,
    attachment_id bigint,
    PRIMARY KEY (homework_id, attachment_id),
    CONSTRAINT attachment_id_FK FOREIGN KEY (attachment_id)
        REFERENCES diary.attachment(id) ON DELETE CASCADE,
    CONSTRAINT homework_id_FK FOREIGN KEY (homework_id)
        REFERENCES diary.homework(id) ON DELETE CASCADE
);

ALTER TABLE diary.subject ALTER COLUMN subject_label TYPE varchar(50);