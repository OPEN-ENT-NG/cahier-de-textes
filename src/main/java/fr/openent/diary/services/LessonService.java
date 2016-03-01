package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.entcore.common.service.CrudService;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.Date;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface LessonService extends CrudService {

    void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllLessonsForStudent(final String schoolId, final String groupId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    //can create teacher if not exists + chains handler
    //return {idLesson=value} or error
    void createLesson(final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler);

    //use crud sql helper
    void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler);

}
