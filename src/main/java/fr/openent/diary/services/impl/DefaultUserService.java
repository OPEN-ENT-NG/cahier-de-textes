package fr.openent.diary.services.impl;

import fr.openent.diary.helper.UserHelper;
import fr.openent.diary.models.Person.User;
import fr.openent.diary.services.UserService;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

import java.util.List;

public class DefaultUserService implements UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultUserService.class);

    @Override
    public void getTeachers(JsonArray teachers, Handler<AsyncResult<List<User>>> handler) {
        String teacherQuery = "MATCH (u:User) WHERE u.id IN {teacherIds} RETURN u.id as id, " +
                "u.firstName as firstName, u.lastName as lastName, (u.lastName + ' ' + u.firstName) as displayName";

        Neo4j.getInstance().execute(teacherQuery, new JsonObject().put("teacherIds", teachers), Neo4jResult.validResultHandler(event -> {
            if (event.isLeft()) {
                String err = "[Diary@DefaultUserService::getTeachers] Failed to retrieve teachers";
                LOGGER.error(err);
                handler.handle(Future.failedFuture(err));
            } else {
                handler.handle(Future.succeededFuture(UserHelper.toUserList(event.right().getValue())));
            }
        }));
    }

    @Override
    public void getTeachers(JsonArray teachers, Future<List<User>> future) {
        getTeachers(teachers, event -> {
            if (event.failed()) {
                future.fail(event.cause());
            } else {
                future.complete(event.result());
            }
        });
    }
}
