CREATE INDEX idx_h_id
   ON diary.homework_type (id ASC NULLS LAST);

CREATE INDEX idx_h_member_id
   ON diary.homework_shares (member_id ASC NULLS LAST);

CREATE INDEX idx_h_resource_id
   ON diary.homework_shares (resource_id ASC NULLS LAST);

CREATE INDEX idx_h_action
   ON diary.homework_shares (action ASC NULLS LAST);


CREATE INDEX idx_l_member_id
   ON diary.lesson_shares (member_id ASC NULLS LAST);

CREATE INDEX idx_l_resource_id
   ON diary.lesson_shares (resource_id ASC NULLS LAST);

CREATE INDEX idx_l_action
   ON diary.lesson_shares (action ASC NULLS LAST);

CREATE INDEX idx_m_teacher_id
   ON diary.modelweek (teacherId ASC NULLS LAST);