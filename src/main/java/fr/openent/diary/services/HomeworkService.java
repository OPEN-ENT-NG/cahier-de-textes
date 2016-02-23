package fr.openent.diary.services;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface HomeworkService {

    void getAllHomeworksForALesson(final String teacherId, final String schoolId, final String lessonId, final Handler<JsonObject> handler);

    /**
     * Gets all the homeworks not related to a lesson.
     * TODO : add time limits?
     */
    void getAllFreeHomeworks(final String teacherId, final String schoolId, final Handler<JsonObject> handler);
}
