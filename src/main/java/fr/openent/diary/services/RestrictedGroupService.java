package fr.openent.diary.services;

import fr.openent.diary.models.Notebook;
import fr.openent.diary.models.RestrictedGroup;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface RestrictedGroupService {

    /**
     * Fetch main notebooks (gathering of sessions/homeworks) todo edit
     *
     */
    Future<JsonObject> save(RestrictedGroup restrictedGroup, boolean isLegacySaved);
}
