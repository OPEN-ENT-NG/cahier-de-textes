package fr.openent.diary.services;

import fr.openent.diary.utils.Audience;
import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface HomeworkService {

    void getAllHomeworksForALesson(final String lessonId, final UserInfos userInfos, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForTeacher(final List<String> schoolIds, final UserInfos userInfos, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForStudent(final List<String> schoolIds, final UserInfos userInfos, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

    void getAllHomeworksForParent(final List<String> schoolIds, final List<String> childClasses, final UserInfos userInfos, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler);

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
}
