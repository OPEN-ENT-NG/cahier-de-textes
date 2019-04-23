package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
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
        JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
        JsonArray types = new JsonArray();
        JsonObject action = new JsonObject().put("action", "structure.getAllStructures").put("types", types);

        String homeworkTypeQuery = "SELECT DISTINCT structure_id as struct from " + Diary.DIARY_SCHEMA + ".homework_type";
        String sessionTypeQuery = "SELECT DISTINCT structure_id as struct from " + Diary.DIARY_SCHEMA + ".session_type";
        Future<JsonArray> HomeworkType = Future.future();
        sql.raw(homeworkTypeQuery, SqlResult.validResultHandler(event -> {
            JsonArray structuresHomeworkTypeRegistered = new JsonArray();
            for(int i = 0; i < event.right().getValue().size(); i++){
                structuresHomeworkTypeRegistered.add(event.right().getValue().getJsonObject(i).getString("struct"));
            }
            if (event.isRight()) {
                HomeworkType.complete(structuresHomeworkTypeRegistered);
            } else {
                HomeworkType.fail("Error while initialising HomeworkType");
            }
        }));

        Future<JsonArray> SessionType = Future.future();
        sql.raw(sessionTypeQuery, SqlResult.validResultHandler(event -> {
            JsonArray structuresSessionTypeRegistered = new JsonArray();
            for(int i = 0; i < event.right().getValue().size(); i++){
                structuresSessionTypeRegistered.add(event.right().getValue().getJsonObject(i).getString("struct"));
            }
            if (event.isRight()) {
                SessionType.complete(structuresSessionTypeRegistered);
            } else {
                SessionType.fail("Error while initialising SessionType");
            }
        }));

        Future<JsonArray> structureIdList = Future.future();
        eb.send("viescolaire", action, handlerToAsyncHandler(event -> {
            JsonObject body = event.body();
            if ("ok".equals(body.getString("status"))) {
                JsonArray structList = body.getJsonArray("results");
                structureIdList.complete(structList);
            } else {
                structureIdList.fail("Error while initialising structureIdList");
            }
        }));

        CompositeFuture.all(HomeworkType, SessionType, structureIdList).setHandler( event -> {
            if (event.succeeded()) {
                for (int i = 0; i < structureIdList.result().size(); i++) {
                    if (!HomeworkType.result().contains(structureIdList.result().getJsonObject(i).getString("s.id"))) {
                        statements.add(initHomeworkType(structureIdList.result().getJsonObject(i).getString("s.id")));
                    }
                    if (!SessionType.result().contains(structureIdList.result().getJsonObject(i).getString("s.id"))) {
                        statements.add(initSessionType(structureIdList.result().getJsonObject(i).getString("s.id")));
                    }
                }
                statements.add(getHomeworkStateInitStatement());
                sql.transaction(statements, event1 -> {
                    Number id = Integer.parseInt("1");
                    handler.handle(SqlQueryUtils.getTransactionHandler(event1, id));
                });
            }
        });
    }

    private JsonObject initHomeworkType(String structId) {
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".homework_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) , (?, ?, ?) ;";

        JsonArray params = new JsonArray().add(structId).add("Exercice(s)").add(1)
                .add(structId).add("Devoir maison").add(2)
                .add(structId).add("Autre").add(3);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params )
                .put(ACTION, PREPARED);
    }

    private JsonObject initSessionType(String structId) {

        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".session_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) ;";

        JsonArray params = new JsonArray().add(structId).add("Cours").add(1)
                .add(structId).add("Autre").add(2);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params )
                .put(ACTION, PREPARED);
    }


    private JsonObject getHomeworkStateInitStatement() {

        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".homework_state (id,label) values( 1 ,'todo') , ( 2 , 'done') ON CONFLICT DO NOTHING;";

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, new JsonArray())
                .put(ACTION, PREPARED);
    }
}
