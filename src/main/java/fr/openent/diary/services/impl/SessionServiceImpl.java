package fr.openent.diary.services.impl;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.SessionService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SessionServiceImpl implements SessionService {

    private DiaryService diaryService = new DiaryServiceImpl();

    @Override
    public void getSession(long sessionId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT s.*, array_to_json(array_agg(distinct homework_and_type)) as homeworks");
        query.append(" FROM diary.session s");
        query.append(" LEFT JOIN (");
        query.append(" SELECT homework.*, to_json(homework_type) as type");
        query.append(" FROM diary.homework homework");
        query.append(" INNER JOIN diary.homework_type ON homework.type_id = homework_type.id");
        query.append(" )  as homework_and_type ON (s.id = homework_and_type.session_id)");
        query.append(" WHERE s.id = ").append(sessionId);
        query.append(" GROUP BY s.id");

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
    public void getOwnSessions(String startDate, String endDate, String audienceId, String subjectId, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = audienceId != null ? Arrays.asList(audienceId) : null;
        List<String> listSubjectId = subjectId != null ? Arrays.asList(subjectId) : null;

        if (user.getType().equals("Student")) {
            this.getChildSessions(startDate, endDate, user.getUserId(), handler);
        } else if (user.getType().equals("Teacher")) {
            this.getSessions(startDate, endDate, user.getUserId(), listAudienceId, listSubjectId, null, false, false, false, handler);
        }
    }

    @Override
    public void getExternalSessions(String startDate, String endDate, String type, String typeId, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = "audience".equals(type) ? Arrays.asList(typeId) : null;
        List<String> listTeacherId = "teacher".equals(type) ? Arrays.asList(typeId) : null;

        this.getSessions(startDate, endDate, null, listAudienceId, null, listTeacherId, true, false, false, handler);
    }

    @Override
    public void getChildSessions(String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler) {
        // Get child audiences
        diaryService.getAudienceFromChild(childId, response -> {
            if (response.isRight()) {
                List<String> listAudienceId = new ArrayList<>();
                JsonArray result = response.right().getValue();
                for (int i = 0; i < result.size(); i++) {
                    listAudienceId.add(result.getJsonObject(i).getString("audienceId"));
                }
                this.getSessions(startDate, endDate, null, listAudienceId, null, null, true, false, false, handler);
            }
        });
    }

    /**
     * Query sessions
     *
     * @param startDate      return sessions in the date or after
     * @param endDate        return sessions in the date or before
     * @param ownerId        return sessions with this ownerId
     * @param listAudienceId return sessions with a audience_id field inside this list
     * @param listTeacherId  return sessions with a teacher_id field inside this list
     * @param onlyPublished  returns only published sessions
     * @param onlyVised      returns only the sessions with visa
     * @param agregVisas     returns the sessions with the field visas
     * @param handler
     */
    public void getSessions(String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listSubjectId, List<String> listTeacherId,
                             boolean onlyPublished, boolean onlyVised, boolean agregVisas, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        StringBuilder query = new StringBuilder();

        // todo: Retirer le produit cartésien
        query.append(" SELECT s.*, array_to_json(array_agg(homework_and_type)) as homeworks");
        if (agregVisas)
            query.append(" ,array_to_json(array_agg(distinct visa)) as visas");

        query.append(" FROM diary.session s");
        query.append(" LEFT JOIN (");
        query.append("   SELECT homework.*, to_json(homework_type) as type, to_json(progress_and_state) as progress");
        query.append("   FROM diary.homework homework");
        query.append("   INNER JOIN diary.homework_type ON homework.type_id = homework_type.id");
        query.append("   LEFT JOIN (");
        query.append("     SELECT progress.*, homework_state.label as state_label");
        query.append("     FROM diary.homework_progress progress");
        query.append("     INNER JOIN diary.homework_state ON progress.state_id = homework_state.id");
        query.append("   ) as progress_and_state ON (homework.id = progress_and_state.homework_id)");
        query.append(" )  as homework_and_type ON (s.id = homework_and_type.session_id)");

        if (agregVisas) {
            query.append(" LEFT JOIN diary.session_visa AS session_visa ON session_visa.session_id = s.id");
            query.append(" LEFT JOIN diary.visa AS visa ON visa.id = session_visa.visa_id");
        }

        if (startDate != null && endDate != null) {
            query.append(" AND s.date >= to_date(?,'YYYY-MM-DD')");
            query.append(" AND s.date <= to_date(?,'YYYY-MM-DD')");
            values.add(startDate);
            values.add(endDate);
        }

        if (listAudienceId != null) {
            query.append(" AND s.audience_id IN ").append(Sql.listPrepared(listAudienceId.toArray()));
            values.addAll(new JsonArray(listAudienceId));
        }

        if (listSubjectId != null) {
            query.append(" AND s.subject_id IN ").append(Sql.listPrepared(listSubjectId.toArray()));
            values.addAll(new JsonArray(listSubjectId));
        }

        if (listTeacherId != null) {
            query.append(" AND s.teacher_id IN ").append(Sql.listPrepared(listTeacherId.toArray()));
            values.addAll(new JsonArray(listTeacherId));
        }

        if (onlyPublished) {
            query.append(" AND s.is_published = true");
        }

        if (ownerId != null) {
            query.append(" AND s.owner_id = ?");
            values.add(ownerId);
        }

        query.append(" GROUP BY s.id");
        query.append(" ORDER BY s.date ASC");

        Sql.getInstance().prepared(query.toString().replaceFirst("AND", "WHERE"), values, SqlResult.validResultHandler(result -> {
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
        session.put("homeworks", new JsonArray(session.getString("homeworks")));
        if (session.getJsonArray("homeworks").contains(null)) {
            session.put("homeworks", new JsonArray());
        }
    }

    @Override
    public void createSession(JsonObject session, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.session (subject_id, structure_id, teacher_id, audience_id, title, " +
                "room, color, description, annotation, is_published, course_id, owner_id, " +
                "date, start_time, end_time, created, modified) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " +
                "to_date(?,'YYYY-MM-DD'), to_timestamp(?, 'hh24:mi:ss'), to_timestamp(?, 'hh24:mi:ss'), NOW(), NOW()) RETURNING id";

        values.add(session.getString("subject_id"));
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
                " SET subject_id = ?, structure_id = ?, audience_id = ?, title = ?, " +
                " room = ?, color = ?, description = ?, annotation = ?, is_published = ?, course_id = ?, " +
                " date = to_date(?,'YYYY-MM-DD'), start_time = to_timestamp(?, 'hh24:mi:ss'), end_time = to_timestamp(?, 'hh24:mi:ss'), modified = NOW()" +
                " WHERE id = ?;";

        values.add(session.getString("subject_id"));
        values.add(session.getString("structure_id"));
        values.add(session.getString("audience_id"));
        values.add(session.getString("title"));
        values.add(session.getString("room"));
        values.add(session.getString("color"));
        values.add(session.getString("description"));
        values.add(session.getString("annotation"));
        values.add(session.getBoolean("is_published"));
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
}
