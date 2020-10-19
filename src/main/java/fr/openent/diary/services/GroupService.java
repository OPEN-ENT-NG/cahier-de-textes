package fr.openent.diary.services;

import fr.openent.diary.models.Audience;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

import java.util.List;

public interface GroupService {

    /**
     * get list of groups/classes fetched from your group/classes id
     *
     * @param groups                list groups/classes identifiers
     * @param handler/future        Function/future handler returning data
     */
    void getGroups(JsonArray groups, Handler<AsyncResult<List<Audience>>> handler);

    void getGroups(JsonArray groups, Future<List<Audience>> future);
}
