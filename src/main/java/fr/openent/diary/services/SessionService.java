package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface SessionService {

    void getSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void getOwnSessions(String structureId, String startDate, String endDate, List<String> audienceIds, String subjectId, UserInfos user, Handler<Either<String, JsonArray>> handler);

    void getExternalSessions(String startDate, String endDate, String teacherId, String audienceId, Handler<Either<String, JsonArray>> handler);

    void getChildSessions(String structureId, String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler);

    void createSession(JsonObject session, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void updateSession(long sessionId, JsonObject session, Handler<Either<String, JsonObject>> handler);

    void deleteSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void publishSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void unpublishSession(long sessionId, Handler<Either<String, JsonObject>> handler);

    void getSessions(String structureId, String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                     List<String> listSubjectId, boolean published, boolean notPublished, boolean vised, boolean notVised, boolean agregVisas,
                     Handler<Either<String, JsonArray>> handler);

    void getSessionTypes(String structure_id, Handler<Either<String, JsonArray>> handler);

    void createSessionType(JsonObject sessionType, Handler<Either<String, JsonObject>> handler);

    void updateSessionType(Integer id, JsonObject sessionType, Handler<Either<String, JsonObject>> handler);

    void deleteSessionType(Integer id, String structure_id, Handler<Either<String, JsonObject>> handler);
}