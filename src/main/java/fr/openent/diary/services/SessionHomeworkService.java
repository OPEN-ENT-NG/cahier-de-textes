package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface SessionHomeworkService {

    /**
     * Create an array of homework(s) containing sessions
     *
     * @param sessionHomework   sessionHomework Object
     * @param user              user infos
     * @param handler           function handler returning data
     */
    void create(JsonObject sessionHomework, UserInfos user, Handler<Either<String, JsonObject>> handler);


    /**
     * Update an array of homework(s) containing sessions
     *
     * @param sessionHomework   sessionHomework Object
     * @param handler           function handler returning data
     */
    void update(JsonObject sessionHomework, Handler<Either<String, JsonObject>> handler);
}
