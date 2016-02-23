package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import static org.entcore.common.sql.SqlResult.validResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class LessonServiceImpl extends SqlCrudService implements LessonService {

    private final static String DATABASE_TABLE ="seance";

    public LessonServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }


    //"subjectLabel":"Maths","lessonRoom":"112","lessonColor":"000000","className":"1ère F","startTimeLesson":"8h00","endTimeLesson":"10h00"
    @Override
    public void getAllLessons(String teacherId, String schoolId, Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT s.idSeance, s.libelleMatiere, s.salleSeance, s.couleurSeance, s.libelleClasse, s.dateSeance, s.debutSeance, s.finSeance")
                .append(" FROM diary.seance AS s")
                .append(" WHERE s.uidEnseignant = ? AND s.uaiEtablissement = ?")
                .append(" ORDER BY s.dateSeance ASC");

        JsonArray values = new JsonArray().add(Sql.parseId(teacherId)).add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), values, validResultHandler(handler));

    }
}
