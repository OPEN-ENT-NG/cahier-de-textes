package fr.openent.diary.services;

import fr.openent.diary.models.Subject;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface SubjectService {

    /**
     * get list of subject fetched from your subjectIds
     *
     * @param subjectsId        list subject identifiers
     * @param handler           Function handler returning data or future
     */
    void getSubjects(JsonArray subjectsId, Handler<AsyncResult<List<Subject>>> handler);

    void getSubjects(JsonArray subjectsId, Promise<List<Subject>> promise);

    void getSubjects(String structureId, Promise<List<Subject>> promise);

    void getSubjects(String structureId, Handler<AsyncResult<List<Subject>>> handler);

    void getExceptionalLabels(String structureId, Handler<AsyncResult<JsonObject>> handler);
}
