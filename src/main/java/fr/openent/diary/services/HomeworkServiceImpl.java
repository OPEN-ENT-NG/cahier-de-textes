package fr.openent.diary.services;

import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a457593 on 18/02/2016.
 */
public class HomeworkServiceImpl implements HomeworkService {
    @Override
    public void getAllHomeworksForALesson(String teacherId, String schoolId, String lessonId, Handler<JsonObject> handler) {

    }

    @Override
    public void getAllFreeHomeworks(String teacherId, String schoolId, Handler<JsonObject> handler) {

    }
}
