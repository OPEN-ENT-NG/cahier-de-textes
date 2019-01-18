package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.services.ProgressionService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.user.UserInfos;

public class ProgessionServiceImpl implements ProgressionService {
    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "SELECT title from diary.progression_session" +
                "WHERE owner_id = ?";
        params.add(ownerId);
       // Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void deleteProgressions(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from diray.progression_session" +
                "WHERE id = ?";


        params.add(progressionId);
     //   Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void updateProgressions(String progressionId, Handler<Either<String, JsonArray>> handler) {

        String query = "";


    }

    @Override
    public void progressionToSession(String idProgression, String idSession, Handler<Either<String, JsonArray>> handler) {

    }

    @Override
    public void createProgression(JsonObject progression, UserInfos user, Handler<Either<String, JsonObject>> handler) {

    }

    @Override
    public void deleteHomeworkProgression(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "DELETE from diray.progression_homework" +
                "WHERE id = ?";


        params.add(progressionId);
        //   Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }


}
