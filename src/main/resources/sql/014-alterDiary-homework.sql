CREATE INDEX idx_homework_structure_id ON diary.homework USING btree (structure_id COLLATE pg_catalog."default");
CREATE INDEX idx_homework_audience_id ON diary.homework USING btree (audience_id COLLATE pg_catalog."default");
CREATE INDEX idx_homework_owner_id ON diary.homework USING btree (owner_id COLLATE pg_catalog."default");
CREATE INDEX idx_homework_session_id ON diary.homework USING btree(session_id);