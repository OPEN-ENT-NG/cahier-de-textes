package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

public interface InitService {

    void retrieveInitializationStatus(String structure_id, final Handler<Either<String, JsonObject>> handler);

    void init(String structure_id, final Handler<Either<String, JsonObject>> handler);
}
