package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
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

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validResultHandler;
import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {

    private final static String DATABASE_TABLE ="homework";
    private final static Logger log = LoggerFactory.getLogger("HomeworkServiceImpl");
    private static final String ID_TEACHER_FIELD_NAME = "teacher_id";

    public HomeworkServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }

    @Override
    public void getAllHomeworksForALesson(String lessonId, Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.homework_id, h.lesson_id, h.subject_code, h.subject_label, h.school_id,")
                .append(" h.audience_type, h.audience_id, h.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.homework_type as th ON h.homework_type_id = th.homework_type_id")
                .append(" JOIN diary.lesson as l ON l.lesson_id = h.lesson_id")
                .append(" WHERE h.lesson_id = ?")
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray parameters = new JsonArray().add(Sql.parseId(lessonId));

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForTeacher(String schoolId, String teacherId, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.homework_id, h.lesson_id, h.subject_code, h.subject_label, h.school_id,")
                .append(" h.audience_type, h.audience_id, h.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.homework_type as th ON h.homework_type_id = th.homework_type_id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.lesson_id = t.lesson_id")
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
        query.append("SELECT h.homework_id, h.lesson_id, h.subject_code, h.subject_label, h.school_id,")
                .append(" h.audience_type, h.audience_id, h.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.homework_type as th ON h.homework_type_id = th.homework_type_id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.lesson_id = t.lesson_id")
                .append(" WHERE h.school_id = ? AND h.audience_id in ")
                .append(sql.listPrepared(groupIds.toArray()))
                .append(" AND h.homework_due_date < current_date")
                .append(" AND h.homework_due_date >= to_date(?,'YYYY-MM-DD') AND h.homework_due_date <= to_date(?,'YYYY-MM-DD')")
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
        query.append("SELECT * FROM diary.homework as h WHERE h.homework_id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(homeworkId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void createHomework(final JsonObject homeworkObject, final String teacherId, final Handler<Either<String, JsonObject>> handler) {
        if(homeworkObject != null) {
            final JsonArray attachments = homeworkObject.getArray("attachments");
            homeworkObject.putString(ID_TEACHER_FIELD_NAME, teacherId);
            if(attachments != null && attachments.size() > 0) {
                //get next on the sequence to add the homework and value in FK on attachment

                sql.raw("select nextval('diary.homework_homework_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
                    @Override
                    public void handle(Either<String, JsonObject> event) {
                        if (event.isRight()) {
                            log.debug(event.right().getValue());
                            Long nextId = event.right().getValue().getLong("next_id");
                            homeworkObject.putNumber("homework_id", nextId);

                            JsonArray parameters = new JsonArray().add(nextId);
                            for (Object id: attachments) {
                                parameters.add(id);
                            }

                            SqlStatementsBuilder sb = new SqlStatementsBuilder();
                            sb.insert("diary.homework", homeworkObject, "homework_id");
                            sb.prepared("update diary.attachment set homework_id = ? where attachment_id in " +
                                    sql.listPrepared(attachments.toArray()), parameters);

                            sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                        }
                    }
                }));
            } else {
                //insert lesson
                sql.insert("diary.homework", homeworkObject, "homework_id", validUniqueResultHandler(handler));
            }
        }
    }

    @Override
    public void updateHomework(String homeworkId, JsonObject homeworkObject, Handler<Either<String, JsonObject>> handler) {
        if(homeworkObject != null) {
            super.update(homeworkId, homeworkObject, handler);
        }
    }

    @Override
    public void deleteHomework(final String  homeworkId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(homeworkId, handler);
    }
}

