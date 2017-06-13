DROP TABLE IF EXISTS diary.modelweek;

CREATE TABLE diary.modelweek (
    id bigserial,
    weekAlias character varying(37),
    teacherId character varying(37),
    beginDate date,
    endDate date,
    pair boolean,
    PRIMARY KEY (id),
    CONSTRAINT teacher_id_FK FOREIGN KEY (teacherId)
        REFERENCES diary.teacher(id) ON DELETE CASCADE
);