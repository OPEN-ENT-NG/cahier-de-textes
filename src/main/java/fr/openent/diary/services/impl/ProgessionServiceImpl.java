package fr.openent.diary.services.impl;

import fr.openent.diary.services.ProgressionService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public class ProgessionServiceImpl implements ProgressionService {
    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        System.out.println("get");
    }

    @Override
    public void deleteProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        System.out.println("delete");

    }

    @Override
    public void updateProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        System.out.println("update");

    }
}
