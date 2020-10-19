CREATE VIEW diary.notebook
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
    'HOMEWORK' as type
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
    'SESSION' as type
    FROM
    diary.session
)
