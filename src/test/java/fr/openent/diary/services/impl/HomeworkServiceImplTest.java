package fr.openent.diary.services.impl;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.events.EventStore;
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
public class HomeworkServiceImplTest {
    private final EventStore eventStore = Mockito.mock(EventStore.class);
    private Vertx vertx;
    private HomeworkServiceImpl homeworkServiceImpl;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        Sql.getInstance().init(vertx.eventBus(), "fr.openent.diary");
        this.homeworkServiceImpl = new HomeworkServiceImpl("diary", vertx.eventBus(), eventStore);
    }

    @Test
    public void testGetHomeworkStudent(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT h.*, to_json(type) as type, to_json(progress_and_state) as progress FROM diary.homework" +
                " h LEFT JOIN diary.homework_type AS type ON type.id = h.type_id LEFT JOIN (   SELECT progress.*," +
                " homework_state.label as state_label   FROM diary.homework_progress progress   INNER JOIN diary.homework_state" +
                " ON progress.state_id = homework_state.id   WHERE  progress.user_id =  ? ) AS progress_and_state ON" +
                " (h.id = progress_and_state.homework_id) WHERE h.id = ? AND h.archive_school_year IS NULL";
        JsonArray expectedParams = new JsonArray().add("studentId").add(1);

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });
        this.homeworkServiceImpl.getHomeworkStudent(1, "studentId", null, event -> {
        });

    }

    @Test
    public void testGetHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = " SELECT h.*, to_json(type) as type, to_json(session) as session FROM diary.homework h LEFT" +
                " JOIN diary.homework_type AS type ON type.id = h.type_id LEFT JOIN diary.session AS session ON session.id" +
                " = h.session_id WHERE h.id = ? AND h.archive_school_year IS NULL";
        JsonArray expectedParams = new JsonArray().add(1);

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });
        this.homeworkServiceImpl.getHomework(1, null, event -> {
        });
    }

    @Test
    public void testCleanHomework(TestContext ctx) throws Exception {
        JsonObject jsonObject = new JsonObject();
        Whitebox.invokeMethod(this.homeworkServiceImpl, "cleanHomework", jsonObject);
        ctx.assertEquals(jsonObject.toString(), "{}");
        JsonObject dataType = new JsonObject().put("key1", "value1");
        JsonObject dataSession = new JsonObject().put("key2", "value2");
        JsonObject dataProgress = new JsonObject().put("key3", "value3");

        jsonObject.put("type", dataType.toString());
        jsonObject.put("session", dataSession.toString());
        jsonObject.put("progress", dataProgress.toString());

        Whitebox.invokeMethod(this.homeworkServiceImpl, "cleanHomework", jsonObject);

        ctx.assertEquals(jsonObject.getJsonObject("type"), dataType);
        ctx.assertEquals(jsonObject.getJsonObject("session"), dataSession);
        ctx.assertEquals(jsonObject.getJsonObject("progress"), dataProgress);
    }

    @Test
    public void testGetHomeworks(TestContext ctx) throws Exception {
        Async async = ctx.async();


        String expectedQuery = " WITH homework_filter AS ( SELECT h.*, to_json(homework_type) AS type  FROM diary.homework" +
                " h INNER JOIN diary.homework_type ON h.type_id = homework_type.id WHERE h.archive_school_year IS NULL AND" +
                " (h.due_date >= to_date(?,'YYYY-MM-DD') AND h.due_date <= to_date(?,'YYYY-MM-DD')) AND h.structure_id = ?" +
                " AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND" +
                " h.owner_id = ? )  SELECT h.* FROM homework_filter h LEFT JOIN diary.session s ON (h.session_id = s.id) ORDER  BY h.due_date ASC";
        JsonArray expectedParams = new JsonArray(Arrays.asList(
                "startDate", "endDate", "structureId", "audienceId1",
                "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId"
        ));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        List<String> listAudienceId = Arrays.asList("audienceId1", "audienceId2");
        List<String> listTeacherId = Arrays.asList("teacherId1", "teacherId2");

        Whitebox.invokeMethod(this.homeworkServiceImpl, "getHomeworks", "structureId", "startDate", "endDate", "ownerId",
                listAudienceId, listTeacherId, "subjectId", true, null);
    }

    @Test
    public void testGetWhereContentGetHomeworkQuery(TestContext ctx) throws Exception {
        List<String> listAudienceId = Arrays.asList("audienceId1", "audienceId2");
        List<String> listTeacherId = Arrays.asList("teacherId1", "teacherId2");

        JsonArray params = new JsonArray().add("value");
        String result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, null, null, null, null, false, params, "query");
        ctx.assertEquals(result, "query");
        ctx.assertEquals(params, new JsonArray().add("value"));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, null, null, null, null, true, params, "query");
        ctx.assertEquals(result, "query AND h.is_published = true");
        ctx.assertEquals(params, new JsonArray().add("value"));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, null, null, null, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND h.subject_id = ? AND h.is_published = true");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "subjectId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, null, null, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "teacherId1", "teacherId2", "subjectId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, null, listAudienceId, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                null, "ownerId", listAudienceId, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND h.owner_id = ?");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", null,
                "endDate", "ownerId", listAudienceId, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND h.owner_id = ?");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "", "startDate",
                "endDate", "ownerId", listAudienceId, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND (h.due_date >= to_date(?,'YYYY-MM-DD') AND h.due_date <= to_date(?,'YYYY-MM-DD'))" +
                " AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND h.owner_id = ?");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "startDate", "endDate", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId")));

        params = new JsonArray().add("value");
        result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getWhereContentGetHomeworkQuery", "structureID", "startDate",
                "endDate", "ownerId", listAudienceId, listTeacherId, "subjectId", true, params, "query");
        ctx.assertEquals(result, "query AND (h.due_date >= to_date(?,'YYYY-MM-DD') AND h.due_date <= to_date(?,'YYYY-MM-DD'))" +
                " AND h.structure_id = ? AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND h.owner_id = ?");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "startDate", "endDate", "structureID", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId")));
    }

    @Test
    public void testGetSelectHomeworkStudentQuery(TestContext ctx) throws Exception {
        JsonArray params = new JsonArray().add("value");
        String result = Whitebox.invokeMethod(this.homeworkServiceImpl, "getSelectHomeworkStudentQuery", "studentId", params);
        ctx.assertEquals(result, " SELECT h.*,  to_json(progress_and_state) as progress FROM homework_filter h INNER JOIN diary.homework_type AS type ON type.id = h.type_id LEFT JOIN ( SELECT progress.*, homework_state.label as state_label FROM diary.homework_progress progress INNER JOIN diary.homework_state ON progress.state_id = homework_state.id WHERE  progress.user_id = ? ) AS progress_and_state ON (h.id = progress_and_state.homework_id) ORDER BY h.due_date ASC");
        ctx.assertEquals(params, new JsonArray(Arrays.asList("value", "studentId")));
    }

    @Test
    public void testGetStudentHomeworks(TestContext ctx) throws Exception {
        Async async = ctx.async();


        String expectedQuery = " WITH homework_filter AS ( SELECT h.*, to_json(homework_type) AS type  FROM diary.homework" +
                " h INNER JOIN diary.homework_type ON h.type_id = homework_type.id WHERE h.archive_school_year IS NULL AND" +
                " (h.due_date >= to_date(?,'YYYY-MM-DD') AND h.due_date <= to_date(?,'YYYY-MM-DD')) AND h.structure_id = ?" +
                " AND h.audience_id IN (?,?) AND h.teacher_id IN (?,?) AND h.subject_id = ? AND h.is_published = true AND" +
                " h.owner_id = ? )  SELECT h.*,  to_json(progress_and_state) as progress FROM homework_filter h INNER JOIN" +
                " diary.homework_type AS type ON type.id = h.type_id LEFT JOIN ( SELECT progress.*, homework_state.label as" +
                " state_label FROM diary.homework_progress progress INNER JOIN diary.homework_state ON progress.state_id =" +
                " homework_state.id WHERE  progress.user_id = ? ) AS progress_and_state ON (h.id = progress_and_state.homework_id)" +
                " ORDER BY h.due_date ASC";
        JsonArray expectedParams = new JsonArray(Arrays.asList(
                "startDate", "endDate", "structureId", "audienceId1", "audienceId2", "teacherId1", "teacherId2", "subjectId", "ownerId", "studentId"
        ));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        List<String> listAudienceId = Arrays.asList("audienceId1", "audienceId2");
        List<String> listTeacherId = Arrays.asList("teacherId1", "teacherId2");

        Whitebox.invokeMethod(this.homeworkServiceImpl, "getStudentHomeworks", "structureId", "studentId", "startDate",
                "endDate", "ownerId", listAudienceId, listTeacherId, "subjectId", true, null);
    }

    @Test
    public void testCreateHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "INSERT INTO diary.homework (subject_id, exceptional_label, structure_id, teacher_id," +
                " audience_id, estimatedTime, color, description, is_published, from_session_id, session_id, due_date," +
                " type_id, owner_id , created, modified , publish_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, to_date(?,'YYYY-MM-DD')," +
                " ?, ?, NOW(), NOW() , NOW())  RETURNING id";
        JsonArray expectedParams = new JsonArray(Arrays.asList(
                "subject_id", "exceptional_label", "structure_id", "userId", "audience_id", 1, "color", "description", true, 5, 4, "due_date", 3, "userId"
        ));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        JsonObject homework = new JsonObject("{\"is_published\": true, \"subject_id\": \"subject_id\", \"exceptional_label\":" +
                " \"exceptional_label\", \"structure_id\": \"structure_id\", \"audience_id\": \"audience_id\", \"estimatedTime\": 1," +
                " \"color\": \"color\", \"description\": \"description\", \"from_session_id\": 5, \"session_id\": 4, \"due_date\":" +
                " \"due_date\", \"type_id\": 3}");
        this.homeworkServiceImpl.createHomework(homework, user, null);
    }

    @Test
    public void testUpdateHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.homework SET subject_id = ?, exceptional_label = ?, structure_id = ?, " +
                "audience_id = ?, estimatedTime = ?, color = ?, description = ?, type_id = ?,  modified = NOW() , is_published = ?, " +
                "session_id = ?, due_date = ?,publish_date = NOW ()   WHERE id = ?;";
        JsonArray expectedParams = new JsonArray(Arrays.asList(
                "subject_id", "exceptional_label", "structure_id", "audience_id", 1, "color", "description", 3, true, 4, "due_date", 1
        ));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        JsonObject homework = new JsonObject("{\"is_published\": true, \"subject_id\": \"subject_id\", \"exceptional_label\":" +
                " \"exceptional_label\", \"structure_id\": \"structure_id\", \"audience_id\": \"audience_id\", \"estimatedTime\": 1," +
                " \"color\": \"color\", \"description\": \"description\", \"from_session_id\": 5, \"session_id\": 4, \"due_date\":" +
                " \"due_date\", \"type_id\": 3}");
        this.homeworkServiceImpl.updateHomework(1, true, homework, null);
    }

    //Must find a way to test transaction query in prepared handler
    @Test
    public void testDeleteHomework(TestContext ctx) {
        Async async = ctx.async();

        List<String> expectedQuery = Arrays.asList(
                "SELECT s.id AS sessionId, s.is_empty AS isEmpty FROM diary.homework h INNER JOIN diary.session" +
                        " s ON h.session_id = s.id WHERE h.id = ? AND h.archive_school_year IS NULL AND s.archive_school_year IS NULL");
        List<JsonArray> expectedParams = Arrays.asList(new JsonArray(Collections.singletonList(1)));
        List<String> actionList = Arrays.asList("prepared");

        final Integer[] i = {0};
        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals(actionList.get(i[0]), body.getString("action"));
            ctx.assertEquals(expectedQuery.get(i[0]), body.getString("statement"));
            ctx.assertEquals(expectedParams.get(i[0]).toString(), body.getJsonArray("values").toString());
            i[0]++;
            if (i[0] == expectedQuery.size()) {
                async.complete();
            }
        });

        this.homeworkServiceImpl.deleteHomework(1, null);
    }

    @Test
    public void testPublishHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.homework SET is_published = true, publish_date = NOW() WHERE id = ?";
        JsonArray expectedParams = new JsonArray(Arrays.asList(1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        this.homeworkServiceImpl.publishHomework(1, null);
    }

    @Test
    public void testUnpublishHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.homework SET is_published = false WHERE id = ?";
        JsonArray expectedParams = new JsonArray(Arrays.asList(1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        this.homeworkServiceImpl.unpublishHomework(1, null);
    }

    @Test
    public void testSetProgressHomework(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = " INSERT INTO diary.homework_progress (homework_id, state_id, user_id) VALUES (?, ?, ?) " +
                "ON CONFLICT (homework_id, user_id) DO UPDATE SET state_id = excluded.state_id";
        JsonArray expectedParams = new JsonArray(Arrays.asList(1, 2, "userId"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.setProgressHomework(1, "done", user, null);
    }

    @Test
    public void testGetHomeworkTypes(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT * FROM diary.homework_type WHERE structure_id = ? ORDER BY rank;";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.getHomeworkTypes("structure_id", null);
    }

    //Must find a way to test transaction query in prepared handler
    @Test
    public void testCreateHomeworkType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "Select MAX(rank) as max, nextval('diary.homework_type_id_seq') as id from diary.homework_type where structure_id = ?";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject homeworkType = new JsonObject().put("structure_id", "structure_id");
        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.createHomeworkType(homeworkType, null);
    }

    @Test
    public void testUpdateHomeworkType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.homework_type SET structure_id = ?, label = ? WHERE id = ?";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id", "label", 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject homeworkType = new JsonObject().put("structure_id", "structure_id").put("label", "label");
        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.updateHomeworkType(1, homeworkType, null);
    }

    @Test
    public void testDeleteHomeworkType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "DELETE FROM diary.homework_type ht WHERE not Exists (SELECT 1 from diary.homework h WHERE" +
                " ht.id =  h.type_id)AND Exists (SELECT 1 FROM diary.homework_type htt WHERE structure_id = ? HAVING COUNT(htt.id)" +
                " > 1) AND ht.id = ? RETURNING id";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id", 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.deleteHomeworkType(1, "structure_id", null);
    }

    @Test
    public void testGetWorkload(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT COUNT(*) FROM diary.homework WHERE structure_id = ? AND audience_id = ? AND due_date = ? AND is_published = true AND archive_school_year IS NULL";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structureId", "audienceId", "dueDate"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        UserInfos user = new UserInfos();
        user.setUserId("userId");
        this.homeworkServiceImpl.getWorkload("structureId", "audienceId", "dueDate", true, null);
    }
}
