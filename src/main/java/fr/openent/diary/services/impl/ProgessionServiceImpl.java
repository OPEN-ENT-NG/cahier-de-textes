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
    public void getProgression(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "SELECT ps.id, title, ps.description, ps.modified, ps.created, ps.subject_id ," +
                "array_to_json(array_agg(h.*)) as homeworks from diary.progression_session ps " +
                " LEFT JOIN ( " +
                "SELECT progression_homework.id as id , subject_id::VARCHAR, description::TEXT, progression_session_id, type_id, homework_type.label::VARCHAR as type_label, owner_id::VARCHAR, created, modified " +
                " FROM  diary.progression_homework " +
                "INNER JOIN diary.homework_type " +
                "  ON homework_type.id = progression_homework.type_id " +
                " ) h ON h.progression_session_id = ps.id" +
                " where ps.id = ? " +
                " GROUP BY ps.id"  ;

        params.add(progressionId);
        Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params =  new JsonArray();

        String query = "SELECT ps.id, title, ps.description, ps.modified, ps.created, ps.subject_id ," +
                "array_to_json(array_agg(h.*)) as homeworks from diary.progression_session ps " +
                " LEFT JOIN ( " +
                "SELECT progression_homework.id as id , subject_id::VARCHAR, description::TEXT, progression_session_id, type_id, homework_type.label::VARCHAR as type_label, owner_id::VARCHAR, created, modified " +
                " FROM  diary.progression_homework " +
                "INNER JOIN diary.homework_type " +
                "  ON homework_type.id = progression_homework.type_id " +
                " ) h ON h.progression_session_id = ps.id" +
                " where ps.owner_id = ? " +

                " GROUP BY ps.id" +
                " ORDER BY ps.modified";
        params.add(ownerId);
        Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void deleteProgressions(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from diary.progression_session" +
                " WHERE id = ?";


        params.add(progressionId);
        Sql.getInstance().prepared(query,params,SqlResult.validResultHandler(handler));

    }

    @Override
    public void updateProgressions(JsonObject progression, String progressionId, Handler<Either<String, JsonObject>> handler) {


        try {
            JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
            statements.add(getSessionUpdateStatement(progression,progressionId));

            if(progression.containsKey("progression_homeworks")) {
                JsonArray homeworks = progression.getJsonArray("progression_homeworks");

                for (int i = 0; i < homeworks.size(); i++) {
                    if(homeworks.getJsonObject(i).containsKey("id") && homeworks.getJsonObject(i).getInteger("id") != null){
                        statements.add(getUpdateProgressionHomeworksStatement(homeworks.getJsonObject(i)));

                    }else{
                        statements.add(getHomeworkCreationStatement(Integer.parseInt(progressionId),homeworks.getJsonObject(i)));
                    }
                }
            }
            sql.transaction(statements, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {
                    Number id = Integer.parseInt(progressionId);
                    handler.handle(SqlQueryUtils.getTransactionHandler(event,id));
                }
            });
        } catch (ClassCastException e) {
            LOGGER.error("An error occurred when insert progression", e);
        }



    }

    private JsonObject getSessionUpdateStatement(JsonObject progression, String progressionId) {
        JsonArray params;
        String query = "UPDATE diary.progression_session " +
                "SET subject_id = ? ,title = ? , description = ? , annotation = ?, owner_id = ? " +
                "Where progression_session.id = ?  ";
        params =  new JsonArray().add(progression.getString("subject_id"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"))
                .add(progressionId);

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    /**
     * Update the homeworks of a progression
     * @param homework
     *
     */
    private JsonObject getUpdateProgressionHomeworksStatement(JsonObject homework) {
        JsonArray params = new JsonArray();

        String query = "UPDATE diary.progression_homework " +
                "SET subject_id = ?, description = ?, owner_id = ? , type_id = ? " +
                "WHERE id = ?";

        params.add(homework.getString("subject_id"))
                .add(homework.getString("description"))
                .add(homework.getString("owner_id"))
                .add(homework.getInteger("type_id"))
                .add(homework.getInteger("id"));


        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
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