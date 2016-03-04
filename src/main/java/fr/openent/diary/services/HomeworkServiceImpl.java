package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {

    private final static String DATABASE_TABLE ="homework";
    private final static Logger log = LoggerFactory.getLogger("HomeworkServiceImpl");

    public HomeworkServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }

    @Override
    public void getAllHomeworksForALesson(String teacherId, String schoolId, String lessonId, Handler<JsonObject> handler) {

    }

    @Override
    public void getAllHomeworksForTeacher(String schoolId, String teacherId, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        //TODO handle dates
        StringBuilder query = new StringBuilder();
        query.append("SELECT h.homework_id, h.lesson_id, h.subject_code, h.subject_label, h.school_id,")
                .append(" h.audience_type, h.audience_code, h.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.homework_type as th ON h.homework_type_id = th.homework_type_id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.lesson_id = t.lesson_id")
                .append(" WHERE h.teacher_id = ? AND h.school_id = ?")
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray values = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), values, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForStudent(String schoolId, String groupId, String startDate, String endDate, Handler<Either<String, JsonArray>> handler) {

        //TODO handle dates + modify current_date ?
        StringBuilder query = new StringBuilder();
        query.append("SELECT h.homework_id, h.lesson_id, h.subject_code, h.subject_label, h.school_id,")
                .append(" h.audience_type, h.audience_code, h.audience_label, h.homework_title, h.homework_color,")
                .append(" h.homework_due_date, h.homework_description, th.homework_type_label")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.homework_type as th ON h.homework_type_id = th.homework_type_id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.lesson_id = t.lesson_id")
                .append(" WHERE h.audience_code = ? AND h.school_id = ?")
                .append(" AND h.homework_due_date < current_date")
                .append(" ORDER BY h.homework_due_date ASC");

        JsonArray values = new JsonArray().add(Sql.parseId(groupId)).add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), values, validResultHandler(handler));
    }

    @Override
    public void getAllFreeHomeworks(String teacherId, String schoolId, Handler<JsonObject> handler) {

    }
}

