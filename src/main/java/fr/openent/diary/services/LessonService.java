package fr.openent.diary.services;

import fr.openent.diary.utils.Audience;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.CrudService;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface LessonService extends CrudService {

    void getAllLessonsForTeacher(final String schoolId, final String teacherId, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllLessonsForStudent(final String schoolId, final List<String> groupIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void retrieveLesson(final String lessonId, final Handler<Either<String, JsonObject>> handler);

    //return {idLesson=value} or error

    /**
     * Creates a lesson.
     * - Will auto create teacher with id teacherId if it does not exists
     * - Will auto create audience if it does not exists
     *
     * @param lessonObject       Lesson
     * @param teacherId          Teacher id
     * @param teacherDisplayName Displayed name of teacher
     * @param audience           Audience (will be auto-created on lesson update if it does not exists)
     * @param handler
     */
    void createLesson(final JsonObject lessonObject, final String teacherId, final String teacherDisplayName, final Audience audience, final Handler<Either<String, JsonObject>> handler);

    /**
     * Updates a lesson.
     * Audience data will automatically be created (table diary.audience)
     * if needed (on class/group change for example)
     *
     * @param lessonId     Lesson id
     * @param lessonObject Lesson object
     * @param handler
     */
    void updateLesson(final String lessonId, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler);

    //use crud sql helper
    void deleteLesson(final String lessonId, final Handler<Either<String, JsonObject>> handler);

    /**
     * Publishes a Lesson, by setting the lesson_state to 'published'.
     * Also publishes all linked homeworks.
     *
     * @param lessonId
     * @param handler
     */
    void publishLesson(final String lessonId, final Handler<Either<String, JsonObject>> handler);
}
