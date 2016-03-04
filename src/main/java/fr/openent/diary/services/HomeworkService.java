package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface HomeworkService {

    void getAllHomeworksForALesson(final String schoolId, final String teacherId, final String lessonId, final Handler<JsonObject> handler);

    void getAllHomeworksForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForStudent(final String schoolId, final String groupId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);


    /**
     * Gets all the homeworks not related to a lesson.
     * TODO : add time limits?
     */
    void getAllFreeHomeworks(final String teacherId, final String schoolId, final Handler<JsonObject> handler);
}
