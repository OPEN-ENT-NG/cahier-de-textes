DROP TABLE IF EXISTS diary.homework_visa;

CREATE TABLE diary.homework_visa (
    homework_id bigint
  , visa_id bigint not null
  , primary key(homework_id, visa_id)
  , CONSTRAINT fk_homework_id FOREIGN KEY (homework_id) REFERENCES diary.homework(id)
  , CONSTRAINT fk_visa_id FOREIGN KEY (visa_id) REFERENCES diary.visa(id)

);
