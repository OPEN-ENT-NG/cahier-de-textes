ALTER TABLE diary.homework ALTER COLUMN color TYPE VARCHAR(7);

UPDATE diary.homework SET color = '#ff9700' WHERE color = 'pink';