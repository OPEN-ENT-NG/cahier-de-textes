package fr.openent.diary.services.impl;

import fr.openent.diary.core.constants.Field;
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
        retrieveSubjectsEb(action, handler);
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
    public void getSubjects(String structureId, Future<List<Subject>> future) {
        getSubjects(structureId, future::handle);
    }

    public void getSubjects(String structureId, Handler<AsyncResult<List<Subject>>> handler) {
        JsonObject action = new JsonObject()
                .put("action", "matiere.getSubjectsAndTimetableSubjects")
                .put("structureId", structureId);

        retrieveSubjectsEb(action, handler);
    }

    private void retrieveSubjectsEb(JsonObject action, Handler<AsyncResult<List<Subject>>> handler) {
        eb.request("viescolaire", action, event -> {
            if (event.failed()) {
                String err = String.format("[Diary@DefaultSubjectService::getSubjects] Failed to retrieve subjects %s", event.cause().getMessage());
                LOGGER.error(err);
                handler.handle(Future.failedFuture(err));
            } else if (Field.ERROR.equals(((JsonObject) event.result().body()).getString(Field.STATUS))) {
                String err = String.format("[Diary@DefaultSubjectService::getSubjects] Failed to retrieve subjects %s", ((JsonObject) event.result().body()).getString(Field.MESSAGE, ""));
                LOGGER.error(err);
                handler.handle(Future.failedFuture(err));
            } else {
                handler.handle(Future.succeededFuture(SubjectHelper.toSubjectList(((JsonObject) event.result().body()).getJsonArray(Field.RESULTS, new JsonArray()))));
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
