package fr.openent.diary.services.impl;

import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
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
import org.powermock.reflect.Whitebox;

import java.util.Arrays;
import java.util.Collections;

@RunWith(VertxUnitRunner.class)
public class DefaultNotebookServiceTest {

    private Vertx vertx;
    private DefaultNotebookService defaultNotebookService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        Sql.getInstance().init(vertx.eventBus(), "fr.openent.diary");
        this.defaultNotebookService = new DefaultNotebookService(vertx.eventBus(), vertx, null, new JsonObject());
    }

    @Test
    public void testGetSelectNotebookQuery(TestContext ctx) throws Exception {
        JsonArray params = new JsonArray().add("query");
        JsonArray expectedParams = new JsonArray(Arrays.asList("query","limit","offset"));
        String result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "ASC", null, "limit",
                "offset", params);
        String expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST LIMIT ? OFFSET ? ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query","limit"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "ASC", null, "limit",
                null, params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST LIMIT ? ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "ASC", null, null,
                null, params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "ASC", 1, "limit",
                "offset", params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST LIMIT 20 OFFSET 20 ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, false, "ASC", 1, null,
                null, params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST LIMIT 20 OFFSET 20 ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", true, false, "ASC", 1, null,
                null, params);
        expected = " SELECT COUNT(DISTINCT notebook_id) FROM notebooks";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "DESC", null, null,
                null, params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa DESC NULLS LAST ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);

        params = new JsonArray().add("query");
        expectedParams = new JsonArray(Arrays.asList("query"));
        result = Whitebox.invokeMethod(this.defaultNotebookService, "getSelectNotebookQuery", false, true, "other", null, null,
                null, params);
        expected = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ORDER BY visa ASC NULLS FIRST ";
        ctx.assertEquals(expected, result);
        ctx.assertEquals(expectedParams, params);
    }
}
