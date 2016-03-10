package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryServiceImpl extends SqlCrudService implements DiaryService {

    private final static String DATABASE_TABLE ="teacher"; //TODO handle attachments manually or the opposite?
    private final static Logger log = LoggerFactory.getLogger("DiaryServiceImpl");

    public DiaryServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }

    @Override
    public void retrieveTeacher(String teacherId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM diary.teacher as t WHERE t.teacher_id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void createTeacher(final JsonObject teacherObject, final Handler<Either<String, JsonObject>> handler) {
        if(teacherObject != null) {
            //insert teacher
            sql.insert("diary.teacher", teacherObject, "teacher_id", validUniqueResultHandler(handler));
        }
    }
}
