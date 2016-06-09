package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.Audience;
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

    @Override
    public void getAllHomeworksForALesson(String lessonId, Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.subject_id, h.school_id,")
                .append(" a.audience_type, h.audience_id, a.audience_label, h.homework_title, h.homework_color, h.homework_state,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label, h.homework_type_id")
                .append(" FROM diary.homework AS h")
                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT JOIN diary.lesson as l ON l.id = h.lesson_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" WHERE h.lesson_id = ?")
                .append(" AND l.lesson_state = h.homework_state") //TODO check this rule
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray parameters = new JsonArray().add(Sql.parseId(lessonId));

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForTeacher(String schoolId, String teacherId, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.subject_id, h.school_id, h.audience_id,")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color, h.homework_state,")
                .append(" h.homework_due_date, h.homework_description, h.homework_state, h.homework_type_id, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.id = h.lesson_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" WHERE h.teacher_id = ? AND h.school_id = ?")
                .append(" AND h.homework_due_date >= to_date(?,'YYYY-MM-DD') AND h.homework_due_date <= to_date(?,'YYYY-MM-DD')")
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId)).add(startDate).add(endDate);

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForStudent(String schoolId, List<String> groupIds, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        //TODO handle dates + modify current_date ?
        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.school_id, h.audience_id,")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.id = h.lesson_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" WHERE h.school_id = ? AND h.audience_id in ")
                .append(sql.listPrepared(groupIds.toArray()))
                .append(" AND h.homework_due_date < current_date")
                .append(" AND h.homework_due_date >= to_date(?,'YYYY-MM-DD') AND h.homework_due_date <= to_date(?,'YYYY-MM-DD')")
                .append(" AND h.homework_state = 'published'")
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray parameters = new JsonArray().add(Sql.parseId(schoolId));
        for (Object id: groupIds) {
            parameters.add(id);
        }
        parameters.add(startDate).add(endDate);

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void retrieveHomework(String homeworkId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.school_id, h.audience_id")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color,")
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

        sb.delete(sb.length() - 2, sb.length());
        String query =
                "UPDATE diary.homework " +
                        " SET " + sb.toString() + //TODO Vincent you can manage create and update date + "modified = NOW() " +
                        "WHERE id = ? ";
        sql.prepared(query, values.add(Sql.parseId(homeworkId)), validRowsResultHandler(handler));
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

        sb.append("UPDATE diary.homework SET homework_state = '").append(finalState).append("' ");
        sb.append("WHERE id in ");
        sb.append(sql.listPrepared(homeworkIds.toArray()));
        sb.append(" and homework_state = '").append(initialState).append("'");

        sql.prepared(sb.toString(), parameters, validRowsResultHandler(handler));
    }
}

