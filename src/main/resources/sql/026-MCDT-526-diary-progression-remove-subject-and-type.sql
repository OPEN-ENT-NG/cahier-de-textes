ALTER  TABLE  diary.progression_session
    DROP CONSTRAINT pfk_session_type,
    DROP COLUMN IF EXISTS type_id,
    DROP COLUMN IF EXISTS subject_id,
    ADD COLUMN subject_label character varying(50);

ALTER TABLE diary.progression_homework
    DROP CONSTRAINT fk_type_id,
    DROP COLUMN IF EXISTS type_id,
    DROP COLUMN IF EXISTS subject_id;