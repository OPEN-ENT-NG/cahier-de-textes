package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface HomeworkService {

    void getHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void getOwnHomeworks(String startDate, String endDate, UserInfos user, Handler<Either<String, JsonArray>> handler);

    void getExternalHomeworks(String startDate, String endDate, String type, String typeId, Handler<Either<String, JsonArray>> handler);

    void getChildHomeworks(String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler);

    void createHomework(JsonObject homework, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void updateHomework(long homeworkId, JsonObject homework, Handler<Either<String, JsonObject>> handler);

    void deleteHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void publishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void unpublishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler);

    void getHomeworkTypes(Handler<Either<String, JsonArray>> handler);

    void getWorkloadWeek(final String dateInWeek, final String audienceId, Handler<Either<String, JsonArray>> handler);
}
