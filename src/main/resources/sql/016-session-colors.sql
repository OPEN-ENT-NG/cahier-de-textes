ALTER TABLE diary.session ALTER COLUMN color TYPE VARCHAR(7);

UPDATE diary.session SET color = '#7E7E7E' WHERE color = 'grey';
UPDATE diary.session SET color = '#00ab6f' WHERE color = 'green';