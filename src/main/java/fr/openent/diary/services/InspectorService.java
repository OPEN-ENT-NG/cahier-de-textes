package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface InspectorService {

    void createInspectorHabilitation(JsonObject habilitation, Handler<Either<String, JsonArray>> handler);

    void deleteInspectorHabilitation(String inspectorId, String teacherId, String structureId, Handler<Either<String, JsonArray>> handler);

    void deleteInspector(String inspectorId, Handler<Either<String, JsonArray>> handler);

    void getInspectorHabilitations(String inspectorId, String structureId, UserInfos user, Handler<Either<String, JsonArray>> handler);
}
