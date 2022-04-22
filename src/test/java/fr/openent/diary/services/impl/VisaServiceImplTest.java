package fr.openent.diary.services.impl;

import io.vertx.core.Vertx;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.sql.Sql;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.reflect.Whitebox;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(VertxUnitRunner.class)
public class VisaServiceImplTest {

    private Vertx vertx;
    private VisaServiceImpl visaService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        vertx = Mockito.spy(vertx);
        Sql.getInstance().init(vertx.eventBus(), "fr.openent.diary");
        this.visaService = new VisaServiceImpl(null, vertx.eventBus(), vertx, new JsonObject("{\"exports\": {\"template-path\": \"\"}}"));
        this.visaService = Mockito.spy(this.visaService);
    }

    @Test
    public void testGetVisasFromSessionsAndHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "WITH visa_ids AS (SELECT visa_id FROM diary.session_visa WHERE  session_id IN (?,?) UNION" +
                " SELECT visa_id FROM diary.homework_visa WHERE  homework_id IN (?,?) ) SELECT * FROM diary.visa WHERE" +
                " structure_id = ? AND id IN (SELECT visa_id FROM visa_ids) ORDER BY created DESC";
        JsonArray expectedParams = new JsonArray(Arrays.asList("sessionsId1","sessionsId2","homeworkId1","homeworkId2","structure_id"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });
        List<String> sessionsIds = Arrays.asList("sessionsId1", "sessionsId2");
        List<String> homeworkIds = Arrays.asList("homeworkId1", "homeworkId2");
        this.visaService.getVisasFromSessionsAndHomework("structure_id", sessionsIds, homeworkIds, null);
    }

    @Test
    public void testGetVisaPdfDetails(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = " SELECT * FROM diary.visa visa WHERE visa.id = ?";
        JsonArray expectedParams = new JsonArray(Collections.singletonList("visaId"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        this.visaService.getVisaPdfDetails("visaId", null);
    }

    @Test
    public void testGet_VisaSession_Statement(TestContext ctx) throws Exception {
        JsonObject visa = new JsonObject()
                .put("homeworkIds", new JsonArray(Arrays.asList(10, 11)))
                .put("comment", "comment")
                .put("structure_id", "structure_id")
                .put("teacher_id", "teacher_id")
                .put("sessionIds", new JsonArray(Arrays.asList(21, 22, 23)))
                .put("pdf_details", "pdf_details")
                .put("owner_id", "owner_id")
                .put("created", "created")
                .put("modified", "modified");
        JsonObject result = Whitebox.invokeMethod(this.visaService, "get_VisaSession_Statement", visa);
        String expected = "{\"statement\":\"INSERT INTO diary.visa (comment, structure_id, teacher_id, nb_sessions, pdf_details, " +
                "owner_id, created, modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?);INSERT INTO diary.session_visa (session_id, visa_id) " +
                "VALUES (?, (SELECT currval(pg_get_serial_sequence('diary.visa', 'id'))));INSERT INTO diary.session_visa (session_id, " +
                "visa_id) VALUES (?, (SELECT currval(pg_get_serial_sequence('diary.visa', 'id'))));INSERT INTO diary.session_visa " +
                "(session_id, visa_id) VALUES (?, (SELECT currval(pg_get_serial_sequence('diary.visa', 'id'))));INSERT INTO " +
                "diary.homework_visa (homework_id, visa_id) VALUES (?, (SELECT currval(pg_get_serial_sequence('diary.visa', " +
                "'id'))));INSERT INTO diary.homework_visa (homework_id, visa_id) VALUES (?, (SELECT currval(pg_get_serial_sequence('diary.visa', " +
                "'id'))));\",\"values\":[\"comment\",\"structure_id\",\"teacher_id\",3,\"pdf_details\",\"owner_id\",\"created\"," +
                "\"modified\",21,22,23,10,11],\"action\":\"prepared\"}";

        ctx.assertEquals(expected, result.toString());
    }

    @Test
    public void testGetPDFName(TestContext ctx) {
        JsonObject visa = new JsonObject()
                .put("teacher_id", "teacher_id")
                .put("structure_id", "structure_id")
                .put("owner_id", "owner_id")
                .put("created", "created");
        ctx.assertEquals(this.visaService.getPDFName(visa), "teacher_id_structure_idowner_id_created.pdf");
    }
}
