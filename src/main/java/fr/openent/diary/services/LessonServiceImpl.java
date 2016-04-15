package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.AudienceType;
import fr.openent.diary.utils.DateUtils;
import fr.openent.diary.utils.ResourceState;
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

import java.text.MessageFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.entcore.common.sql.SqlResult.*;

/**
 * Created by a457593 on 18/02/2016.
 */
public class LessonServiceImpl extends SqlCrudService implements LessonService {

    private DiaryService diaryService;

    private AudienceService audienceService;

    private final static String DATABASE_TABLE ="lesson";
    private final static Logger log = LoggerFactory.getLogger(LessonServiceImpl.class);
    private static final String ID_LESSON_FIELD_NAME = "lesson_id";
    private static final String ID_HOMEWORK_FIELD_NAME = "homework_id";
    private static final String LESSON_DATE_FIELD_NAME = "lesson_date";
    private static final String ID_TEACHER_FIELD_NAME = "teacher_id";

    public LessonServiceImpl(final DiaryService diaryService) {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
        this.diaryService = diaryService;
    }

    @Override
    public void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {

        if (isDateValid(startDate) && isDateValid(endDate)) {
            StringBuilder query = new StringBuilder();
            query.append("SELECT l.id as lesson_id, s.id as subject_id, s.subject_label, l.school_id, t.teacher_display_name,")
                    .append(" a.audience_type, l.audience_id, a.audience_label, l.lesson_title, lesson_room, l.lesson_color, l.lesson_state, ")
                    .append(" l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, h.id as homework_id ")
                    .append(" FROM diary.lesson AS l")
                    .append(" INNER JOIN diary.teacher as t ON t.id = l.teacher_id")
                    .append(" LEFT JOIN diary.homework as h ON l.id = h.lesson_id")
                    .append(" LEFT JOIN diary.subject as s ON s.id = l.subject_id")
                    .append(" LEFT JOIN diary.audience as a ON a.id = l.audience_id")
                    .append(" WHERE l.teacher_id = ? AND l.school_id = ?")
                    .append(" AND l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD')")
                    .append(" GROUP BY l.id, l.lesson_date, t.teacher_display_name, h.id, s.id, s.subject_label, a.audience_type, a.audience_label")
                    .append(" ORDER BY l.lesson_date ASC");

            JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId))
                    .add(startDate).add(endDate);

