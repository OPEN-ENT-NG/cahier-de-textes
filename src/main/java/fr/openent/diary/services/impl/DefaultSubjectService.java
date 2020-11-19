package fr.openent.diary.services.impl;

import fr.openent.diary.helper.SubjectHelper;
import fr.openent.diary.models.Subject;
import fr.openent.diary.services.SubjectService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;

import java.util.List;

public class DefaultSubjectService implements SubjectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultSubjectService.class);
    private final EventBus eb;

    public DefaultSubjectService(EventBus eb) {
        this.eb = eb;
    }

    public void getSubjects(JsonArray subjectsId, Handler<AsyncResult<List<Subject>>> handler) {
        JsonObject action = new JsonObject()
                .put("action", "matiere.getSubjectsAndTimetableSubjects")
                .put("idMatieres", subjectsId);

        eb.send("viescolaire", action, event -> {
            JsonObject body = (JsonObject) event.result().body();
            if (event.failed() || "error".equals(body.getString("status"))) {
                String err = "[Diary@DefaultSubjectService::getSubjects] Failed to retrieve subjects";
                LOGGER.error(err);
                handler.handle(Future.failedFuture(err));
            } else {
                handler.handle(Future.succeededFuture(SubjectHelper.toSubjectList(body.getJsonArray("results"))));
            }
        });
    }

    @Override
    public void getSubjects(JsonArray subjectsId, Future<List<Subject>> future) {
        getSubjects(subjectsId, event -> {
            if (event.failed()) {
                future.fail(event.cause());
            } else {
                future.complete(event.result());
            }
        });
    }

    @Override
    public void getExceptionalLabels(String structureId, Handler<AsyncResult<JsonObject>> handler) {
        JsonObject query = new JsonObject().put("structureId", structureId);
        MongoDb.getInstance().distinct("courses", "exceptionnal", query,
                MongoDbResult.validActionResultHandler(either -> {
                    if(either.isLeft()) {
                        LOGGER.error("[Diary.DefaultSubjectService::getExceptionalLabels] Failed to retrieve exceptional" +
                                "subjects labels");
                        handler.handle(Future.failedFuture(either.left().getValue()));
                    } else {
                        handler.handle(Future.succeededFuture(either.right().getValue()));
                    }
                }));
    }
}
