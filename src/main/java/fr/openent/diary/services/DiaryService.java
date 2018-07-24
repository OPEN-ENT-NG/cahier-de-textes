package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface DiaryService {
    void listChildren(final String parentId, final Handler<Either<String, JsonArray>> handler);

    void listGroupsFromChild(final List<String> childIds, final Handler<Either<String, JsonArray>> handler);

    void getAudienceFromChild(final String childId, final Handler<Either<String, JsonArray>> handler);
}
