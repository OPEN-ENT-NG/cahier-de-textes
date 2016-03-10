package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface DiaryService {

    void createTeacher(final JsonObject teacherObject, final Handler<Either<String, JsonObject>> handler);

    void retrieveTeacher(final String teacherId, final Handler<Either<String, JsonObject>> handler);
}
