CREATE OR REPLACE FUNCTION detect_cycle()
    RETURNS TRIGGER AS
$func$
BEGIN
    IF EXISTS (
            WITH RECURSIVE search_graph(parent_id, path, cycle) AS ( -- relevant columns
                -- check ahead, makes 1 step less
                SELECT f.parent_id, ARRAY[f.id, f.parent_id], (f.id = f.parent_id)
                FROM  diary.progression_folder f
                WHERE  f.id = NEW.id  -- only test starting from new row

                UNION ALL
                SELECT f.parent_id, sg.path || f.parent_id, f.parent_id = ANY(sg.path)
                FROM   search_graph sg
                           JOIN  diary.progression_folder f ON f.id = sg.parent_id
                WHERE  NOT sg.cycle
            )
            SELECT 1
            FROM   search_graph
            WHERE  cycle
            LIMIT  1  -- stop evalutation at first find
        )
    THEN
        RAISE EXCEPTION 'Cycle detected';
    ELSE
        RETURN NEW;
    END IF;

END
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS detect_cycle_after_update ON diary.progression_folder;

CREATE TRIGGER detect_cycle_after_update
AFTER UPDATE ON diary.progression_folder
FOR EACH ROW EXECUTE PROCEDURE detect_cycle();