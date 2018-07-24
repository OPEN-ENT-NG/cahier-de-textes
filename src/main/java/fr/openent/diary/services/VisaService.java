package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface VisaService {

    void createVisa(JsonObject visa, UserInfos user, Handler<Either<String, JsonArray>> handler);

    void updateVisa(long visaId, JsonObject visa, Handler<Either<String, JsonArray>> handler);

    void deleteVisa(long visaId, Handler<Either<String, JsonArray>> handler);
}
