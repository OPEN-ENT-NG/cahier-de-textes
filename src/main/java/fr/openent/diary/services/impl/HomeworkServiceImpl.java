package fr.openent.diary.services.impl;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {
    private static final String STATEMENT = "statement" ;
    private static final String VALUES = "values" ;
    private static final String ACTION = "action" ;
    private static final String PREPARED = "prepared" ;
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);

    private DiaryService diaryService = new DiaryServiceImpl();

    public HomeworkServiceImpl(String table) {
        super(table);
    }

    @Override
    public void getHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT h.*, to_json(type) as type, to_json(progress_and_state) as progress");
        query.append(" FROM diary.homework h");
        query.append(" LEFT JOIN diary.homework_type AS type ON type.id = h.type_id");
        query.append(" LEFT JOIN (");
        query.append("   SELECT progress.*, homework_state.label as state_label");
        query.append("   FROM diary.homework_progress progress");
        query.append("   INNER JOIN diary.homework_state ON progress.state_id = homework_state.id");
        query.append(" )  as progress_and_state ON (h.id = progress_and_state.homework_id)");
        query.append(" WHERE h.id = ").append(homeworkId);

        Sql.getInstance().raw(query.toString(), SqlResult.validUniqueResultHandler(result -> {
            if (result.isRight()) {
                JsonObject homework = result.right().getValue();
                cleanHomework(homework);

                handler.handle(new Either.Right<>(homework));
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    private void cleanHomework(JsonObject homework){
        homework.put("type", new JsonObject(homework.getString("type")));
        if(homework.getString("progress") != null)
            homework.put("progress", new JsonObject(homework.getString("progress")));
    }

    @Override
    public void getOwnHomeworks(String startDate, String endDate, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        if (user.getType().equals("Student")) {
            this.getChildHomeworks(startDate, endDate, user.getUserId(), handler);
        } else if (user.getType().equals("Teacher")) {
            this.getHomeworks(startDate, endDate, user.getUserId(), null, null, false, false, false, handler);
        }
    }

    @Override
    public void getExternalHomeworks(String startDate, String endDate, String type, String typeId, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = "audience".equals(type) ? Arrays.asList(typeId) : null;
        List<String> listTeacherId = "teacher".equals(type) ? Arrays.asList(typeId) : null;

        this.getHomeworks(startDate, endDate, null, listAudienceId, listTeacherId, true, false, false, handler);
    }

    @Override
    public void getChildHomeworks(String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler) {
        // Get child audiences
        diaryService.getAudienceFromChild(childId, response -> {
            if(response.isRight()){
                List<String> listAudienceId = new ArrayList<>();
                JsonArray result = response.right().getValue();
                for (int i = 0; i < result.size(); i++) {
                    listAudienceId.add(result.getJsonObject(i).getString("audienceId"));
                }
                this.getHomeworks(startDate, endDate, null, listAudienceId, null, true, false, false, handler);
            }
        });
    }

    /**
     * Query homeworks
     * @param startDate return homeworks in the date or after
     * @param endDate return homeworks in the date or before
     * @param ownerId return homeworks with this ownerId
     * @param listAudienceId return homeworks with a audience_id field inside this list
     * @param listTeacherId return homeworks with a teacher_id field inside this list
     * @param onlyPublished returns only published homeworks
     * @param onlyVised returns only the homeworks with visa
     * @param agregVisas returns the homeworks with the field visas
     * @param handler
     */
    private void getHomeworks(String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                              boolean onlyPublished, boolean onlyVised, boolean agregVisas, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        StringBuilder query = new StringBuilder();
        query.append(" SELECT h.*, to_json(type) as type, session.date as session_date, to_json(progress_and_state) as progress ");
        query.append(" FROM diary.homework h");
        query.append(" LEFT JOIN diary.homework_type AS type ON type.id = h.type_id");
        query.append(" LEFT JOIN diary.session AS session ON session.id = h.session_id");
        query.append(" LEFT JOIN (");
        query.append(" SELECT progress.*, homework_state.label as state_label");
        query.append(" FROM diary.homework_progress progress");
        query.append(" INNER JOIN diary.homework_state ON progress.state_id = homework_state.id");
        query.append(" )  as progress_and_state ON (h.id = progress_and_state.homework_id)");

        if (startDate != null && endDate != null) {
            query.append(" AND ((h.session_id IS NOT NULL AND session.date >= to_date(?,'YYYY-MM-DD') AND session.date <= to_date(?,'YYYY-MM-DD'))");
            query.append(" OR (h.session_id IS NULL AND h.due_date >= to_date(?,'YYYY-MM-DD') AND h.due_date <= to_date(?,'YYYY-MM-DD')))");

            values.add(startDate);
            values.add(endDate);
            values.add(startDate);
            values.add(endDate);
        }

        if (listAudienceId != null) {
            query.append(" AND ((h.session_id IS NOT NULL AND session.audience_id IN ").append(Sql.listPrepared(listAudienceId.toArray()));
            query.append(" ) OR (h.session_id IS NULL AND h.audience_id IN ").append(Sql.listPrepared(listAudienceId.toArray())).append("))");
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
        }

        if (listTeacherId != null) {
            query.append(" AND h.teacher_id IN ").append(Sql.listPrepared(listTeacherId.toArray()));
            for (String teacherId : listTeacherId) {
                values.add(teacherId);
            }
        }

        if (onlyPublished) {
            query.append(" AND h.is_published = true");
        }

        if (ownerId != null) {
            query.append(" AND h.owner_id = ?");
            values.add(ownerId);
        }

        query.append(" ORDER BY h.due_date ASC");

        Sql.getInstance().prepared(query.toString().replaceFirst("AND", "WHERE"), values, SqlResult.validResultHandler(result -> {
            // Formatting String into JsonObject
            if (result.isRight()) {
                JsonArray arrayHomework = result.right().getValue();
                for (int i = 0; i < arrayHomework.size(); i++) {
                    cleanHomework(arrayHomework.getJsonObject(i));
                }

                handler.handle(new Either.Right<>(arrayHomework));
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }

        }));
    }

    @Override
    public void createHomework(JsonObject homework, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.homework (subject_id, structure_id, teacher_id, audience_id, estimatedTime, " +
                "color, description, is_published, session_id, due_date, type_id, owner_id " +
                ", created, modified) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, " +
                "to_date(?,'YYYY-MM-DD'), ?, ?, NOW(), NOW()) RETURNING id";

        values.add(homework.getString("subject_id"));
        values.add(homework.getString("structure_id"));
        values.add(user.getUserId());
        values.add(homework.getString("audience_id"));
        values.add(homework.getInteger("estimatedTime"));
        values.add(homework.getString("color"));
        values.add(homework.getString("description"));
        if(homework.getBoolean("is_published") != null) {
            values.add(homework.getBoolean("is_published"));
        } else {
            values.add(false);
        }

        if (homework.getInteger("session_id") != null) {
            values.add(homework.getInteger("session_id"));
        } else {
            values.addNull();
        }

        if (homework.getString("due_date") != null) {
            values.add(homework.getString("due_date"));
        } else {
            values.addNull();
        }
        values.add(homework.getInteger("type_id"));
        values.add(user.getUserId());

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updateHomework(long homeworkId, JsonObject homework, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "UPDATE diary.homework " +
                "SET subject_id = ?, structure_id = ?, audience_id = ?, estimatedTime = ?," +
                " color = ?, description = ?, is_published = ?, session_id = ?, due_date = ?, type_id = ?, " +
                " modified = NOW() " +
                " WHERE id = ?;";

        values.add(homework.getString("subject_id"));
        values.add(homework.getString("structure_id"));
        values.add(homework.getString("audience_id"));
        values.add(homework.getInteger("estimatedTime"));
        values.add(homework.getString("color"));
        values.add(homework.getString("description"));

        if(homework.getBoolean("is_published") != null) {
            values.add(homework.getBoolean("is_published"));
        } else {
            values.add(false);
        }

        if (homework.getInteger("session_id") != null) {
            values.add(homework.getInteger("session_id"));
        } else {
            values.addNull();
        }

        if (homework.getString("due_date") != null) {
            values.add(homework.getString("due_date"));
        } else {
            values.addNull();
        }
        values.add(homework.getInteger("type_id"));

        values.add(homeworkId);

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM diary.homework WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void publishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.homework SET is_published = true WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void unpublishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.homework SET is_published = false WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    public static final int HOMEWORK_STATE_TODO = 1;
    public static final int HOMEWORK_STATE_DONE = 2;

    @Override
    public void setProgressHomework(long homeworkId, String state, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        int stateId = "done".equals(state) ? HOMEWORK_STATE_DONE : HOMEWORK_STATE_TODO;
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();
        query.append(" INSERT INTO diary.homework_progress (homework_id, state_id, user_id)");
        query.append(" VALUES (?, ?, ?)");
        query.append(" ON CONFLICT (homework_id, user_id)");
        query.append(" DO UPDATE SET state_id = excluded.state_id");
        values.add(homeworkId);
        values.add(stateId);
        values.add(user.getUserId());

        Sql.getInstance().prepared(query.toString(), values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getHomeworkTypes(String structure_id, Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder();
        JsonArray param = new JsonArray();
        query.append("SELECT * FROM diary.homework_type " + "WHERE structure_id = ? ORDER BY rank;");
        param.add(structure_id);

        Sql.getInstance().prepared(query.toString(), param, SqlResult.validResultHandler(handler));
    }

    @Override
    public void createHomeworkType(JsonObject homeworkType, Handler<Either<String, JsonObject>> handler) {
        String maxQuery = "Select MAX(rank) as max, nextval('diary.homework_type_id_seq') as id from diary.homework_type "
                + "where structure_id = '" + homeworkType.getString("structure_id") + "'";
        sql.raw(maxQuery, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    try {
                        final Number rank = event.right().getValue().getInteger("max");
                        final Number id = event.right().getValue().getInteger("id");

                        JsonArray statements = new JsonArray();
                        statements.add(getInsertHomeworkTypeStatement(homeworkType,rank.intValue() + 1));
                        sql.transaction(statements, new Handler<Message<JsonObject>>() {
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

    private JsonObject getInsertHomeworkTypeStatement(JsonObject homeworkType, Number rank) {
        String query = " INSERT INTO diary.homework_type(structure_id, label, rank)" + "VALUES (?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(homeworkType.getString("structure_id"))
                .add(homeworkType.getString("label"))
                .add(rank);
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    @Override
    public void updateHomeworkType(Integer id, JsonObject homeworkType, Handler<Either<String, JsonObject>> handler) {
        JsonArray params = new JsonArray();
        String query = "UPDATE diary.homework_type SET structure_id = ?, label = ? WHERE id = ?";
        params.add(homeworkType.getString("structure_id"));
        params.add(homeworkType.getString("label"));
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteHomeworkType(Integer id, String structure_id, Handler<Either<String, JsonObject>> handler) {
        JsonArray params = new JsonArray();
        String query = "DELETE FROM diary.homework_type ht " +
                "WHERE not Exists (SELECT 1 from diary.homework h WHERE ht.id =  h.type_id)" +
                "AND not Exists (SELECT 1 from diary.progression_homework ph WHERE ht.id = ph.type_id) " +
                "AND Exists (SELECT 1 FROM diary.homework_type htt WHERE structure_id = ? HAVING COUNT(htt.id) > 1) " +
                "AND ht.id = ? RETURNING id";
        params.add(structure_id);
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getWorkloadWeek(final String date, final String audienceId, Handler<Either<String, JsonArray>> handler) {
        if (date != null && !date.isEmpty()) {

            StringBuilder query = new StringBuilder();
            query.append(" select z.day, COALESCE(sum(h.workload),0) as total, count(h.*) as count from  " );
            query.append(" ( " );
            query.append(" select (date_trunc('week',to_date(?, 'YYYY-MM-DD'))::date) + i as day " );
            query.append(" from generate_series(0,6) i " );
            query.append(" ) z " );
            query.append(" left outer join diary.homework h on h.due_date = z.day and h.audience_id = ? " );
            query.append(" group by z.day order by z.day " );

            JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
            parameters.add(date);
            parameters.add(audienceId);

            Sql.getInstance().prepared(query.toString(), parameters, SqlResult.validResultHandler(handler));
        }
    }

}
