package fr.openent.diary.services;

import fr.openent.diary.models.Person.User;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

import java.util.List;

public interface UserService {

    /**
     * get list of teacher fetched from your teacherIds
     *
     * @param teachers                  list subject identifiers
     * @param handler/future            Function/future handler returning data
     */
    void getTeachers(JsonArray teachers, Handler<AsyncResult<List<User>>> handler);

    void getTeachers(JsonArray teachers, Future<List<User>> future);
}
