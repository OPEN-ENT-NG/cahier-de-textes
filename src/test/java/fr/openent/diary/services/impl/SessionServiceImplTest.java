package fr.openent.diary.services.impl;

import fr.openent.diary.db.DB;
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
import org.mockito.stubbing.Answer;
import org.powermock.reflect.Whitebox;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(VertxUnitRunner.class)
public class SessionServiceImplTest {

    private final EventStore eventStore = Mockito.mock(EventStore.class);
    private Vertx vertx;
    private SessionServiceImpl sessionService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        Sql.getInstance().init(vertx.eventBus(), "fr.openent.diary");
        DB.getInstance().init(null, Sql.getInstance(), null);
        this.sessionService = new SessionServiceImpl(vertx.eventBus(), eventStore);
        this.sessionService = Mockito.spy(this.sessionService);
    }

    @Test
    public void testGetSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT s.*, to_json(type_session) AS type, array_to_json(array_agg(distinct homework_and_type))" +
                " AS homeworks, (SELECT 1 FROM diary.session_visa INNER JOIN diary.session on session.id = session_visa.session_id" +
                " WHERE session.id = ? LIMIT 1) AS one_visa FROM diary.session s LEFT JOIN diary.session_type AS type_session" +
                " ON type_session.id = s.type_id LEFT JOIN ( SELECT homework.*, to_json(homework_type) as type FROM diary.homework" +
                " homework INNER JOIN diary.homework_type ON homework.type_id = homework_type.id ) AS homework_and_type ON" +
                " (s.id = homework_and_type.session_id) WHERE s.id = ? AND s.archive_school_year IS NULL GROUP BY s.id, type_session";
        JsonArray expectedParams = new JsonArray(Arrays.asList(1, 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });
        this.sessionService.getSession(1, null);
    }

    @Test
    public void testGetFromSessionHomeworks(TestContext ctx) throws Exception {
        Async async = ctx.async();

        String expectedQuery = " SELECT homework.*, to_json(homework_type) as type FROM diary.homework homework INNER JOIN" +
                " diary.homework_type ON homework.type_id = homework_type.id WHERE from_session_id = ? AND (session_id !=" +
                " ? OR  session_id IS NULL) AND homework.archive_school_year IS NULL";
        JsonArray expectedParams = new JsonArray(Arrays.asList(1, 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        List<String> subjectIds = Arrays.asList("subjectId1", "subjectId2");
        List<String> teacherIds = Arrays.asList("teacherId1", "teacherId2");
        List<String> audienceIds = Arrays.asList("audienceId1", "audienceId2");
        JsonObject session = new JsonObject();
        Whitebox.invokeMethod(this.sessionService, "getFromSessionHomeworks", 1L, session, subjectIds,
                teacherIds, audienceIds, null);
    }

    @Test
    public void testGetOwnSessions(TestContext ctx) {
        Mockito.doNothing()
                .when(this.sessionService)
                .getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),
                        Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(),
                        Mockito.any());
        Mockito.doNothing().when(this.sessionService).getChildSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());

        List<String> audienceIds = Arrays.asList("audienceId1", "audienceId2");
        UserInfos user = Mockito.mock(UserInfos.class);
        Mockito.doReturn("Student").when(user).getType();
        this.sessionService.getOwnSessions("structureId", "startDate", "endDate", audienceIds, "subjectId", user, null);

        Mockito.verify(this.sessionService, Mockito.times(1)).getChildSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
        Mockito.verify(this.sessionService, Mockito.times(0)).getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.any());

        Mockito.doReturn("Teacher").when(user).getType();
        this.sessionService.getOwnSessions("structureId", "startDate", "endDate", audienceIds, "subjectId", user, null);

        Mockito.verify(this.sessionService, Mockito.times(1)).getChildSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
        Mockito.verify(this.sessionService, Mockito.times(1)).getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.any());

        Mockito.doReturn("").when(user).getType();
        this.sessionService.getOwnSessions("structureId", "startDate", "endDate", audienceIds, "subjectId", user, null);

        Mockito.verify(this.sessionService, Mockito.times(1)).getChildSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
        Mockito.verify(this.sessionService, Mockito.times(1)).getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.any());
    }

    @Test
    public void testGetExternalSessions(TestContext ctx) {
        Async async = ctx.async();
        Mockito.doNothing()
                .when(this.sessionService)
                .getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),
                        Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(),
                        Mockito.any());

        String startDate = "startDate";
        String endDate = "endDate";
        String teacherId = "teacherId";
        String subjectId = "subjectId";

        List<String> expectedAudienceIds = Arrays.asList("audienceId1", "audienceIds2");
        List<String> expectedTeacherIds = Arrays.asList(teacherId);
        List<String> expectedSubjectIds = Arrays.asList(subjectId);

        Mockito.doAnswer((Answer<Void>) invocation -> {
            List<String> listAudienceId = invocation.getArgument(4);
            List<String> listTeacherId = invocation.getArgument(5);
            List<String> listSubjectId = invocation.getArgument(6);
            ctx.assertEquals(listAudienceId, expectedAudienceIds);
            ctx.assertEquals(listTeacherId, expectedTeacherIds);
            ctx.assertEquals(listSubjectId, expectedSubjectIds);
            async.complete();
            return null;
        }).when(this.sessionService).getSessions(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),
                Mockito.any(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(), Mockito.anyBoolean(),
                Mockito.any());
        this.sessionService.getExternalSessions(startDate, endDate, teacherId, expectedAudienceIds, subjectId, null);
    }

    @Test
    public void testGetSelectSessionsQuery(TestContext ctx) {
        List<String> audienceIds = Arrays.asList("audienceId1", "audienceIds2");
        List<String> teacherIds = Arrays.asList("teacherId1", "teacherId2");
        List<String> subjectIds = Arrays.asList("subjectId1", "subjectId2");
        JsonArray values = new JsonArray().add("query");

        String res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, true, true, true, true, true, values);
        JsonArray expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        String expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks ,array_to_json(array_agg(distinct visa))" +
                " AS visas FROM diary.session s  LEFT JOIN diary.session_visa AS session_visa ON session_visa.session_id = s.id  LEFT" +
                " JOIN diary.visa AS visa ON visa.id = session_visa.visa_id LEFT JOIN homework_and_type ON (s.id = homework_and_type.session_id)" +
                " WHERE s.date >= to_date(?,'YYYY-MM-DD') AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN" +
                " (?,?) AND s.subject_id IN (?,?) AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id" +
                "  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, true, true, true, true, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT JOIN" +
                " homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD') AND s.date" +
                " <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject_id IN (?,?) AND" +
                " s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, true, true, true, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject" +
                "_id IN (?,?) AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id" +
                "  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, true, true, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject_id" +
                " IN (?,?) AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER BY" +
                " s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, true, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject_id" +
                " IN (?,?) AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id  HAVING" +
                " COUNT(homework_and_type) > 0 OR s.is_published = true  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, subjectIds, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject_id" +
                " IN (?,?) AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER" +
                " BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, teacherIds, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "teacherId1", "teacherId2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.owner_id" +
                " = ? AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                audienceIds, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "audienceId1", "audienceIds2", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.audience_id IN (?,?) AND s.owner_id = ? AND s.structure_id" +
                " = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", "ownerId",
                null, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "ownerId", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.owner_id = ? AND s.structure_id = ? AND s.archive_school_year" +
                " IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", "endDate", null,
                null, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "startDate", "endDate", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD')" +
                " AND s.date <= to_date(?,'YYYY-MM-DD') AND s.structure_id = ? AND s.archive_school_year IS NULL GROUP BY" +
                " s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", "startDate", null, null,
                null, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.structure_id = ? AND s.archive_school_year" +
                " IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery("structureID", null, null, null,
                null, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Arrays.asList("query", "structureID"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.structure_id = ? AND s.archive_school_year" +
                " IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);

        values = new JsonArray().add("query");
        res = this.sessionService.getSelectSessionsQuery(null, null, null, null,
                null, null, null, false, false, false, false, false, values);
        expectedValues = new JsonArray(Collections.singletonList("query"));
        expectedRes = " SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks  FROM diary.session s   LEFT" +
                " JOIN homework_and_type ON (s.id = homework_and_type.session_id) WHERE s.archive_school_year IS NULL GROUP" +
                " BY s.id  ORDER BY s.date ASC ";
        ctx.assertEquals(res, expectedRes);
        ctx.assertEquals(values, expectedValues);
    }

    @Test
    public void testGetSessions(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = " WITH homework_and_type as  (  SELECT homework.*, to_json(homework_type) as type  FROM diary.homework" +
                " INNER JOIN diary.homework_type ON homework.type_id = homework_type.id  INNER JOIN diary.session s ON (homework.session_id" +
                " = s.id) WHERE homework.is_published = true  AND homework.due_date >= to_date(?,'YYYY-MM-DD') AND homework.due_date" +
                " <= to_date(?,'YYYY-MM-DD') AND homework.audience_id IN (?,?) AND homework.teacher_id IN (?,?) AND homework.subject_id" +
                " IN (?,?) AND homework.owner_id = ? AND homework.structure_id = ? AND homework.archive_school_year IS NULL )" +
                "  SELECT s.*,  array_to_json(array_agg(homework_and_type)) AS homeworks ,array_to_json(array_agg(distinct visa))" +
                " AS visas FROM diary.session s  LEFT JOIN diary.session_visa AS session_visa ON session_visa.session_id = s.id" +
                "  LEFT JOIN diary.visa AS visa ON visa.id = session_visa.visa_id LEFT JOIN homework_and_type ON (s.id =" +
                " homework_and_type.session_id) WHERE s.date >= to_date(?,'YYYY-MM-DD') AND s.date <= to_date(?,'YYYY-MM-DD')" +
                " AND s.audience_id IN (?,?) AND s.teacher_id IN (?,?) AND s.subject_id IN (?,?) AND s.owner_id = ? AND s.structure_id" +
                " = ? AND s.archive_school_year IS NULL GROUP BY s.id  ORDER BY s.date ASC ";
        JsonArray expectedParams = new JsonArray(Arrays.asList("startDate", "endDate", "audienceId1", "audienceId2", "teacherId1",
                "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID", "startDate", "endDate", "audienceId1", "audienceId2",
                "teacherId1", "teacherId2", "subjectId1", "subjectId2", "ownerId", "structureID"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        List<String> subjectIds = Arrays.asList("subjectId1", "subjectId2");
        List<String> teacherIds = Arrays.asList("teacherId1", "teacherId2");
        List<String> audienceIds = Arrays.asList("audienceId1", "audienceId2");

        this.sessionService.getSessions("structureID", "startDate", "endDate", "ownerId", audienceIds, teacherIds,
                subjectIds, true, true, true, true, true, null);
    }

    @Test
    public void testCreateSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "INSERT INTO diary.session (subject_id, type_id, exceptional_label, structure_id, teacher_id," +
                " audience_id, title, room, color, description, annotation, is_published, is_empty, course_id, owner_id, date," +
                " start_time, end_time, created, modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, to_timestamp(?," +
                " 'hh24:mi:ss'), to_timestamp(?, 'hh24:mi:ss'), NOW(), NOW()) RETURNING id";
        JsonArray expectedParams = new JsonArray(Arrays.asList("subject_id", 1, "exceptional_label", "structure_id", "3", "audience_id",
                "title", "room", "color", "description", "annotation", true, true, "course_id", "3", "2000-01-01", "start_time", "end_time"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject session = new JsonObject()
                .put("subject_id", "subject_id")
                .put("type_id", 1)
                .put("exceptional_label", "exceptional_label")
                .put("structure_id", "structure_id")
                .put("audience_id", "audience_id")
                .put("title", "title")
                .put("room", "room")
                .put("color", "color")
                .put("description", "description")
                .put("annotation", "annotation")
                .put("is_published", true)
                .put("is_empty", true)
                .put("course_id", "course_id")
                .put("date", "2000-01-01")
                .put("start_time", "start_time")
                .put("end_time", "end_time");

        UserInfos user = new UserInfos();
        user.setUserId("3");
        this.sessionService.createSession(session, user, event -> {
        });
    }

    @Test
    public void testUpdateSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.session SET subject_id = ?, type_id = ?, exceptional_label = ?, structure_id = ?," +
                " audience_id = ?, title = ?,  room = ?, color = ?, description = ?, annotation = ?, is_published = ?, is_empty" +
                " = ?, course_id = ?,  date = to_date(?,'YYYY-MM-DD'), start_time = to_timestamp(?, 'hh24:mi:ss'), end_time =" +
                " to_timestamp(?, 'hh24:mi:ss'), modified = NOW() WHERE id = ?;";
        JsonArray expectedParams = new JsonArray(Arrays.asList("subject_id", 1, "exceptional_label", "structure_id", "audience_id",
                "title", "room", "color", "description", "annotation", true, true, "course_id", "2000-01-01", "start_time", "end_time", 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject session = new JsonObject()
                .put("subject_id", "subject_id")
                .put("type_id", 1)
                .put("exceptional_label", "exceptional_label")
                .put("structure_id", "structure_id")
                .put("audience_id", "audience_id")
                .put("title", "title")
                .put("room", "room")
                .put("color", "color")
                .put("description", "description")
                .put("annotation", "annotation")
                .put("is_published", true)
                .put("is_empty", true)
                .put("course_id", "course_id")
                .put("date", "2000-01-01")
                .put("start_time", "start_time")
                .put("end_time", "end_time");

        UserInfos user = new UserInfos();
        user.setUserId("3");
        this.sessionService.updateSession(1L, session, event -> {
        });
    }

    @Test
    public void testDeleteSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "DELETE FROM diary.session WHERE id = 1";

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("raw", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("command"));
            async.complete();
        });

        this.sessionService.deleteSession(1L, null);
    }

    @Test
    public void testPublishSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.session SET is_published = true WHERE id = 1";

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("raw", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("command"));
            async.complete();
        });

        this.sessionService.publishSession(1L, null);
    }

    @Test
    public void testUnpublishSession(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.session SET is_published = false WHERE id = 1";

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("raw", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("command"));
            async.complete();
        });

        this.sessionService.unpublishSession(1L, null);
    }

    //Must find a way to test transaction after prepare
    @Test
    public void testCreateSessionType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "SELECT MAX(rank) as max, nextval('diary.session_type_id_seq') as id from diary.session_type WHERE structure_id = ?";
        JsonArray expectedParams = new JsonArray(Collections.singletonList("structure_id"));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject session = new JsonObject()
                .put("structure_id", "structure_id");
        this.sessionService.createSessionType(session, event -> {
        });
    }

    @Test
    public void testUpdateSessionType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "UPDATE diary.session_type SET structure_id = ?, label = ? WHERE id = ?";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id", "label", 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        JsonObject session = new JsonObject()
                .put("structure_id", "structure_id")
                .put("label", "label");
        this.sessionService.updateSessionType(1, session, event -> {
        });
    }

    @Test
    public void testDeleteSessionType(TestContext ctx) {
        Async async = ctx.async();

        String expectedQuery = "DELETE FROM diary.session_type st WHERE not Exists (SELECT 1 from diary.session s WHERE" +
                " st.id =  s.type_id)AND Exists (SELECT 1 FROM diary.session_type stt WHERE structure_id = ? HAVING" +
                " COUNT(stt.id) > 1) AND st.id = ? RETURNING id";
        JsonArray expectedParams = new JsonArray(Arrays.asList("structure_id", 1));

        vertx.eventBus().consumer("fr.openent.diary", message -> {
            JsonObject body = (JsonObject) message.body();
            ctx.assertEquals("prepared", body.getString("action"));
            ctx.assertEquals(expectedQuery, body.getString("statement"));
            ctx.assertEquals(expectedParams.toString(), body.getJsonArray("values").toString());
            async.complete();
        });

        this.sessionService.deleteSessionType(1, "structure_id", event -> {
        });
    }
}