            sql.prepared(query.toString(), parameters, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {

                    if ("ok".equals(event.body().getString("status"))) {
                        final Either<String, JsonArray> ei = validResult(event);
                        if (ei.isRight()) {
                            JsonArray result = ei.right().getValue();

                            JsonArray resultRefined = new JsonArray();
                            if (result.size() > 0) {

                                Set<Long> homeworkIds = new HashSet<Long>();
                                JsonObject lastLesson = result.get(0);

                                for (int i = 0; i < result.size(); i++) {
                                    JsonObject lesson = result.get(i);

                                    log.debug("lesson is : " + lesson.getClass());
                                    Long idLesson = lesson.getLong(ID_LESSON_FIELD_NAME);
                                    log.debug("id lesson is : " + idLesson.toString());
                                    Long idHomework = lesson.getLong(ID_HOMEWORK_FIELD_NAME);
                                    log.debug("idHomework is : " + idHomework);

                                    if (!idLesson.equals(lastLesson.getLong(ID_LESSON_FIELD_NAME))) {
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
                            }

                            handler.handle(new Either.Right<String, JsonArray>(resultRefined));

                        } else {
                            handler.handle(new Either.Left<String, JsonArray>(ei.left().getValue()));
                        }
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
            query.append("SELECT l.id as lesson_id, s.subject_label, l.school_id, t.teacher_display_name,")
                    .append(" a.audience_type, l.audience_id, a.audience_label, l.lesson_title, lesson_room, l.lesson_color,")
                    .append(" l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, h.id as homework_id ")
                    .append(" FROM diary.lesson AS l")
                    .append(" JOIN diary.teacher as t ON t.teacher_id = l.teacher_id")
                    .append(" LEFT JOIN diary.homework as h ON l.id = h.lesson_id")
                    .append(" LEFT JOIN diary.subject as s ON s.id = l.subject_id")
                    .append(" LEFT JOIN diary.audience as a ON a.id = l.audience_id")
                    .append(" WHERE l.school_id = ? AND l.audience_id in ")
                    .append(sql.listPrepared(groupIds.toArray()))
                    .append(" AND l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD')")
                    .append(" AND l.lesson_state = 'published'")
                    .append(" GROUP BY l.id, l.lesson_date, t.teacher_display_name, h.id, s.subject_label, a.audience_type, a.audience_label")
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
                        final Either<String, JsonArray> ei = validResult(event);
                        if (ei.isRight()) {
                            JsonArray result = ei.right().getValue();

                            if (result.size() > 0) {
                                JsonArray resultRefined = new JsonArray();
                                Set<Long> homeworkIds = new HashSet<Long>();
                                JsonObject lastLesson = result.get(0);

                                for (int i = 0; i < result.size(); i++) {
                                    JsonObject lesson = result.get(i);

                                    log.debug("lesson is : " + lesson.getClass());
                                    Long idLesson = lesson.getLong(ID_LESSON_FIELD_NAME);
                                    log.debug("id lesson is : " + idLesson.toString());
                                    Long idHomework = lesson.getLong(ID_HOMEWORK_FIELD_NAME);
                                    log.debug("idHomework is : " + idHomework);
                                    String dateLesson = lesson.getString(LESSON_DATE_FIELD_NAME);
                                    log.debug("dateLesson is : " + dateLesson);

                                    if(!idLesson.equals(lastLesson.getLong(ID_LESSON_FIELD_NAME))){
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

                                    if (idHomework != null) {
                                        log.debug("add idHomework : " + idHomework);
                                        homeworkIds.add(idHomework);
                                    }

                                    lastLesson = lesson;
                                }

                                addLesson(resultRefined, homeworkIds, lastLesson);

                                handler.handle(new Either.Right<String, JsonArray>(resultRefined));
                            } else {
                                StringBuilder errorMessage = new StringBuilder("No results.");
                                handler.handle(new Either.Left<String, JsonArray>(errorMessage.toString()));
                            }
                        } else {
                            handler.handle(new Either.Left<String, JsonArray>(ei.left().getValue()));
                        }
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

    private void addLesson(JsonArray resultRefined, Set<Long> homeworkIds, JsonObject lastLesson) {
        JsonArray homeworks = new JsonArray(homeworkIds.toArray());
        lastLesson.putArray(ID_HOMEWORK_FIELD_NAME, homeworks);
        resultRefined.add(lastLesson);
    }

    /**
     * Creates a lesson.
     * To do so teacher and audience must exist in database thus they are auto-created if needed
     *
     * @param lessonObject       Lesson
     * @param teacherId          Teacher id
     * @param teacherDisplayName Displayed name of teacher
     * @param audienceId         Audience
     * @param schoolId           School id
     * @param audienceType       Type of audience
     * @param audienceLabel      Label of audience
     * @param handler
     */
    @Override
    public void createLesson(final JsonObject lessonObject, final String teacherId, final String teacherDisplayName, final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler) {

        if (lessonObject != null) {
            // auto-creates teacher if it does not exists
            diaryService.getOrCreateTeacher(teacherId, teacherDisplayName, new Handler<Either<String, JsonObject>>() {

                @Override
                public void handle(Either<String, JsonObject> event) {

                    if (event.isRight()) {
                        getOrCreateAudienceAndCreateLesson(lessonObject, teacherId, audienceId, schoolId, audienceType, audienceLabel, handler);
                    } else {
                        log.error("Teacher couldn't be retrieved or created.");
                        handler.handle(event.left());
                    }
                }
            });
        }
    }

    /**
     * Check audience exists and auto-creates it if needed then creates the lesson
     *
     * @param lessonObject  Lesson
     * @param teacherId     Teacher id
     * @param audienceId    Audience
     * @param schoolId      School id
     * @param audienceType  Audience type
     * @param audienceLabel Audience label
     * @param handler
     */
    private void getOrCreateAudienceAndCreateLesson(final JsonObject lessonObject, final String teacherId, final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler) {

        final AudienceServiceImpl audienceService = new AudienceServiceImpl();

        // check audiences exists and create it if needed
        audienceService.getOrCreateAudience(audienceId, schoolId, audienceType, audienceLabel, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {

                // audience exists or created we can then create lesson
                if (event.isRight()) {
                    final JsonArray attachments = lessonObject.getArray("attachments");
                    lessonObject.putString(ID_TEACHER_FIELD_NAME, teacherId);

                    if (attachments != null && attachments.size() > 0) {
                        createLessonWithAttachments(attachments, lessonObject, handler);
                    } else {
                        //insert lesson
                        sql.insert("diary.lesson", lessonObject, "id", validUniqueResultHandler(handler));
                    }
                } else {
                    log.error(MessageFormat.format("Error while getting or creating audience with id ?", audienceId));
                    handler.handle(event.left());
                }
            }
        });
    }

    /**
     * Adds attachments to lesson
     *
     * @param attachments  Attachments
     * @param lessonObject Lesson
     * @param handler
     */
    private void createLessonWithAttachments(final JsonArray attachments, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler) {

        sql.raw("select nextval('diary.lesson_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    log.debug(event.right().getValue());
                    Long nextId = event.right().getValue().getLong("next_id");
                    lessonObject.putNumber(ID_LESSON_FIELD_NAME, nextId);

                    JsonArray parameters = new JsonArray().add(nextId);
                    for (Object id : attachments) {
                        parameters.add(id);
                    }

                    SqlStatementsBuilder sb = new SqlStatementsBuilder();
                    sb.insert("diary.lesson", lessonObject, "id");
                    sb.prepared("update diary.attachment set lesson_id = ? where id in " +
                            sql.listPrepared(attachments.toArray()), parameters);

                    sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                }
            }
        }));
    }

    @Override
    public void retrieveLesson(String lessonId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT l.id as lesson_id, s.subject_label, l.school_id, l.teacher_id, a.audience_type,")
                .append(" l.audience_id, a.audience_label, l.lesson_title, l.lesson_room, l.lesson_color, l.lesson_date,")
                .append(" l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, l.lesson_state")
                .append(" FROM diary.lesson as l")
                .append(" LEFT JOIN diary.subject as s ON s.id = l.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = l.audience_id")
                .append(" WHERE l.id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(lessonId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void updateLesson(final String lessonId, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder sb = new StringBuilder();
        JsonArray values = new JsonArray();
        //TODO query without loops
        for (String attr : lessonObject.getFieldNames()) {
            if (attr.equals("lesson_date")) {
                sb.append(attr).append(" = to_date(?, 'YYYY-MM-DD'), ");
            } else if (attr.equals("lesson_start_time") || attr.equals("lesson_end_time")) {
                sb.append(attr).append(" = to_timestamp(?, 'hh24:mi:ss'), ");
            } else {
                sb.append(attr).append(" = ?, ");
            }
            values.add(lessonObject.getValue(attr));
        }

        sb.delete(sb.length() - 2, sb.length());
        String query =
                "UPDATE diary.lesson " +
                        " SET " + sb.toString() + //TODO Vincent you can manage create and update date + "modified = NOW() " +
                        "WHERE id = ? ";
        sql.prepared(query, values.add(Sql.parseId(lessonId)), validRowsResultHandler(handler));
    }


    @Override
    public void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(lessonId, handler);
    }

    @Override
    public void publishLesson(String lessonId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder lessonSb = new StringBuilder();
        JsonArray parameters = new JsonArray();
        parameters.add(Sql.parseId(lessonId));

        lessonSb.append("UPDATE diary.lesson SET lesson_state = '");
        lessonSb.append(ResourceState.PUBLISHED.toString()).append("' ");
        lessonSb.append("WHERE id = ? ");

        StringBuilder homeworkSb = new StringBuilder();
        homeworkSb.append("UPDATE diary.homework SET homework_state = '");
        homeworkSb.append(ResourceState.PUBLISHED.toString()).append("' ");
        homeworkSb.append("WHERE lesson_id = ? ");

        SqlStatementsBuilder transactionBuilder = new SqlStatementsBuilder();
        transactionBuilder.prepared(lessonSb.toString(), parameters);
        transactionBuilder.prepared(homeworkSb.toString(), parameters);
        sql.transaction(transactionBuilder.build(), validUniqueResultHandler(0, handler));
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
