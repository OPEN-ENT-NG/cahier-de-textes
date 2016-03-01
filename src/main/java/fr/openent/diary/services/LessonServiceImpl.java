package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.DateUtils;
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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class LessonServiceImpl extends SqlCrudService implements LessonService {

    private final static String DATABASE_TABLE ="lesson";
    private final static Logger log = LoggerFactory.getLogger("LessonServiceImpl");

    public LessonServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }


    @Override
    public void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT l.lesson_id, l.subject_code, l.subject_label, l.school_id, l.teacher_id, t.teacher_display_name,")
                .append("l.audience_type, l.audience_code, l.audience_label, l.lesson_title, lesson_room, l.lesson_color,")
                .append("l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, h.homework_id ")
                .append(" FROM diary.lesson AS l")
                .append(" JOIN diary.teacher as t ON t.teacher_id = l.teacher_id")
                .append(" LEFT JOIN diary.homework as h ON l.lesson_id = h.lesson_id")
                .append(" WHERE l.teacher_id = ? AND l.school_id = ?")
                .append(" GROUP BY l.lesson_id, t.teacher_display_name, h.homework_id")
                .append(" ORDER BY l.lesson_date ASC");

        JsonArray values = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), values, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {

                if ("ok".equals(event.body().getString("status"))) {
                    JsonArray result = event.body().getArray("results");

                    JsonArray resultRefined = new JsonArray();
                    List<Object> homeworkIds = new ArrayList<Object>();
                    JsonObject lastLesson = new JsonObject();

                    for (Object jsonObject : result) {
                        JsonObject lesson = (JsonObject) jsonObject;
                        String idLesson = lesson.getString("lesson_id");
                        String idHomework = lesson.getString("homework_id");

                        if(idLesson.compareTo(lastLesson.getString("lesson_id")) != 0){
                            addLesson(resultRefined, homeworkIds, lastLesson);
                            homeworkIds.clear();
                        } else {
                            if (idHomework != null && !idHomework.isEmpty()) {
                                homeworkIds.add(idHomework);
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

    }

    private void addLesson(JsonArray resultRefined, List<Object> homeworkIds, JsonObject lastLesson) {
        JsonArray homeworks = new JsonArray(homeworkIds);
        lastLesson.removeField("homework_id");
        lastLesson.putArray("homeworks", homeworks);
        resultRefined.add(lastLesson);
    }

    @Override
    public void getAllLessonsForStudent(final String schoolId, final String groupId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT l.lesson_id, l.subject_code, l.subject_label, l.school_id, l.teacher_id, t.teacher_display_name,")
                .append("l.audience_type, l.audience_code, l.audience_label, l.lesson_title, lesson_room, l.lesson_color,")
                .append("l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, h.homework_id ")
                .append(" FROM diary.lesson AS l")
                .append(" JOIN diary.teacher as t ON t.teacher_id = l.teacher_id")
                .append(" LEFT JOIN diary.homework as h ON l.lesson_id = h.lesson_id")
                .append(" WHERE l.audience_code = ? AND l.school_id = ?")
                .append(" GROUP BY l.lesson_id, t.teacher_display_name, h.homework_id")
                .append(" ORDER BY l.lesson_date ASC");

        JsonArray values = new JsonArray().add(Sql.parseId(groupId)).add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), values, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {

                if ("ok".equals(event.body().getString("status"))) {
                    JsonArray result = event.body().getArray("results");

                    JsonArray resultRefined = new JsonArray();
                    List<Object> homeworkIds = new ArrayList<Object>();
                    JsonObject lastLesson = new JsonObject();

                    for (Object jsonObject : result) {
                        JsonObject lesson = (JsonObject) jsonObject;
                        String idLesson = lesson.getString("lesson_id");
                        String dateLesson = lesson.getString("lesson_date");
                        String idHomework = lesson.getString("homework_id");

                        if(idLesson.compareTo(lastLesson.getString("lesson_id")) != 0){
                            addLesson(resultRefined, homeworkIds, lastLesson);
                            homeworkIds.clear();
                        } else {
                            if (idHomework != null && !idHomework.isEmpty()) {
                                //don't display homeworks with lesson date > now
                                try {
                                    if (DateUtils.parseDate(dateLesson).before(new Date())) {
                                        homeworkIds.add(idHomework);
                                    }
                                } catch (ParseException e) {
                                    handler.handle(new Either.Left<String, JsonArray>(e.getMessage()));
                                }
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
    public void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(lessonId, handler);
    }
}
