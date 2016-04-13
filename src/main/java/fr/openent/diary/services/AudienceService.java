package fr.openent.diary.services;

import fr.openent.diary.utils.AudienceType;
import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by a629001 on 12/04/2016.
 */
public interface AudienceService  {

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
     * @param audienceId    Id audience (must be in UUID format)
     * @param schoolId      School Id (
     * @param audienceType  Type of audience (class or group)
     * @param audienceLabel Label of audience
     * @param handler
     */
    void createAudience(final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler);


    /**
     * Creates an audience (diary.audience) if it does not exist else retrieve it
     *
     * @param audienceId    Audience Id
     * @param schoolId      School Id (same as structure_id)
     * @param audienceType  Type of audience (generally 'class' or 'group')
     * @param audienceLabel Label of audience
     * @param handler
     */
    void getOrCreateAudience(final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler);


}
