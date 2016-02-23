package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface LessonService {

    //TODO : add time limits?
    void getAllLessons(final String teacherId, final String schoolId, final Handler<Either<String, JsonArray>> handler);
}
