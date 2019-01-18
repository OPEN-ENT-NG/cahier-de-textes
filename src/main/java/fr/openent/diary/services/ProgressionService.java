package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public interface ProgressionService {
    void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler);

    void deleteProgressions(String ownerId, Handler<Either<String, JsonArray>> handler);

    void updateProgressions(String ownerId, Handler<Either<String, JsonArray>> handler);
}
