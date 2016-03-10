package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface HomeworkService {

    void getAllHomeworksForALesson(final String lessonId, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForStudent(final String schoolId, final List<String> groupIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void retrieveHomework(final String homeworkId, final Handler<Either<String, JsonObject>> handler);

    //TODO can create teacher if not exists + chains handler
    //return {idHomework=value} or error
    void createHomework(final JsonObject homeworkObject, final Handler<Either<String, JsonObject>> handler);

    void updateHomework(final String homeworkId, final JsonObject homeworkObject, final Handler<Either<String, JsonObject>> handler);

    void deleteHomework(final String  homeworkId, final Handler<Either<String, JsonObject>> handler);
}
