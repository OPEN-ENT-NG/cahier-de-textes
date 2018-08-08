DROP TABLE IF EXISTS diary.inspector_habilitation;
CREATE TABLE diary.inspector_habilitation (
    inspector_id character varying(60) not null,
    structure_id character varying(60) not null,
    teacher_id character varying(60) not null,

    created     TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    modified    TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),

    PRIMARY KEY (inspector_id, structure_id, teacher_id)
);
