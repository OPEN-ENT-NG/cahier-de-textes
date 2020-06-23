package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.SessionService;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SessionServiceImpl implements SessionService {
    private static final String STATEMENT = "statement";
    private static final String VALUES = "values";
    private static final String ACTION = "action";
    private static final String PREPARED = "prepared";
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);

    private DiaryService diaryService = new DiaryServiceImpl();

    @Override
    public void getSession(long sessionId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT s.*, to_json(type_session) as type, array_to_json(array_agg(distinct homework_and_type)) as homeworks");
        query.append(",(SELECT 1 FROM diary.session_visa");
        query.append(" INNER JOIN diary.session on session.id = session_visa.session_id");
        query.append(" WHERE session.id = ").append(sessionId).append("LIMIT 1) AS one_visa");
        query.append(" FROM " + Diary.DIARY_SCHEMA + ".session s");
        query.append(" LEFT JOIN " + Diary.DIARY_SCHEMA + ".session_type AS type_session ON type_session.id = s.type_id");
        query.append(" LEFT JOIN (");
        query.append(" SELECT homework.*, to_json(homework_type) as type");
        query.append(" FROM diary.homework homework");
        query.append(" INNER JOIN " + Diary.DIARY_SCHEMA + ".homework_type ON homework.type_id = homework_type.id");
        query.append(" ) as homework_and_type ON (s.id = homework_and_type.session_id)");
        query.append(" WHERE s.id = ").append(sessionId);
        query.append(" GROUP BY s.id, type_session");
        Sql.getInstance().raw(query.toString(), SqlResult.validUniqueResultHandler(result -> {
            if (result.isRight()) {
                JsonObject session = result.right().getValue();
                cleanSession(session);

                handler.handle(new Either.Right<>(session));
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    @Override
    public void getOwnSessions(String structureId, String startDate, String endDate, List<String> audienceIds, String subjectId, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        List<String> listSubjectId = subjectId != null ? Arrays.asList(subjectId) : null;

        if (user.getType().equals("Student")) {
            this.getChildSessions(structureId, startDate, endDate, user.getUserId(), listSubjectId, handler);
        } else if (user.getType().equals("Teacher")) {
            this.getSessions(structureId, startDate, endDate, user.getUserId(), audienceIds, Arrays.asList(user.getUserId()), listSubjectId,false, false, false, false, false, handler);
        }
    }

    @Override
    public void getExternalSessions(String startDate, String endDate, String teacherId, String audienceId, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = audienceId != null && !audienceId.equals("") ? Arrays.asList(audienceId) : null;
        List<String> listTeacherId = teacherId != null && !teacherId.equals("") ? Arrays.asList(teacherId) : null;

        this.getSessions(null, startDate, endDate, null, listAudienceId, listTeacherId, null, true, false, false, false, false, handler);
    }

    @Override
    public void getChildSessions(String structureId, String startDate, String endDate, String childId, List<String> listSubjectId, Handler<Either<String, JsonArray>> handler) {
        // Get child audiences
        diaryService.getAudienceFromChild(childId, response -> {
            if (response.isRight()) {
                List<String> listAudienceId = new ArrayList<>();
                JsonArray result = response.right().getValue();
                for (int i = 0; i < result.size(); i++) {
                    listAudienceId.add(result.getJsonObject(i).getString("audienceId"));
                }
                this.getSessions(structureId, startDate, endDate, null, listAudienceId, null, listSubjectId, true, false, false, false, false, handler);
            }
        });
    }

    public String getWithSessionsQuery(String structureID, String startDate, String endDate, String ownerId,
                                       List<String> listAudienceId, List<String> listTeacherId, List<String> listSubjectId, boolean onlyPublished, JsonArray values) {
        String query = " WITH homework_and_type as " +
                " ( " +
                " SELECT homework.*, to_json(homework_type) as type " +
                " FROM " + Diary.DIARY_SCHEMA + ".homework" +
                " INNER JOIN diary.homework_type ON homework.type_id = homework_type.id " +
                " INNER JOIN diary.session s ON (homework.session_id = s.id)" +
                ((onlyPublished) ? " AND s.is_published = true " : " ");

        if (startDate != null && endDate != null) {
            query += " AND homework.due_date >= to_date(?,'YYYY-MM-DD')";
            query += " AND homework.due_date <= to_date(?,'YYYY-MM-DD')";
            values.add(startDate);
            values.add(endDate);
        }
        if (listAudienceId != null && !listAudienceId.isEmpty()) {
            query += " AND homework.audience_id IN " + (Sql.listPrepared(listAudienceId.toArray()));
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
        }
        if (listTeacherId != null && !listTeacherId.isEmpty()) {
            query += " AND homework.teacher_id IN " + (Sql.listPrepared(listTeacherId.toArray()));
            for (String teacherId : listTeacherId) {
                values.add(teacherId);
            }
        }
        if (listSubjectId != null && !listSubjectId.isEmpty()) {
            query += " AND homework.subject_id IN " + (Sql.listPrepared(listSubjectId.toArray()));
            for (String subjectId : listSubjectId) {
                values.add(subjectId);
            }
        }
        if (ownerId != null) {
            query += " AND homework.owner_id = ?";
            values.add(ownerId);
        }
        if (structureID != null) {
            query += " AND homework.structure_id = ?";
            values.add(structureID);
        }

        query += " ) ";
        return query.replaceFirst("AND", "WHERE");
    }

    public String getSelectSessionsQuery(String structureID, String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                                         List<String> listSubjectId, boolean published, boolean notPublished, boolean vised, boolean notVised, boolean agregVisas, JsonArray values) {
        String query = " SELECT s.*, " + " array_to_json(array_agg(homework_and_type)) as homeworks" +
                ((agregVisas) ? " ,array_to_json(array_agg(distinct visa)) as visas" : " ") +
                " FROM diary.session s " +
                ((agregVisas) ? " LEFT JOIN diary.session_visa AS session_visa ON session_visa.session_id = s.id " +
                        " LEFT JOIN diary.visa AS visa ON visa.id = session_visa.visa_id" : " ") +
                " LEFT JOIN homework_and_type ON (s.id = homework_and_type.session_id)";

        if (published && !notPublished) {
            query += " AND s.is_published = true ";
        }

        if (notPublished && !published) {
            query += " AND s.is_published = false ";
        }

        query = getWhereContentGetSessionQuery(structureID, startDate, endDate, ownerId, listAudienceId, listTeacherId, listSubjectId, values, query);

        if (agregVisas && vised && !notVised) {
            query += " AND visa IS NOT NULL";
        }
        if (agregVisas && notVised && !vised) {
            query += " AND visa IS NULL";
        }
        query += " GROUP BY s.id " + " ORDER BY s.date ASC ";
        return query.replaceFirst("AND", "WHERE");
    }

    private String getWhereContentGetSessionQuery(String structureID, String startDate, String endDate, String ownerId,
                                                  List<String> listAudienceId, List<String> listTeacherId, List<String> listSubjectId, JsonArray values, String query) {
        if (startDate != null && endDate != null) {
            query += " AND s.date >= to_date(?,'YYYY-MM-DD')";
            query += " AND s.date <= to_date(?,'YYYY-MM-DD')";
            values.add(startDate);
            values.add(endDate);
        }
        if (listAudienceId != null && !listAudienceId.isEmpty()) {
            query += " AND s.audience_id IN " + (Sql.listPrepared(listAudienceId.toArray()));
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
        }
        if (listTeacherId != null && !listTeacherId.isEmpty()) {
            query += " AND s.teacher_id IN " + (Sql.listPrepared(listTeacherId.toArray()));
            for (String teacherId : listTeacherId) {
                values.add(teacherId);
            }
        }
        if (listSubjectId != null && !listSubjectId.isEmpty()) {
            query += " AND s.subject_id IN " + (Sql.listPrepared(listSubjectId.toArray()));
            for (String subjectId : listSubjectId) {
                values.add(subjectId);
            }
        }
        if (ownerId != null) {
            query += " AND s.owner_id = ?";
            values.add(ownerId);
        }
        if (structureID != null) {
            query += " AND s.structure_id = ?";
            values.add(structureID);
        }
        return query;
    }

    /**
     * Query sessions
     *
     * @param startDate      return sessions in the date or after
     * @param endDate        return sessions in the date or before
     * @param ownerId        return sessions with this ownerId
     * @param listAudienceId return sessions with a audience_id field inside this list
     * @param listTeacherId  return sessions with a teacher_id field inside this list
     * @param published      returns published sessions
     * @param notPublished   returns not published sessions
     * @param vised          returns the sessions with visa
     * @param notVised       returns the sessions without visa
     * @param agregVisas     returns the sessions with the field visas
     * @param handler
     */
    public void getSessions(String structureID, String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                            List<String> listSubjectId, boolean published, boolean notPublished, boolean vised, boolean notVised, boolean agregVisas,
                            Handler<Either<String, JsonArray>> handler) {

        JsonArray values = new JsonArray();

        String query;
        query = this.getWithSessionsQuery(structureID, startDate, endDate, ownerId, listAudienceId, listTeacherId, listSubjectId, published, values)
                + this.getSelectSessionsQuery(structureID, startDate, endDate, ownerId, listAudienceId, listTeacherId, listSubjectId, published, notPublished, vised, notVised, agregVisas, values);
        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(result -> {
            // Formatting String into JsonObject
            if (result.isRight()) {
                JsonArray arraySession = result.right().getValue();
                for (int i = 0; i < arraySession.size(); i++) {
                    cleanSession(arraySession.getJsonObject(i));
                }
                handler.handle(new Either.Right<>(arraySession));
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    private void cleanSession(JsonObject session) {
        if (session.getString("type") != null)
            session.put("type", new JsonObject(session.getString("type")));
        session.put("homeworks", new JsonArray(session.getString("homeworks")));
        if (session.getJsonArray("homeworks").contains(null)) {
            session.put("homeworks", new JsonArray());
        }
    }

    @Override
    public void createSession(JsonObject session, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.session (subject_id, type_id, structure_id, teacher_id, audience_id, title, " +
                "room, color, description, annotation, is_published, is_empty, course_id, owner_id, " +
                "date, start_time, end_time, created, modified) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " +
                "to_date(?,'YYYY-MM-DD'), to_timestamp(?, 'hh24:mi:ss'), to_timestamp(?, 'hh24:mi:ss'), NOW(), NOW()) RETURNING id";

        values.add(session.getString("subject_id"));
        values.add(session.getInteger("type_id"));
        values.add(session.getString("structure_id"));
        values.add(user.getUserId());
        values.add(session.getString("audience_id"));
        values.add(session.getString("title"));
        values.add(session.getString("room"));
        values.add(session.getString("color"));
        values.add(session.getString("description"));
        values.add(session.getString("annotation"));
        if (session.getBoolean("is_published") != null) {
            values.add(session.getBoolean("is_published"));
        } else {
            values.add(false);
        }

        if (session.getBoolean("is_empty") != null) {
            values.add(session.getBoolean("is_empty"));
        } else {
            values.add(true);
        }

        if (session.getString("course_id") != null) {
            values.add(session.getString("course_id"));
        } else {
            values.addNull();
        }

        values.add(user.getUserId());
        values.add(session.getString("date"));
        values.add(session.getString("start_time"));
        values.add(session.getString("end_time"));

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updateSession(long sessionId, JsonObject session, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "UPDATE diary.session" +
                " SET subject_id = ?, type_id = ?, structure_id = ?, audience_id = ?, title = ?, " +
                " room = ?, color = ?, description = ?, annotation = ?, is_published = ?, is_empty = ?, course_id = ?, " +
                " date = to_date(?,'YYYY-MM-DD'), start_time = to_timestamp(?, 'hh24:mi:ss'), end_time = to_timestamp(?, 'hh24:mi:ss'), modified = NOW()" +
                " WHERE id = ?;";

        values.add(session.getString("subject_id"));
        values.add(session.getInteger("type_id"));
        values.add(session.getString("structure_id"));
        values.add(session.getString("audience_id"));
        values.add(session.getString("title"));
        values.add(session.getString("room"));
        values.add(session.getString("color"));
        values.add(session.getString("description"));
        values.add(session.getString("annotation"));
        values.add(session.getBoolean("is_published"));
        values.add(session.getBoolean("is_empty"));
        if (session.getString("course_id") == null) {
            values.addNull();
        } else {
            values.add(session.getString("course_id"));
        }

        values.add(session.getString("date"));
        values.add(session.getString("start_time"));
        values.add(session.getString("end_time"));

        values.add(sessionId);

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteSession(long sessionId, Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM diary.session WHERE id = " + sessionId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void publishSession(long sessionId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.session SET is_published = true WHERE id = " + sessionId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void unpublishSession(long sessionId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.session SET is_published = false WHERE id = " + sessionId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getSessionTypes(String structure_id, Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        JsonArray param = new JsonArray();
        query.append("SELECT * FROM " + Diary.DIARY_SCHEMA + ".session_type " + "WHERE structure_id = ? ORDER BY rank;");

        param.add(structure_id);

        Sql.getInstance().prepared(query.toString(), param, SqlResult.validResultHandler(handler));
    }

    @Override
    public void createSessionType(JsonObject sessionType, Handler<Either<String, JsonObject>> handler) {
        String maxQuery = "SELECT MAX(rank) as max, nextval('" + Diary.DIARY_SCHEMA + ".session_type_id_seq') as id from " + Diary.DIARY_SCHEMA + ".session_type "
                + "WHERE structure_id = '" + sessionType.getString("structure_id") + "'";
        Sql.getInstance().raw(maxQuery, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    try {
                        final Number rank = event.right().getValue().getInteger("max");
                        final Number id = event.right().getValue().getInteger("id");

                        JsonArray statements = new JsonArray();
                        statements.add(getInsertSessionTypeStatement(sessionType, rank.intValue() + 1));
                        Sql.getInstance().transaction(statements, new Handler<Message<JsonObject>>() {
                            @Override
                            public void handle(Message<JsonObject> event) {
                                handler.handle(SqlQueryUtils.getTransactionHandler(event, id));
                            }
                        });
                    } catch (ClassCastException e) {
                        LOGGER.error("An error occurred when insert homework_type", e);
                        handler.handle(new Either.Left<String, JsonObject>("Error creating type"));
                    }
                } else {
                    LOGGER.error("An error occurred when selecting max");
                    handler.handle(new Either.Left<String, JsonObject>("Error while retrieving data"));
                }
            }
        }));
    }

    private JsonObject getInsertSessionTypeStatement(JsonObject sessionType, Number rank) {
        String query = " INSERT INTO " + Diary.DIARY_SCHEMA + ".session_type(structure_id, label, rank)" + "VALUES (?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(sessionType.getString("structure_id"))
                .add(sessionType.getString("label"))
                .add(rank);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    @Override
    public void updateSessionType(Integer id, JsonObject sessionType, Handler<Either<String, JsonObject>> handler) {
        JsonArray params = new JsonArray();
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".session_type SET structure_id = ?, label = ? WHERE id = ?";

        params.add(sessionType.getString("structure_id"));
        params.add(sessionType.getString("label"));
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteSessionType(Integer id, String structure_id, Handler<Either<String, JsonObject>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".session_type st " +
                "WHERE not Exists (SELECT 1 from " + Diary.DIARY_SCHEMA + ".session s WHERE st.id =  s.type_id)" +
                "AND not Exists (SELECT 1 from " + Diary.DIARY_SCHEMA + ".progression_session ps WHERE st.id = ps.type_id) " +
                "AND Exists (SELECT 1 FROM diary.session_type stt WHERE structure_id = ? HAVING COUNT(stt.id) > 1) " +
                "AND st.id = ? RETURNING id";
        params.add(structure_id);
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }
}
