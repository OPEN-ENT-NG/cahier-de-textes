package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.services.ProgressionService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

public class ProgessionServiceImpl implements ProgressionService {
    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT * from diary";


    }

    @Override
    public void deleteProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        System.out.println("delete");

    }

    @Override
    public void updateProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        System.out.println("update");

    }

    @Override
    public void progressionToSession(String idProgression, String idSession, Handler<Either<String, JsonArray>> handler) {

    }
}
