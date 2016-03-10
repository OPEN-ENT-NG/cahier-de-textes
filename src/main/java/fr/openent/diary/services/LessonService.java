package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.entcore.common.service.CrudService;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.Date;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface LessonService extends CrudService {

    void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllLessonsForStudent(final String schoolId, final List<String> groupIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void retrieveLesson(final String lessonId, final Handler<Either<String, JsonObject>> handler);

    //TODO can create teacher if not exists + chains handler
    //return {idLesson=value} or error
    void createLesson(final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler);

    void updateLesson(final String lessonId, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler);

    //use crud sql helper
    void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler);

}
