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
    public void init(final Handler<String> handler) {
        final List<Future> futureMyResponse1Lst = new ArrayList<>();
        JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
//            statements.add(getHomeworkStateInitStatement());
//
            Future<JsonObject> resp1FutureComposite = Future.future();
            futureMyResponse1Lst.add(resp1FutureComposite);
            JsonArray types = new JsonArray();
            JsonObject action = new JsonObject()
                    .put("action", "structure.getStructuresActives")
                    .put("types", types);
            eb.send("viescolaire", action, handlerToAsyncHandler(new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> message) {
                    JsonObject body = message.body();
                    if ("ok".equals(body.getString("status"))) {
                        JsonArray structList = body.getJsonArray("results");
                        for (Integer k = 0; k < structList.size(); k++) {
                            statements.add(initHomeworkType(structList.getJsonObject(k)));
                        }
                        resp1FutureComposite.complete();
                    }
                }
            }));

        CompositeFuture.all(futureMyResponse1Lst).setHandler(

                event -> handler.handle("success"));
//
//        try {
//            JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
////            statements.add(getHomeworkStateInitStatement());
////
//
//
//            sql.transaction(statements, new Handler<Message<JsonObject>>() {
//                @Override
//                public void handle(Message<JsonObject> event) {
//                    Number id = Integer.parseInt("1");
//                    handler.handle(SqlQueryUtils.getTransactionHandler(event,id));
//                }
//            });
//        } catch (ClassCastException e) {
//            LOGGER.error("An error occurred when insert progression", e);
//            handler.handle(new Either.Left<String, JsonObject>(""));
//
//        }


    }

    private JsonObject initHomeworkType(JsonObject jsonObject) {

        String query = "INSERT INTO diary.homework_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) , (?, ?, ?) ;";

        JsonArray params = new JsonArray().add(jsonObject.getString("id")).add("Exercice(s)").add(1)
                .add(jsonObject.getString("id")).add("Devoir maison").add(2)
                .add(jsonObject.getString("id")).add("Autre").add(3);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params )
                .put(ACTION, PREPARED);
    }

    public JsonObject getHomeworkStateInitStatement() {

        String query = "INSERT INTO diary.homework_progress (id,label) values( 1 ,'todo') , ( 2 , 'done') ;";

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, new JsonArray())
                .put(ACTION, PREPARED);
    }
}
