package fr.openent.diary.services.impl;

import fr.openent.diary.helper.AudienceHelper;
import fr.openent.diary.models.Audience;
import fr.openent.diary.services.GroupService;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.List;

public class DefaultGroupService implements GroupService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultGroupService.class);
    private final EventBus eb;

    public DefaultGroupService(EventBus eb) {
        this.eb = eb;
    }

    @Override
    public void getGroups(JsonArray groupsId, Handler<AsyncResult<List<Audience>>> handler) {
        JsonObject action = new JsonObject()
                .put("action", "classe.getClassesInfo")
                .put("idClasses", groupsId);

        eb.send("viescolaire", action, event -> {
            JsonObject body = (JsonObject) event.result().body();
            if (event.failed() || "error".equals(body.getString("status"))) {
                String err = "[Diary@DefaultGroupService::getGroups] Failed to retrieve groups";
                LOGGER.error(err);
                handler.handle(Future.failedFuture(err));
            } else {
                handler.handle(Future.succeededFuture(AudienceHelper.toAudienceList(body.getJsonArray("results"))));
            }
        });
    }

    @Override
    public void getGroups(JsonArray groupsId, Future<List<Audience>> future) {
        getGroups(groupsId, event -> {
            if (event.failed()) {
                future.fail(event.cause());
            } else {
                future.complete(event.result());
            }
        });
    }
}
