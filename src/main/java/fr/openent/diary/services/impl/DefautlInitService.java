package fr.openent.diary.services.impl;

import fr.openent.diary.services.InitService;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.SqlResult;

import java.util.ArrayList;
import java.util.List;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;

public class DefautlInitService  extends SqlCrudService implements InitService {
    private static final String STATEMENT = "statement" ;
    private static final String VALUES = "values" ;
    private static final String ACTION = "action" ;
    private static final String PREPARED = "prepared" ;
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);
    private EventBus eb;
    public DefautlInitService(String table, EventBus eb)
    {
        super(table);
        this.eb = eb;

    }

    @Override
    public void init(final  Handler<Either<String, JsonObject>> handler) {

        String structQuery = "SELECT DISTINCT structure_id as struct from diary.homework_type ";
        sql.raw(structQuery, SqlResult.validResultHandler(new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                JsonArray structuresRegistered = new JsonArray();
                for(Integer i = 0 ; i < event.right().getValue().size();i++){
                    structuresRegistered.add(event.right().getValue().getJsonObject(i).getString("struct"));
                }

                JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();

                JsonArray types = new JsonArray();
                JsonObject action = new JsonObject()
                        .put("action", "structure.getAllStructures")
                        .put("types", types);
                eb.send("viescolaire", action, handlerToAsyncHandler(new Handler<Message<JsonObject>>() {
                    @Override
                    public void handle(Message<JsonObject> message) {
                        JsonObject body = message.body();
                        if ("ok".equals(body.getString("status"))) {
                            JsonArray structList = body.getJsonArray("results");
                            for (Integer k = 0; k < structList.size(); k++) {
                                if(!structuresRegistered.contains(structList.getJsonObject(k).getString("s.id")))
                                    statements.add(initHomeworkType(structList.getJsonObject(k)));
                            }
                            statements.add(getHomeworkStateInitStatement());
                            try {
                                    sql.transaction(statements, new Handler<Message<JsonObject>>() {
                                        @Override
                                        public void handle(Message<JsonObject> event) {
                                            Number id = Integer.parseInt("1");
                                            handler.handle(SqlQueryUtils.getTransactionHandler(event, id));
                                        }
                                    });
                            } catch (ClassCastException e) {
                                LOGGER.error("An error occurred when init", e);
                                handler.handle(new Either.Left<String, JsonObject>(""));

                            }

                        }
                    }
                }));

            }
        }));

    }

    private JsonObject initHomeworkType(JsonObject jsonObject) {

        String query = "INSERT INTO diary.homework_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) , (?, ?, ?) ;";

        JsonArray params = new JsonArray().add(jsonObject.getString("s.id")).add("Exercice(s)").add(1)
                .add(jsonObject.getString("s.id")).add("Devoir maison").add(2)
                .add(jsonObject.getString("s.id")).add("Autre").add(3);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params )
                .put(ACTION, PREPARED);
    }

    public JsonObject getHomeworkStateInitStatement() {

        String query = "INSERT INTO diary.homework_state (id,label) values( 1 ,'todo') , ( 2 , 'done') ON CONFLICT DO NOTHING;";

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, new JsonArray())
                .put(ACTION, PREPARED);
    }
}
