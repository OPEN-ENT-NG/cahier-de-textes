package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface SessionService {

    void getSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void getOwnSessions(String startDate, String endDate, String audienceId, String subjectId, UserInfos user, Handler<Either<String, JsonArray>> handler);

    void getExternalSessions(String startDate, String endDate, String type, String typeId, Handler<Either<String, JsonArray>> handler);

    void getChildSessions(String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler);

    void createSession(JsonObject session, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void updateSession(long sessionId, JsonObject session, Handler<Either<String, JsonObject>> handler);

    void deleteSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void publishSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void unpublishSession(long sessionId, Handler<Either<String, JsonObject>> handler);

}
