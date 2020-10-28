package fr.openent.diary.homework;

import fr.openent.diary.services.impl.HomeworkServiceImpl;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.reflect.Whitebox;

import java.util.Arrays;
import java.util.List;


@RunWith(VertxUnitRunner.class)
public class HomeworkServiceTest {

    private Vertx vertx;
    private HomeworkServiceImpl homeworkService;
    private static final Logger log = LoggerFactory.getLogger(HomeworkServiceTest.class);
    private EventBus eb;

    @Before
    public void setUp(TestContext context) {
        /* Server mocked settings */
        vertx = Vertx.vertx();
        vertx.exceptionHandler(context.exceptionHandler());
        eb = vertx.eventBus();


        HttpServer server = vertx.createHttpServer().requestHandler(req -> req.response().end("test")).
                listen(8090, context.asyncAssertSuccess());

        /* Service(s) to test */
        this.homeworkService = new HomeworkServiceImpl("diary", eb);

    }

    @After
    public void after(TestContext context) {
        vertx.close(context.asyncAssertSuccess());
    }

    @Test(expected = NullPointerException.class)
    public void testCreateHomeworkWithNullUserThrowNullException(TestContext ctx) {
        Async async = ctx.async();
        homeworkService.createHomework(new JsonObject(), null, res -> {
            log.info(res);
            ctx.assertTrue(res.isLeft());
            async.complete();
        });
    }

    @Test
    public void testGetWhereContentGetHomeworkQueryHomeworkWithAllParameters(TestContext ctx)  {
        JsonArray values = new JsonArray();

        String startDate = "2020-10-20";
        String endDate = "2020-10-30";
        String structureID = "111";
        List<String> audienceIds = Arrays.asList("331", "332");
        List<String> teacherId = Arrays.asList("441", "442");
        String subjectId = "555";
        String ownerId = "222";

        try {
            String query = Whitebox.invokeMethod(homeworkService, "getWhereContentGetHomeworkQuery",
                    structureID, startDate, endDate,
                    ownerId, audienceIds, teacherId,
                    subjectId, false, values, "");
            query = query.trim();

            ctx.assertEquals("AND (h.due_date >= to_date(?,'YYYY-MM-DD') " +
                    "AND h.due_date <= to_date(?,'YYYY-MM-DD')) " +
                    "AND h.structure_id = ? AND h.audience_id IN (?,?) " +
                    "AND h.teacher_id IN (?,?) AND h.subject_id = ? " +
                    "AND h.owner_id = ?".trim(), query);

            ctx.assertEquals(
                    values,
                    new JsonArray()
                    .add(startDate)
                    .add(endDate)
                    .add(structureID)
                    .addAll(new JsonArray(audienceIds))
                    .addAll(new JsonArray(teacherId))
                    .add(subjectId)
                    .add(ownerId)
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGetWhereContentGetHomeworkQueryHomeworkWithoutUnrequiredParameters(TestContext ctx)  {
        JsonArray values = new JsonArray();
        try {
            String query = Whitebox.invokeMethod(homeworkService, "getWhereContentGetHomeworkQuery",
                    java.util.Optional.empty(), null, null,
                    null, null, null,
                    null, false, values, "");
            query = query.trim();

            ctx.assertEquals("".trim(), query);

            ctx.assertEquals(values, new JsonArray());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
