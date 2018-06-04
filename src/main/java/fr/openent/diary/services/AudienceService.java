package fr.openent.diary.services;

import fr.openent.diary.model.general.Audience;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

/**
 * Created by a629001 on 12/04/2016.
 */
public interface AudienceService {

    /**
     * Retrieves audience by id if it does exist and store it in JSON object
     *
     * @param audienceId Id of audience (sql column: diary.audience.id)
     * @param handler
     */
    void retrieveAudience(final String audienceId, final Handler<Either<String, JsonObject>> handler);


    /**
     * Creates an audience (sql table: diary.audience)
     *
     * @param audience Audience
     * @param handler
     */
    void createAudience(final Audience audience, final Handler<Either<String, JsonObject>> handler);


    /**
     * Creates an audience (diary.audience) if it does not exist else retrieve it
     *
     * @param audience Audience
     * @param handler
     */
    void getOrCreateAudience(final Audience audience, final Handler<Either<String, JsonObject>> handler);


}
