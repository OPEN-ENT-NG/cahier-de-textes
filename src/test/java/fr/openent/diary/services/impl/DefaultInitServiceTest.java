package fr.openent.diary.services.impl;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.sql.Sql;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.reflect.Whitebox;

import java.util.Arrays;
import java.util.List;

@RunWith(VertxUnitRunner.class)
public class DefaultInitServiceTest {

    private Vertx vertx;
    private DefautlInitService defautlInitService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        Sql.getInstance().init(vertx.eventBus(), "fr.openent.diary");
        this.defautlInitService = new DefautlInitService("diary", vertx.eventBus());
    }

    @Test
    public void testRetrieveInitializationStatus(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT initialized FROM diary.settings WHERE structure_id = ?;";
        JsonArray expectedParams = new JsonArray().add("structureId");

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        defautlInitService.retrieveInitializationStatus("structureId", null);
    }

    @Test
    public void testInit(TestContext ctx) {
        Async async = ctx.async();

        final Integer[] i = {0};
        List<String> expectedQuery = Arrays.asList("SELECT DISTINCT structure_id as struct from diary.homework_type WHERE structure_id = ?",
                "SELECT DISTINCT structure_id as struct from diary.session_type WHERE structure_id = ?");
        List<JsonArray> expectedParams = Arrays.asList(
                new JsonArray().add("structureId"),
                new JsonArray().add("structureId")
        );

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery.get(i[0]), body.getString("statement"));
            ctx.assertEquals(expectedParams.get(i[0]).toString(), body.getJsonArray("values").toString());
            if (i[0] == expectedParams.size() - 1) {
                async.complete();
            }
            i[0]++;
        });

        defautlInitService.init("structureId", null);
    }

    @Test
    public void testInitHomeworkType(TestContext ctx) throws Exception {
        JsonObject result = Whitebox.invokeMethod(this.defautlInitService, "initHomeworkType", "structureId");
        JsonArray params = new JsonArray().add("structureId").add("Exercice(s)").add(1)
                .add("structureId").add("Devoir maison").add(2)
                .add("structureId").add("Autre").add(3);
        String query = "INSERT INTO diary.homework_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) , (?, ?, ?) ;";
        ctx.assertEquals(result.toString(), new JsonObject()
                .put("statement", query)
                .put("values", params)
                .put("action", "prepared").toString());
    }

    @Test
    public void testInitSessionType(TestContext ctx) throws Exception {
        JsonObject result = Whitebox.invokeMethod(this.defautlInitService, "initSessionType", "structureId");
        JsonArray params = new JsonArray().add("structureId").add("Cours").add(1)
                .add("structureId").add("Autre").add(2);
        String query = "INSERT INTO diary.session_type (structure_id, label, rank) values (? ,? ,?) , (?, ?, ?) ;";
        ctx.assertEquals(result.toString(), new JsonObject()
                .put("statement", query)
                .put("values", params)
                .put("action", "prepared").toString());
    }

    @Test
    public void testInitSettingsStatement(TestContext ctx) {
        JsonObject result = this.defautlInitService.initSettingsStatement("structureId");
        JsonArray params = new JsonArray().add("structureId").add("structureId");
        String query = "INSERT INTO diary.settings(structure_id, initialized) VALUES (?, true) ON CONFLICT ON CONSTRAINT " +
                "settings_pkey DO UPDATE SET initialized = true WHERE settings.structure_id = ? ;";
        ctx.assertEquals(result.toString(), new JsonObject()
                .put("statement", query)
                .put("values", params)
                .put("action", "prepared").toString());
    }

    @Test
    public void testGetHomeworkStateInitStatement(TestContext ctx) throws Exception {
        JsonObject result = Whitebox.invokeMethod(this.defautlInitService, "getHomeworkStateInitStatement");
        JsonArray params = new JsonArray();
        String query = "INSERT INTO diary.homework_state (id,label) values( 1 ,'todo') , ( 2 , 'done') ON CONFLICT DO NOTHING;";
        ctx.assertEquals(result.toString(), new JsonObject()
                .put("statement", query)
                .put("values", params)
                .put("action", "prepared").toString());
    }
}
