package fr.openent.diary.services;

import fr.openent.diary.model.general.Audience;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface HomeworkService {

    void getAllHomeworksForALesson(final String userId, final String lessonId, final List<String> memberIds, final Handler<Either<String, JsonArray>> handler);

    /**
     * Retrieves all homework for a Teacher's context.
     * @param userId teacher's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups or User).
     * @param startDate starting date of the period from which to retrieve the homework.
     * @param endDate ending date of the period from which to retrieve the homework.
     * @param handler
     */
    void getAllHomeworksForTeacher(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForExternal(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getExternalHomeworkByLessonId (String userId, String lessonId, List<String> memberIds, Handler<Either<String, JsonArray>> handler);

    /**
     * Retrieves all homework for a Parent's context.
     * @param userId parent's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups, User and child id).
     * @param startDate starting date of the period from which to retrieve the homework.
     * @param endDate ending date of the period from which to retrieve the homework.
     * @param handler
     */
    void getAllHomeworksForParent(final String userId,  final String childId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    /**
     * Retrieves all homework for a Student's context.
     * @param userId student's identifier.
     * @param schoolIds list of structure's identifiers.
     * @param memberIds list of sharing members identifier (ENT groups or User).
     * @param startDate starting date of the period from which to retrieve the homework.
     * @param endDate ending date of the period from which to retrieve the homework.
     * @param handler
     */
    void getAllHomeworksForStudent(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);



    void retrieveHomework(final String homeworkId, final Handler<Either<String, JsonObject>> handler);

    //TODO can create teacher if not exists + chains handler
    //return {idHomework=value} or error

    /**
     * Creates a homework.
     * - Will auto create teacher with id teacherId if it does not exists
     * - Will auto create audience if it does not exists
     *
     * @param homeworkObject     Homework
     * @param teacherId          Teacher id
     * @param teacherDisplayName Displayed name of teacher
     * @param audience           Audience (will be auto-created on lesson update if it does not exists)
     * @param handler
     */
    void createHomework(final JsonObject homeworkObject, final String teacherId, final String teacherDisplayName, final Audience audience, final Handler<Either<String, JsonObject>> handler);

    void updateHomework(final String homeworkId, final JsonObject homeworkObject, final Handler<Either<String, JsonObject>> handler);

    void deleteHomework(final String  homeworkId, final Handler<Either<String, JsonObject>> handler);

    void deleteHomeworks(final List<String> homeworkIds, final Handler<Either<String, JsonObject>> handler);

    /**
     * Publishes a Homework, by setting the lesson_state to 'published'
     * @param homeworkId
     * @param handler
     */
    void publishHomework(final Integer homeworkId, final Handler<Either<String, JsonObject>> handler);

    void publishHomeworks(final List<Integer> homeworkIds, final Handler<Either<String, JsonObject>> handler);

    /**
     * Un-publishes homeworks
     * @param homeworkIds Array of id homeworks
     * @param handler
     */
    void unPublishHomeworks(final List<Integer> homeworkIds, final Handler<Either<String, JsonObject>> handler);


    /**
     * Init diary.homework_type table
     * @param schoolIds Structures of current logged in user
     * @param handler
     */
    void initHomeworkTypes(final List<String> schoolIds, final Handler<Either<String, JsonObject>> handler);

    /**
     * List existing homework types for specified school ids
     * @param schoolIds
     * @param handler
     */
    void listHomeworkTypes(final List<String> schoolIds, Handler<Either<String, JsonArray>> handler);

    /**
     * Get homeworks load for current week and current audience
     * @param currentDateFormatted Current date in YYYY-MM-DD format
     * @param audienceId Class/Group id
     * @param handler
     */
    void getHomeworksLoad(final String currentDateFormatted, String audienceId, Handler<Either<String, JsonArray>> handler);
}
