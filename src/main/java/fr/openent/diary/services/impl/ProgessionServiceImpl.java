package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.services.ProgressionService;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.user.UserInfos;

import java.util.Collections;

public class ProgessionServiceImpl extends SqlCrudService implements ProgressionService {
    private static final String STATEMENT = "statement";
    private static final String VALUES = "values";
    private static final String ACTION = "action";
    private static final String PREPARED = "prepared";
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);

    public ProgessionServiceImpl(String table) {
        super(table);
    }

    @Override
    public void getProgression(String progressionId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "SELECT ps.id, ps.class as class , title, ps.description, subject_label, ps.owner_id, ps.modified, ps.created, " +
                "array_to_json(array_agg(h.*)) as homeworks " +
                " from " + Diary.DIARY_SCHEMA + ".progression_session ps " +
                " LEFT JOIN ( " +
                "SELECT progression_homework.id as id , description::TEXT, progression_session_id, estimatedTime, owner_id::VARCHAR, created, modified " +
                " FROM  " + Diary.DIARY_SCHEMA + ".progression_homework " +
                " ) h ON h.progression_session_id = ps.id" +
                " where ps.id = ? " +
                " GROUP BY ps.id";

        params.add(progressionId);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));

    }

    @Override
    public void createFolder(HttpServerRequest request, JsonObject json, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();

        String query = "INSERT INTO diary.progression_folder (parent_id, teacher_id, title, created, modified) " +
                "VALUES (?, ?, ?, NOW(), NOW()) RETURNING id";

        Integer parentId = json.getInteger("parent_id");
        if (parentId == null) values.addNull();
        else values.add(parentId);
        values.add(user.getUserId());
        values.add(json.getString("title"));

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();


        String query = "SELECT fo.id, fo.parent_id, fo.title, fo.modified, fo.created, " +
                "array_to_json(array_agg(ps.*)) as progressions " +
                "FROM " + Diary.DIARY_SCHEMA + ".progression_folder fo " +
                "    FULL JOIN ( " +
                "    SELECT ps.id, ps.class as class, title, ps.description, ps.progression_folder_id, ps.owner_id, ps.subject_label, " +
                "    ps.modified, ps.created, array_to_json(array_agg(h.*)) as homeworks " +
                "    FROM " + Diary.DIARY_SCHEMA + ".progression_session ps " +
                "    LEFT JOIN ( " +
                " SELECT progression_homework.id as id, estimatedTime, description::TEXT, progression_session_id, owner_id::VARCHAR, created, modified " +
                " FROM " + Diary.DIARY_SCHEMA + ".progression_homework " +
                "    ) h ON h.progression_session_id = ps.id " +
                "    GROUP BY ps.id " +
                "    ORDER BY ps.title " +
                ") ps ON ps.progression_folder_id = fo.id " +
                "WHERE ps.owner_id = ? " +
                "OR fo.teacher_id = ? " +
                "GROUP BY fo.id " +
                "ORDER BY fo.title ";
        params.add(ownerId);
        params.add(ownerId);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));

    }

    @Override
    public void deleteProgressions(JsonObject progression, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from " + Diary.DIARY_SCHEMA + ".progression_session WHERE owner_id = ? AND id IN "
                + Sql.listPrepared(progression.getJsonArray("session_ids").getList());

        params.add(progression.getString("owner_id"));
        params.addAll(progression.getJsonArray("session_ids"));

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void deleteProgressionFolders(JsonObject progression, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from " + Diary.DIARY_SCHEMA + ".progression_folder WHERE teacher_id = ? AND id IN "
                + Sql.listPrepared(progression.getJsonArray("folder_ids").getList());
        ;

        params.add(progression.getString("owner_id"));
        params.addAll(progression.getJsonArray("folder_ids"));

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

    @Override
    public void updateProgressionFolder(JsonObject progression, String folderId, Handler<Either<String, JsonObject>> handler) {
        String query = " UPDATE " + Diary.DIARY_SCHEMA + ".progression_folder " +
                " SET parent_id = ?, title = ? " +
                " WHERE teacher_id = ? AND id = ? ";

        JsonArray params = new JsonArray();
        Integer parentId = progression.getInteger("parent_id");
        if (parentId == null) params.addNull();
        else params.add(parentId);

        params.add(progression.getString("title"))
                .add(progression.getString("owner_id"))
                .add(folderId);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(res -> {
            if (res.isLeft()) {
                LOGGER.error("An error occurred when update progression folder", res.left().getValue());
                handler.handle(new Either.Left<>(res.left().getValue()));
            }
            handler.handle(new Either.Right<>(res.right().getValue()));
        }));
    }

    @Override
    public void updateProgressions(JsonObject progression, String progressionId, Handler<Either<String, JsonObject>> handler) {


        try {
            JsonArray statements = new JsonArray();
            statements.add(getProgressionSessionUpdateStatement(progression, progressionId));

            if (progression.containsKey("progression_homeworks")) {
                JsonArray homeworks = progression.getJsonArray("progression_homeworks");

                for (int i = 0; i < homeworks.size(); i++) {
                    if (homeworks.getJsonObject(i).containsKey("id") && homeworks.getJsonObject(i).getInteger("id") != null) {
                        statements.add(getUpdateProgressionHomeworksStatement(homeworks.getJsonObject(i)));

                    } else {
                        statements.add(getHomeworkCreationStatement(Integer.parseInt(progressionId), homeworks.getJsonObject(i)));
                    }
                }
            }
            sql.transaction(statements, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {
                    Number id = Integer.parseInt(progressionId);
                    handler.handle(SqlQueryUtils.getTransactionHandler(event, id));
                }
            });
        } catch (ClassCastException e) {
            LOGGER.error("An error occurred when insert progression", e);
            handler.handle(new Either.Left<String, JsonObject>(""));

        }


    }

    private JsonObject getProgressionSessionUpdateStatement(JsonObject progression, String progressionId) {
        JsonArray params;
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".progression_session " +
                "SET subject_label = ?,  modified = NOW(), title = ? , description = ? , annotation = ?, owner_id = ?, class = ?, " +
                "progression_folder_id = ? Where progression_session.id = ?  ";
        params = new JsonArray().add(progression.getString("subjectLabel"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"))
                .add(progression.getString("class"));
        if (progression.getInteger("progression_folder_id") != null) {
            params.add(progression.getInteger("progression_folder_id"));
        } else {
            params.addNull();
        }
        params.add(progressionId);


        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    /**
     * Update the homeworks of a progression
     *
     * @param homework
     */
    private JsonObject getUpdateProgressionHomeworksStatement(JsonObject homework) {
        JsonArray params = new JsonArray();

        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".progression_homework " +
                "SET description = ?, owner_id = ?, estimatedTime = ? " +
                "WHERE id = ?";

        params.add(homework.getString("description"))
                .add(homework.getString("owner_id"))
                .add(homework.getInteger("estimatedTime"))
                .add(homework.getInteger("id"))
        ;


        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    @Override
    public void createSessionProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler) {


        JsonArray params;
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".progression_session" +
                "(subject_label, title, description, annotation, owner_id, class, progression_folder_id) " +
                "values ( ?, ?, ?, ?, ?, ?, ?) " +
                "RETURNING id;";


        params = new JsonArray().add(progression.getString("subjectLabel"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"))
                .add(progression.getString("class"));

        Integer folder_id = progression.getInteger("progression_folder_id");
        if (folder_id == null) params.addNull();
        else params.add(folder_id);

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));

    }


    @Override
    public void deleteHomeworkProgression(String progressionHomeworkId, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();

        String query = "DELETE from " + Diary.DIARY_SCHEMA + ".progression_homework" +
                " WHERE id = ?";


        params.add(progressionHomeworkId);

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));

    }

    @Override
    public void createHomeworkProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler) {

    }

    @Override
    public void createFullProgression(JsonObject progression, Handler<Either<String, JsonObject>> handler) {
        String getIdQuery = "SELECT nextval('" + Diary.DIARY_SCHEMA + ".progression_session_id_seq') as id";
        sql.raw(getIdQuery, SqlResult.validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    try {
                        final Number id = event.right().getValue().getInteger("id");
                        JsonArray homeworks = progression.getJsonArray("progression_homeworks");
                        JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
                        statements.add(getProgressionSessionCreationstatement(id, progression));

                        for (int i = 0; i < homeworks.size(); i++) {
                            statements.add(getHomeworkCreationStatement(id, homeworks.getJsonObject(i)));
                        }
                        sql.transaction(statements, new Handler<Message<JsonObject>>() {
                            @Override
                            public void handle(Message<JsonObject> event) {
                                handler.handle(SqlQueryUtils.getTransactionHandler(event, id));
                            }
                        });
                    } catch (ClassCastException e) {
                        LOGGER.error("An error occurred when insert progression", e);
                        handler.handle(new Either.Left<String, JsonObject>(""));
                    }

                } else {
                    LOGGER.error("An error occurred when selecting next val");
                    handler.handle(new Either.Left<String, JsonObject>(""));
                }
            }


        }));
    }


    /**
     * Create insert request for a progression
     *
     * @param id
     * @param progression
     * @return
     */
    private JsonObject getProgressionSessionCreationstatement(Number id, JsonObject progression) {
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".progression_session ( id, subject_label, title, description, annotation, owner_id, class, progression_folder_id) " +
                "values ( ?, ?, ?, ?, ?, ?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(id)
                .add(progression.getString("subjectLabel"))
                .add(progression.getString("title"))
                .add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"))
                .add(progression.getString("class"));

        Integer folder_id = progression.getInteger("progression_folder_id");
        if (folder_id == null) params.addNull();
        else params.add(folder_id);

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }


    /**
     * Create insert request for an homework from a progression session
     *
     * @param id
     * @param homework
     * @return
     */
    private JsonObject getHomeworkCreationStatement(Number id, JsonObject homework) {
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".progression_homework ( progression_session_id , description, owner_id, estimatedTime ) " +
                "values ( ?, ?, ?, ? )";
        JsonArray params = new JsonArray()
                .add(id)
                .add(homework.getString("description"))
                .add(homework.getString("owner_id"))
                .add(homework.getInteger("estimatedTime"));
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    /**
     * Get all the params from session needed to create an homework
     *
     * @param event
     * @return
     */
    private JsonObject getSessionJsonObject(Either<String, JsonObject> event) {
        JsonObject session = new JsonObject();
        final Integer id = event.right().getValue().getInteger("id");

        final String subject_id = event.right().getValue().getString("subject_id");
        final String color = event.right().getValue().getString("color");
        final String structure_id = event.right().getValue().getString("structure_id");
        final String teacher_id = event.right().getValue().getString("teacher_id");
        final String audience_id = event.right().getValue().getString("audience_id");
        final String date = event.right().getValue().getString("date");
        final boolean is_published = event.right().getValue().getBoolean("is_published");
        session.put("subject_id", subject_id)
                .put("color", color)
                .put("structure_id", structure_id)
                .put("teacher_id", teacher_id)
                .put("audience_id", audience_id)
                .put("is_published", is_published)
                .put("date", date)
                .put("id", id);
        return session;
    }

    /**
     * Create homeworks from progression_homeworks
     *
     * @param session
     * @param homework
     * @return
     */
    private JsonObject getHomeworksProgressionToHomeworks(JsonObject homework, JsonObject session) { //todo vérifier
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".homework (subject_id, structure_id, teacher_id, audience_id, estimatedTime,  " +
                " color, description, is_published, session_id, due_date, owner_id" +
                " ,created, modified)  " +
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,  " +
                " to_date(?,'YYYY-MM-DD'), ?, NOW(), NOW()) RETURNING id";
        JsonArray params = new JsonArray()
                .add(session.getString("subject_id"))
                .add(session.getString("structure_id"))
                .add(session.getString("teacher_id"))
                .add(session.getString("audience_id"))
                .add(homework.getInteger("estimatedTime"))
                .add(session.getString("color"))
                .add(homework.getString("description"))
                .add(session.getBoolean("is_published"))
                .add(session.getInteger("id"))
                .add(session.getString("date"))
                .add(homework.getString("owner_id"));
        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);

    }

    @Override
    public void progressionToSession(JsonObject progression, String idProgression, String idSession, Handler<Either<String, JsonObject>> handler) {

        String getIdQuery = "SELECT id, subject_id, color, structure_id, teacher_id, date, " +
                "is_published, audience_id, type_id " +
                "FROM " + Diary.DIARY_SCHEMA + ".session s WHERE s.id = ? AND s.archive_school_year IS NULL";
        JsonArray params = new JsonArray(Collections.singletonList(idSession));
        sql.prepared(getIdQuery, params, SqlResult.validUniqueResultHandler(event -> {
            if (event.isRight()) {
                try {
                    final Number id = event.right().getValue().getInteger("id");

                    JsonObject session = getSessionJsonObject(event);

                    JsonArray statements = new fr.wseduc.webutils.collections.JsonArray();
                    JsonArray homeworks = progression.getJsonArray("progression_homeworks");
                    statements.add(getSessionUpdateStatement(progression, id));

                    for (int i = 0; i < homeworks.size(); i++) {
                        statements.add(getHomeworksProgressionToHomeworks(homeworks.getJsonObject(i), session));
                    }
                    sql.transaction(statements, event1 -> handler.handle(SqlQueryUtils.getTransactionHandler(event1, id)));
                } catch (ClassCastException e) {
                    LOGGER.error("An error occurred when insert progression", e);
                    handler.handle(new Either.Left<>(""));

                }

            } else {
                LOGGER.error("[Diary@ProgressionServiceImpl::progressionToSession] An error occurred when selecting id");
            }
        }));

    }

    private JsonObject getSessionUpdateStatement(JsonObject progression, Number sessionId) {
        JsonArray params;
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".session " +
                "SET description = ? , annotation = ?, owner_id = ?" +
                "Where session.id = ?  ";
        params = new JsonArray().add(progression.getString("description"))
                .add(progression.getString("annotation"))
                .add(progression.getString("owner_id"))
                .add(sessionId);

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }
}