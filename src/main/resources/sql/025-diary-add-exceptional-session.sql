ALTER TABLE diary.session
  ADD COLUMN  exceptional_label character varying (50);

ALTER TABLE diary.homework
  ADD COLUMN  exceptional_label character varying (50);

CREATE OR REPLACE VIEW diary.notebook
AS (
SELECT
    id,
    subject_id,
    structure_id,
    teacher_id,
    audience_id,
    description,
    null as annotation,
    null as title,
    type_id,
    workload,
    modified,
    is_published,
    estimatedtime,
    session_id,
    due_date as date,
    null as start_time,
    null as end_time,
    'HOMEWORK' as type,
    exceptional_label
    FROM
    diary.homework
UNION
SELECT
    id,
    subject_id,
    structure_id,
    teacher_id,
    audience_id,
    description,
    annotation,
    title,
    type_id,
    null as workload,
    modified,
    is_published,
    null as estimatedtime,
    null as session_id,
    date,
    start_time,
    end_time,
    'SESSION' as type,
    exceptional_label
    FROM
    diary.session
)
