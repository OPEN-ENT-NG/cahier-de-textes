package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.AudienceType;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a629001 on 13/04/2016.
 * <p>
 * Service for creating/getting audience data
 * Relative to diary.audience sql table
 *
 * @since 0.1
 */
public class AudienceServiceImpl extends SqlCrudService implements AudienceService {


    private final static Logger log = LoggerFactory.getLogger(AudienceServiceImpl.class);

    /**
     * Table audience name
     */
    private static final String AUDIENCE_TABLE = "audience";

    /**
     * Column name audience.id
     */
    private static final String AUDIENCE_ID_FIELD_NAME = "id";

    /**
     * Column name audience.school_id
     */
    private static final String AUDIENCE_SCHOOL_ID_FIELD_NAME = "school_id";

    /**
     * Column name audience.audience_type
     */
    private static final String AUDIENCE_TYPE_FIELD_NAME = "audience_type";

    /**
     * Column name audience.audience_label
     */
    private static final String AUDIENCE_LABEL_FIELD_NAME = "audience_label";


    /**
     * Creates an audience service instance
     */
    public AudienceServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, AUDIENCE_TABLE);
    }

    /**
     * @param audienceId Id of audience (sql column: diary.audience.id)
     * @param handler
     */
    @Override
    public void retrieveAudience(String audienceId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM ").append(DiaryController.DATABASE_SCHEMA).append(".").append(AUDIENCE_TABLE);
        query.append(" as t WHERE t.").append(AUDIENCE_ID_FIELD_NAME).append(" = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(audienceId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    /**
     * Creates an audience
     *
     * @param audienceId    Id audience (must be in UUID format)
     * @param schoolId      School Id/Structure Id (must be in UUID format)
     * @param audienceType  Type of audience (class or group)
     * @param audienceLabel Label of audience
     * @param handler
     */
    @Override
    public void createAudience(final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler) {
        if (StringUtils.isValidIdentifier(audienceId)) {

            JsonObject audienceParams = new JsonObject();
            audienceParams.putString(AUDIENCE_ID_FIELD_NAME, audienceId);
            audienceParams.putString(AUDIENCE_SCHOOL_ID_FIELD_NAME, schoolId);
            audienceParams.putString(AUDIENCE_LABEL_FIELD_NAME, audienceLabel);
            audienceParams.putString(AUDIENCE_TYPE_FIELD_NAME, audienceType.name().toLowerCase());

            sql.insert(DiaryController.DATABASE_SCHEMA + "." + AUDIENCE_TABLE, audienceParams, AUDIENCE_ID_FIELD_NAME, validUniqueResultHandler(handler));
        } else {
            String errorMessage = "Invalid audience identifier.";
            handler.handle(new Either.Left<String, JsonObject>(errorMessage));
        }
    }

    /**
     * Create an audience if it does not exist in database (diary.audience)
     *
     * @param audienceId    Audience Id
     * @param schoolId      School Id (same as structure_id)
     * @param audienceType  Type of audience (generally 'class' or 'group')
     * @param audienceLabel Label of audience
     * @param handler
     */
    public void getOrCreateAudience(final String audienceId, final String schoolId, final AudienceType audienceType, final String audienceLabel, final Handler<Either<String, JsonObject>> handler) {

        log.debug("getOrCreateAudience: " + audienceId);

        if (StringUtils.isValidIdentifier(audienceId)) {
            retrieveAudience(audienceId, new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        if (event.right().getValue().size() == 0) {
                            log.debug("No audience, create it");
                            createAudience(audienceId, schoolId, audienceType, audienceLabel, handler);
                        } else {
                            log.debug("Audience found");
                            handler.handle(new Either.Right<String, JsonObject>(event.right().getValue().putBoolean("teacherFound", true)));
                        }
                    } else {
                        log.debug("error while retrieve teacher");
                        handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                    }
                }
            });
        } else {
            String errorMessage = "Invalid audience identifier.";
            log.debug(errorMessage);
            handler.handle(new Either.Left<String, JsonObject>(errorMessage));
        }
    }

}
