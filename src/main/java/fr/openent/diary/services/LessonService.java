package fr.openent.diary.services;

import fr.openent.diary.model.general.Audience;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.CrudService;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface LessonService extends CrudService {

    /**
     * Retrieves all lessons for a Teacher's context.
     * @param userId teacher's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups or User).
     * @param startDate starting date of the period from which to retrieve the lessons.
     * @param endDate ending date of the period from which to retrieve the lessons.
     * @param handler
     */
    void getAllLessonsForTeacher(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);


    void getAllLessonsForExternal(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    /**
     * Retrieves all lessons for a Parent's context.
     * @param userId parent's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups, User and child id).
     * @param startDate starting date of the period from which to retrieve the lessons.
     * @param endDate ending date of the period from which to retrieve the lessons.
     * @param handler
     */
    void getAllLessonsForParent(final String userId,  final String childId,final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    /**
     * Retrieves all lessons for a Student's context.
     * @param userId student's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups or User).
     * @param startDate starting date of the period from which to retrieve the lessons.
     * @param endDate ending date of the period from which to retrieve the lessons.
     * @param handler
     */
    void getAllLessonsForStudent(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

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

    void deleteLessons(final List<String> lessonIds, final Handler<Either<String, JsonObject>> handler);

    /**
     * Publishes a Lesson, by setting the lesson_state to 'published'.
     * Also publishes all linked homeworks.
     *
     * @param lessonId
     * @param handler
     */
    void publishLesson(final String lessonId, final UserInfos userInfos,final Handler<Either<String, JsonObject>> handler);

    /**
     * Publishes lessons
     * @param lessonIds
     * @param handler
     */
    void publishLessons(final List<String> lessonIds,final UserInfos userInfos, final Handler<Either<String, JsonObject>> handler);

    /**
     * Un-publishes lessons
     * @param lessonIds
     * @param handler
     */
    void unPublishLessons(final List<String> lessonIds, final Handler<Either<String, JsonObject>> handler);
}
