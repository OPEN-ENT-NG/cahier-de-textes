package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.Audience;
import fr.openent.diary.utils.Context;
import fr.openent.diary.utils.ResourceState;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.*;

/**
 * Created by a457593 on 18/02/2016.
 */
public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {

    private DiaryService diaryService;
    private AudienceService audienceService;

    private final static String DATABASE_TABLE ="homework";
    private final static Logger log = LoggerFactory.getLogger(HomeworkServiceImpl.class);
    private static final String ID_TEACHER_FIELD_NAME = "teacher_id";
    private static final String ID_OWNER_FIELD_NAME = "owner";

    /**
     *
     * @param diaryService
     * @param audienceService
     */
    public HomeworkServiceImpl(final DiaryService diaryService, final AudienceService audienceService) {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
        this.diaryService = diaryService;
        this.audienceService = audienceService;
    }

    /**
     *
     * @param ctx User context (student/teacher/none)
     * @param schoolIds Structure ids
     * @param audienceIds Audiences
     * @param teacherId Teacher that created the homework
     * @param startDate Homework due date after this date
     * @param endDate Homework due date before this date
     * @param lessonId Filter homework belonging to this lesson
     * @param handler
     */
    private void getHomeworks(Context ctx, List<String> schoolIds, List<String> audienceIds, String teacherId, String startDate, String endDate, String lessonId, Handler<Either<String, JsonArray>> handler){

        final String DATE_FORMAT = "YYYY-MM-DD";
        JsonArray parameters = new JsonArray();

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.subject_id, h.school_id, h.audience_id,")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color, h.homework_state,")
                .append(" h.homework_due_date, h.homework_description, h.homework_state, h.homework_type_id, th.homework_type_label")

                .append(" FROM diary.homework AS h")

                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.id = h.lesson_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")

                .append(" WHERE 1 = 1 ");

        if (teacherId != null && !teacherId.trim().isEmpty()) {
            query.append(" AND h.teacher_id = ? ");
            parameters.add(Sql.parseId(teacherId));
        }

        if (schoolIds != null && !schoolIds.isEmpty()) {
            query.append(" AND h.school_id in ").append(sql.listPrepared(schoolIds.toArray()));
            for (String schoolId : schoolIds) {
                parameters.add(Sql.parseId(schoolId.trim()));
            }
        }

        if (audienceIds != null && !audienceIds.isEmpty()) {
            query.append(" AND h.audience_id in ").append(sql.listPrepared(audienceIds.toArray()));
            for (String audienceId : audienceIds) {
                parameters.add(Sql.parseId(audienceId.trim()));
            }
        }

        if (lessonId != null && !lessonId.isEmpty()) {
            query.append(" AND h.lesson_id = ? ");
            parameters.add(Sql.parseId(lessonId));
        }

        if (startDate != null && !startDate.trim().isEmpty()) {
            query.append(" AND h.homework_due_date >= to_date(?,'").append(DATE_FORMAT).append("') ");
            parameters.add(startDate.trim());
        }

        if (endDate != null && !endDate.trim().isEmpty()) {
            query.append(" AND h.homework_due_date <= to_date(?,'").append(DATE_FORMAT).append("') ");
            parameters.add(endDate.trim());
        }

        if (ctx == Context.STUDENT) {
            query.append(" AND h.homework_state = '").append(ResourceState.PUBLISHED.toString()).append("' ");
        }

        query.append(" ORDER BY h.homework_due_date ASC");

        log.debug(query);
        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForALesson(String lessonId, Handler<Either<String, JsonArray>> handler) {
        getHomeworks(Context.NONE, null, null, null, null, null, lessonId, handler);
    }

    @Override
    public void getAllHomeworksForTeacher(List<String> schoolIds, String teacherId, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        getHomeworks(Context.TEACHER, schoolIds, null, teacherId, startDate, endDate, null, handler);
    }

    @Override
    public void getAllHomeworksForStudent(List<String> schoolIds, List<String> groupIds, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        getHomeworks(Context.STUDENT, schoolIds, groupIds, null, startDate, endDate, null, handler);
    }

    @Override
    public void retrieveHomework(String homeworkId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.school_id as structureId, h.audience_id, h.subject_id, h.teacher_id, ")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color, h.homework_type_id, ")
                .append(" h.homework_due_date, h.homework_description, h.homework_state, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" WHERE h.id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(homeworkId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void createHomework(final JsonObject homeworkObject, final String teacherId, final String teacherDisplayName, final Audience audience, final Handler<Either<String, JsonObject>> handler) {
        if (homeworkObject != null) {
            stripNonHomeworkFields(homeworkObject);
            audienceService.getOrCreateAudience(audience, new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        diaryService.getOrCreateTeacher(teacherId, teacherDisplayName, new Handler<Either<String, JsonObject>>() {
                            @Override
                            public void handle(Either<String, JsonObject> event) {
                                if (event.isRight()) {
                                    final JsonArray attachments = homeworkObject.getArray("attachments");
                                    homeworkObject.putString(ID_TEACHER_FIELD_NAME, teacherId);
                                    homeworkObject.putString(ID_OWNER_FIELD_NAME, teacherId);
                                    if (attachments != null && attachments.size() > 0) {
                                        //get next on the sequence to add the homework and value in FK on attachment

                                        sql.raw("select nextval('diary.homework_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
                                            @Override
                                            public void handle(Either<String, JsonObject> event) {
                                                if (event.isRight()) {
                                                    log.debug(event.right().getValue());
                                                    Long nextId = event.right().getValue().getLong("next_id");
                                                    homeworkObject.putNumber("id", nextId);

                                                    JsonArray parameters = new JsonArray().add(nextId);
                                                    for (Object id : attachments) {
                                                        parameters.add(id);
                                                    }

                                                    SqlStatementsBuilder sb = new SqlStatementsBuilder();
                                                    sb.insert("diary.homework", homeworkObject, "id");
                                                    sb.prepared("update diary.attachment set homework_id = ? where id in " +
                                                            sql.listPrepared(attachments.toArray()), parameters);

                                                    sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                                                }
                                            }
                                        }));
                                    } else {
                                        //insert homework
                                        sql.insert("diary.homework", homeworkObject, "id", validUniqueResultHandler(handler));
                                    }
                                } else {
                                    log.error("Teacher couldn't be retrieved or created.");
                                    handler.handle(event.left());
                                }
                            }
                        });
                    } else {
                        log.error("Audience couldn't be retrieved or created.");
                        handler.handle(event.left());
                    }
                }
            });
        }
    }

    /**
     * fields not as column in table diary.homework so need to delete
     * else will crash on createHomework or updateHomework
     * TODO remove that try getting audience data from other object than homework JSON one
     * (see {@link fr.openent.diary.controllers.LessonController}
     *
     * @param homeworkObject
     */
    private void stripNonHomeworkFields(final JsonObject homeworkObject) {

        homeworkObject.removeField("audience_type");
        homeworkObject.removeField("audience_name");
    }

    @Override
    public void updateHomework(String homeworkId, JsonObject homeworkObject, Handler<Either<String, JsonObject>> handler) {

        // FIXME json sql do not work if SQL enum column
        homeworkObject.removeField("homework_state");
        stripNonHomeworkFields(homeworkObject);

        StringBuilder sb = new StringBuilder();
        JsonArray values = new JsonArray();
        //TODO query without loops
        for (String attr : homeworkObject.getFieldNames()) {
            if (attr.equals("homework_due_date")) {
                sb.append(attr).append(" = to_date(?, 'YYYY-MM-DD'), ");
            } else {
                sb.append(attr).append(" = ?, ");
            }
            values.add(homeworkObject.getValue(attr));
        }

        sb.append(" modified = NOW()");
        StringBuilder query = new StringBuilder("UPDATE diary.homework ");
        query.append(" SET ").append(sb.toString()).append("WHERE id = ? ");
        sql.prepared(query.toString(), values.add(Sql.parseId(homeworkId)), validRowsResultHandler(handler));
    }

    @Override
    public void deleteHomework(final String  homeworkId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(homeworkId, handler);
    }

    @Override
    public void deleteHomeworks(final List<String> homeworkIds, final Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("DELETE FROM diary.homework as h where h.id in ");
        query.append(sql.listPrepared(homeworkIds.toArray()));

        JsonArray parameters = new JsonArray();
        for (Object id : homeworkIds) {
            parameters.add(id);
        }

        sql.prepared(query.toString(), parameters, validRowsResultHandler(handler));
    }

    @Override
    public void publishHomework(Integer homeworkId, Handler<Either<String, JsonObject>> handler) {
        List<Integer> ids = new ArrayList<Integer>();
        ids.add(homeworkId);
        publishHomeworks(ids, handler);
    }

    @Override
    public void publishHomeworks(List<Integer> homeworkIds, Handler<Either<String, JsonObject>> handler) {
        changeHomeworksState(homeworkIds, ResourceState.DRAFT, ResourceState.PUBLISHED, handler);
    }

    /**
     * Unpublishes homeworks
     * @param homeworkIds Array of id homeworks
     * @param handler
     */
    @Override
    public void unPublishHomeworks(List<Integer> homeworkIds, Handler<Either<String, JsonObject>> handler) {
        changeHomeworksState(homeworkIds, ResourceState.PUBLISHED, ResourceState.DRAFT, handler);
    }

    /**
     * Change homework state
     * @param homeworkIds Array of homework ids
     * @param initialState Initial homework state
     * @param finalState Final homework state
     * @param handler
     */
    private void changeHomeworksState(List<Integer> homeworkIds, ResourceState initialState, ResourceState finalState, Handler<Either<String, JsonObject>> handler) {
        StringBuilder sb = new StringBuilder();
        JsonArray parameters = new JsonArray();
        for (Integer id : homeworkIds) {
            parameters.add(id);
        }

        sb.append("UPDATE diary.homework SET  modified = NOW(), homework_state = '").append(finalState).append("' ");
        sb.append("WHERE id in ");
        sb.append(sql.listPrepared(homeworkIds.toArray()));
        sb.append(" and homework_state = '").append(initialState).append("'");

        sql.prepared(sb.toString(), parameters, validRowsResultHandler(handler));
    }
}

