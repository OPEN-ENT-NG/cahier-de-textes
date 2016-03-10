package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.DateUtils;
import fr.openent.diary.utils.JsonUtils;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class LessonServiceImpl extends SqlCrudService implements LessonService {

    private final static int INDEX_LESSON_ID = 0;
    private final static int INDEX_HOMEWORK_ID = 16;
    private final static int INDEX_LESSON_DATE = 11;

    private final static String DATABASE_TABLE ="lesson";
    private final static Logger log = LoggerFactory.getLogger("LessonServiceImpl");

    public LessonServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }


    @Override
    public void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {

        if (isDateValid(startDate) && isDateValid(endDate)) {
            StringBuilder query = new StringBuilder();
            query.append("SELECT l.lesson_id, l.subject_code, l.subject_label, l.school_id, t.teacher_display_name,")
                    .append("l.audience_type, l.audience_code, l.audience_label, l.lesson_title, lesson_room, l.lesson_color,")
                    .append("l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, h.homework_id ")
                    .append(" FROM diary.lesson AS l")
                    .append(" JOIN diary.teacher as t ON t.teacher_id = l.teacher_id")
                    .append(" LEFT JOIN diary.homework as h ON l.lesson_id = h.lesson_id")
                    .append(" WHERE l.teacher_id = ? AND l.school_id = ?")
                    .append(" AND l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD')")
                    .append(" GROUP BY l.lesson_id, l.lesson_date, t.teacher_display_name, h.homework_id")
                    .append(" ORDER BY l.lesson_date ASC");

            JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId))
                    .add(startDate).add(endDate);

            sql.prepared(query.toString(), parameters, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {

                    if ("ok".equals(event.body().getString("status"))) {
                        JsonArray result = event.body().getArray("results");

                        JsonArray resultRefined = new JsonArray();
                        List<Object> homeworkIds = new ArrayList<Object>();
                        //TODO check size >0
                        JsonArray lastLesson = result.get(0);

                        for (int i = 0; i < result.size(); i++) {
                            JsonArray lesson = result.get(i);

                            log.debug("lesson is : " + lesson.getClass());
                            Long idLesson = lesson.get(INDEX_LESSON_ID);
                            log.debug("id lesson is : " + idLesson.toString());
                            Long idHomework = lesson.get(INDEX_HOMEWORK_ID);
                            log.debug("idHomework is : " + idHomework);

                            if(idLesson.compareTo((Long) lastLesson.get(INDEX_LESSON_ID)) != 0){
                                addLesson(resultRefined, homeworkIds, lastLesson);
                                homeworkIds.clear();
                            }

                            if (idHomework != null) {
                                log.debug("add idHomework : " + idHomework);
                                homeworkIds.add(idHomework);
                            }

                            lastLesson = lesson;
                        }

                        addLesson(resultRefined, homeworkIds, lastLesson);

                        handler.handle(new Either.Right<String, JsonArray>(resultRefined));
                    } else {
                        handler.handle(new Either.Left<String, JsonArray>(event.body().getString("message")));
                    }
                }
            });
        } else {
            StringBuilder errorMessage = new StringBuilder("Start date and end date must follow the pattern: ");
            errorMessage.append(DateUtils.DATE_FORMAT);
            handler.handle(new Either.Left<String, JsonArray>(errorMessage.toString()));
        }
    }

    @Override
    public void getAllLessonsForStudent(final String schoolId, final List<String> groupIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {

        if (isDateValid(startDate) && isDateValid(endDate)) {
            StringBuilder query = new StringBuilder();
            query.append("SELECT l.lesson_id, l.subject_code, l.subject_label, l.school_id, t.teacher_display_name,")
                    .append("l.audience_type, l.audience_code, l.audience_label, l.lesson_title, lesson_room, l.lesson_color,")
                    .append("l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, h.homework_id ")
                    .append(" FROM diary.lesson AS l")
                    .append(" JOIN diary.teacher as t ON t.teacher_id = l.teacher_id")
                    .append(" LEFT JOIN diary.homework as h ON l.lesson_id = h.lesson_id")
                    .append(" WHERE l.school_id = ? AND l.audience_code in ")
                    .append(sql.listPrepared(groupIds.toArray()))
                    .append(" AND l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD')")
                    .append(" GROUP BY l.lesson_id, l.lesson_date, t.teacher_display_name, h.homework_id")
                    .append(" ORDER BY l.lesson_date ASC");

            JsonArray parameters = new JsonArray().add(Sql.parseId(schoolId));
            for (Object id: groupIds) {
                parameters.add(id);
            }

            parameters.add(startDate).add(endDate);

            sql.prepared(query.toString(), parameters, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {

                    if ("ok".equals(event.body().getString("status"))) {
                        JsonArray result = event.body().getArray("results");

                        JsonArray resultRefined = new JsonArray();
                        List<Object> homeworkIds = new ArrayList<Object>();
                        //TODO check size >0
                        JsonArray lastLesson = result.get(0);

                        for (int i = 0; i < result.size(); i++) {
                            JsonArray lesson = result.get(i);

                            log.debug("lesson is : " + lesson.getClass());
                            Long idLesson = lesson.get(INDEX_LESSON_ID);
                            log.debug("id lesson is : " + idLesson.toString());
                            Long idHomework = lesson.get(INDEX_HOMEWORK_ID);
                            log.debug("idHomework is : " + idHomework);
                            String dateLesson = lesson.get(INDEX_LESSON_DATE);
                            log.debug("dateLesson is : " + dateLesson);

                            if(idLesson.compareTo((Long)lastLesson.get(INDEX_LESSON_ID)) != 0){
                                addLesson(resultRefined, homeworkIds, lastLesson);
                                homeworkIds.clear();
                            }

                            if (idHomework != null) {
                                //don't display homeworks with lesson date > now
                                try {
                                    if (DateUtils.parseDate(dateLesson).before(new Date())) {
                                        homeworkIds.add(idHomework);
                                    }
                                } catch (ParseException e) {
                                    handler.handle(new Either.Left<String, JsonArray>(e.getMessage()));
                                }
                            }

                            lastLesson = lesson;
                        }

                        addLesson(resultRefined, homeworkIds, lastLesson);

                        handler.handle(new Either.Right<String, JsonArray>(resultRefined));
                    } else {
                        handler.handle(new Either.Left<String, JsonArray>(event.body().getString("message")));
                    }
                }
            });
        }  else {
            StringBuilder errorMessage = new StringBuilder("Start date and end date must follow the pattern: ");
            errorMessage.append(DateUtils.DATE_FORMAT);
            handler.handle(new Either.Left<String, JsonArray>(errorMessage.toString()));
        }
    }

    private void addLesson(JsonArray resultRefined, List<Object> homeworkIds, JsonArray lastLesson) {
        JsonArray homeworks = new JsonArray(homeworkIds);
        JsonArray lessonWithHomeworks = JsonUtils.removeItemAt(lastLesson, INDEX_HOMEWORK_ID);
        lessonWithHomeworks.addArray(homeworks);
        resultRefined.add(lessonWithHomeworks);
    }

    @Override
    public void createLesson(final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler) {
        if(lessonObject != null) {
            final JsonArray attachments = lessonObject.getArray("attachments");
            if(attachments != null && attachments.size() > 0) {
                //get next on the sequence to add the lesson and value in FK on attachment

                sql.raw("select nextval('diary.lesson_lesson_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
                    @Override
                    public void handle(Either<String, JsonObject> event) {
                        if (event.isRight()) {
                            log.debug(event.right().getValue());
                            Long nextId = event.right().getValue().getLong("next_id");
                            lessonObject.putNumber("lesson_id", nextId);

                            JsonArray parameters = new JsonArray().add(nextId);
                            for (Object id: attachments) {
                                parameters.add(id);
                            }

                            SqlStatementsBuilder sb = new SqlStatementsBuilder();
                            sb.insert("diary.lesson", lessonObject, "lesson_id");
                            sb.prepared("update diary.attachment set lesson_id = ? where attachment_id in " +
                                    sql.listPrepared(attachments.toArray()), parameters);

                            sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                        }
                    }
                }));
            } else {
                //insert lesson
                sql.insert("diary.lesson", lessonObject, "lesson_id", validUniqueResultHandler(handler));
            }
        }
    }

    @Override
    public void retrieveLesson(String lessonId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM diary.lesson as l WHERE l.lesson_id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(lessonId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void updateLesson(final String lessonId, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler) {
        if(lessonObject != null) {
            super.update(lessonId, lessonObject, handler);
        }
    }

    @Override
    public void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(lessonId, handler);
    }

    /**
     * Controls the date format. Must be yyyy-MM-dd.
     */
    private boolean isDateValid(String date) {
        if (date == null || !date.matches(DateUtils.DATE_FORMAT_REGEX))
            return false;
        SimpleDateFormat df = new SimpleDateFormat(DateUtils.DATE_FORMAT);
        df.setLenient(false);
        try {
            df.parse(date);
            return true;
        } catch (ParseException ex) {
            return false;
        }
    }
}
