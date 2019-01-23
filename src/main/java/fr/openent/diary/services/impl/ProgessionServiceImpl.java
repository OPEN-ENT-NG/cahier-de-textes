package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.services.ProgressionService;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.user.UserInfos;

public class ProgessionServiceImpl extends SqlCrudService implements ProgressionService {
    private static final String STATEMENT = "statement" ;
    private static final String VALUES = "values" ;
    private static final String ACTION = "action" ;
    private static final String PREPARED = "prepared" ;
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);

    public ProgessionServiceImpl(String table) {
        super(table);
    }

    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "SELECT title from diary.progression_session" +
                "WHERE owner_id = ?";
        params.add(ownerId);
        // Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void deleteProgressions(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from diray.progression_session" +
                "WHERE id = ?";


        params.add(progressionId);
        //   Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void updateProgressions(String progressionId, Handler<Either<String, JsonArray>> handler) {

        //String query = "UPDATE diary.progressions_session";


    }

    @Override
    public void progressionToSession(String idProgression, String idSession, Handler<Either<String, JsonArray>> handler) {

    }

    @Override
    public void createSessionProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler) {
        JsonArray params;
        String query = "INSERT INTO diary.progression_session" +
                "(subject_id,title, description, annotation, owner_id) " +
                "values ( ?, ?, ?, ?, ?)" +
                "RETURNING id;";
        params =  new JsonArray().add(progression.getString("subject_id"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"));

        Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void deleteHomeworkProgression(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "DELETE from diray.progression_homework" +
                "WHERE id = ?";


        params.add(progressionId);
        //   Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void createHomeworkProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler) {

    }

    @Override
    public void createFullProgression(JsonObject progression, Handler<Either<String, JsonObject>> handler) {
        String getIdQuery = "SELECT nextval('diary.progression_session_id_seq') as id";
        sql.raw(getIdQuery, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                        try {
                            final Number id = event.right().getValue().getInteger("id");
                            JsonArray homeworks = progression.getJsonArray("progression_homeworks");
                            JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
                            statements.add(getSessionCreationstatement(id,progression));

                            for (int i=0; i<homeworks.size();i++) {
                                statements.add(getHomeworkCreationStatement(id,homeworks.getJsonObject(i)));
                            }
                            sql.transaction(statements, new Handler<Message<JsonObject>>() {
                                @Override
                                public void handle(Message<JsonObject> event) {
                                    handler.handle(SqlQueryUtils.getTransactionHandler(event, id));
                                }
                            });
                        } catch (ClassCastException e) {
                           LOGGER.error("An error occurred when insert progression", e);
                            handler.handle(new Either.Left<String, JsonObject>(""));
                        }

                } else {
                    LOGGER.error("An error occurred when selecting next val");
                    handler.handle(new Either.Left<String, JsonObject>(""));
                }
            }



        }));
    }

    /**
     * Create insert request for a progression
     * @param id
     * @param progression
     * @return
     */
    private JsonObject getSessionCreationstatement(Number id, JsonObject progression) {
        String query = "INSERT INTO diary.progression_session ( id , subject_id ,title, description, annotation, owner_id) " +
                "values ( ?, ?, ?, ?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(id)
                .add(progression.getString("subject_id"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"));

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }
    /**
     * Create insert request for an homework from a progression session
     * @param id
     * @param homework
     * @return
     */
    private JsonObject getHomeworkCreationStatement(Number id, JsonObject homework) {
        String query = "INSERT INTO diary.progression_homework ( progression_session_id , subject_id, description, owner_id, type_id ) " +
                "values ( ?, ?, ?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(id)
                .add(homework.getString("subject_id"))
                .add(homework.getString("description"))
                .add(homework.getString("owner_id"))
                .add(homework.getInteger("type_id"));
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }
}