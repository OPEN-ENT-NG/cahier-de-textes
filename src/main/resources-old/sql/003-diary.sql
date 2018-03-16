ALTER TABLE diary.lesson
    ADD COLUMN owner VARCHAR(36) NOT NULL DEFAULT 'temp',
    ADD COLUMN created TIMESTAMP NOT NULL DEFAULT NOW(),
	  ADD COLUMN modified TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE diary.lesson set owner = teacher_id where owner = 'temp';

ALTER TABLE diary.lesson ALTER COLUMN owner DROP DEFAULT;
ALTER TABLE diary.lesson ALTER COLUMN lesson_color TYPE character varying(7);

CREATE TYPE diary.homework_turn_in_type AS ENUM ('lesson', 'rack');

ALTER TABLE diary.homework
    ADD COLUMN owner VARCHAR(36) NOT NULL DEFAULT 'temp',
    ADD COLUMN created TIMESTAMP NOT NULL DEFAULT NOW(),
	  ADD COLUMN modified TIMESTAMP NOT NULL DEFAULT NOW(),
	  ADD COLUMN turn_in_type diary.homework_turn_in_type NOT NULL DEFAULT 'lesson';

UPDATE diary.homework set owner = teacher_id where owner = 'temp';

ALTER TABLE diary.homework ALTER COLUMN owner DROP DEFAULT;
ALTER TABLE diary.homework ALTER COLUMN homework_color TYPE character varying(7);