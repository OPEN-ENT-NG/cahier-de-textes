DO $$
BEGIN

    IF EXISTS(
        SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name = 'diary'
      )
    THEN
      EXECUTE 'ALTER SCHEMA diary RENAME TO diary_V1previousAtos';
    END IF;

END
$$;

CREATE SCHEMA diary;

CREATE TABLE diary.scripts (
filename VARCHAR(255) NOT NULL PRIMARY KEY,
passed TIMESTAMP NOT NULL DEFAULT NOW()
);
