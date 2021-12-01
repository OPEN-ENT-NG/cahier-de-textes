package fr.openent.diary.services.impl;

import fr.openent.diary.db.DBService;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.models.RestrictedGroup;
import fr.openent.diary.services.RestrictedGroupService;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import org.entcore.common.mongodb.MongoDbResult;

import java.util.UUID;

public class DefaultRestrictedGroupService extends DBService implements RestrictedGroupService {
    private final static String table = "diary.restricted_groups";

    @Override
    public Future<JsonObject> save(RestrictedGroup restrictedGroup, boolean isLegacySaved) {
        Promise<JsonObject> promise = Promise.promise();

        if (isLegacySaved) restrictedGroup.setLegacyId(UUID.randomUUID().toString());
        JsonObject data = restrictedGroup.toJSON();
        data.remove("id");
        mongoDb.save(table, data, MongoDbResult.validResultHandler(FutureHelper.handlerJsonObject(promise)));

        return promise.future();
    }
}