package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.general.Audience;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

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

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(audienceId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    /**
     * Creates an audience
     *
     * @param audience  Audience
     * @param handler
     */
    @Override
    public void createAudience(final Audience audience,  final Handler<Either<String, JsonObject>> handler) {
        if (StringUtils.isValidIdentifier(audience.getId())) {

            JsonObject audienceParams = new JsonObject();
            audienceParams.put(AUDIENCE_ID_FIELD_NAME, audience.getId());
            audienceParams.put(AUDIENCE_SCHOOL_ID_FIELD_NAME, audience.getSchoolId());
            audienceParams.put(AUDIENCE_LABEL_FIELD_NAME, audience.getAudienceLabel());
            audienceParams.put(AUDIENCE_TYPE_FIELD_NAME, audience.getAudienceType().name().toLowerCase());

            sql.insert(DiaryController.DATABASE_SCHEMA + "." + AUDIENCE_TABLE, audienceParams, AUDIENCE_ID_FIELD_NAME, validUniqueResultHandler(handler));
        } else {
            String errorMessage = "Invalid audience identifier.";
            handler.handle(new Either.Left<String, JsonObject>(errorMessage));
        }
    }

    /**
     * Create an audience if it does not exist in database (diary.audience)
     *
     * @param audience    Audience
     * @param handler
     */
    public void getOrCreateAudience(final Audience audience, final Handler<Either<String, JsonObject>> handler) {

        log.debug("getOrCreateAudience: " + audience.getId());

        if (StringUtils.isValidIdentifier(audience.getId())) {
            retrieveAudience(audience.getId(), new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        if (event.right().getValue().size() == 0) {
                            log.debug("No audience, create it");
                            createAudience(audience, handler);
                        } else {
                            log.debug("Audience found");
                            handler.handle(new Either.Right<String, JsonObject>(event.right().getValue().put("teacherFound", true)));
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
