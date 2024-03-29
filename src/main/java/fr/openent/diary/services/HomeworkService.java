package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface HomeworkService {

    void getHomework(long homeworkId, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void getOwnHomeworks(String structureId,String startDate, String endDate, UserInfos user, String subjectId,
                         String teacherId, List<String> audienceIds, Handler<Either<String, JsonArray>> handler);

    void getExternalHomeworks(String startDate, String endDate, String teacherId, List<String> audienceIds, String subjectId, Handler<Either<String, JsonArray>> handler);

    void getChildHomeworks(String structureId, String startDate, String endDate, String childId, String subjectId, Handler<Either<String, JsonArray>> handler);

    void createHomework(JsonObject homework, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void updateHomework(long homeworkId,boolean publishedChanged, JsonObject homework, Handler<Either<String, JsonObject>> handler);

    void deleteHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void publishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void unpublishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void setProgressHomework(long homeworkId, String state, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void getHomeworkTypes(String structure_id, Handler<Either<String, JsonArray>> handler);

    void createHomeworkType(JsonObject homeworkType, Handler<Either<String, JsonObject>> handler);

    void updateHomeworkType(Integer id, JsonObject homeworkType, Handler<Either<String, JsonObject>> handler);

    void deleteHomeworkType(Integer id, String structure_id, Handler<Either<String, JsonObject>> handler);

    void getWorkload(String structureId, String audienceId, String dueDate, boolean isPublished, Handler<Either<String, JsonArray>> handler);

    void getHomeworkStudent(long homeworkId, String studentId, UserInfos user, Handler<Either<String, JsonObject>> handler);
}
