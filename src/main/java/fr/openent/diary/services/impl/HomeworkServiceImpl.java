package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.models.Audience;
import fr.openent.diary.models.Person.User;
import fr.openent.diary.models.Subject;
import fr.openent.diary.services.*;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
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
import java.util.Map;
import java.util.stream.Collectors;

public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {
    private static final String STATEMENT = "statement" ;
    private static final String VALUES = "values" ;
    private static final String ACTION = "action" ;
    private static final String PREPARED = "prepared" ;
    private static final Logger LOGGER = LoggerFactory.getLogger(ProgessionServiceImpl.class);

    private final DiaryService diaryService = new DiaryServiceImpl();
    private final SubjectService subjectService;
    private final GroupService groupService;
    private final UserService userService;

    public HomeworkServiceImpl(String table, EventBus eb) {
        super(table);
        this.subjectService = new DefaultSubjectService(eb);
        this.groupService = new DefaultGroupService(eb);
        this.userService = new DefaultUserService();
    }


    public  void getHomeworkStudent(long homeworkId, String studentId, UserInfos user, Handler<Either<String, JsonObject>> handler){
        StringBuilder query = new StringBuilder();

        query.append(" SELECT h.*, to_json(type) as type, to_json(progress_and_state) as progress");
        query.append(" FROM " + Diary.DIARY_SCHEMA + ".homework h");
        query.append(" LEFT JOIN " + Diary.DIARY_SCHEMA + ".homework_type AS type ON type.id = h.type_id");
        query.append(" LEFT JOIN (");
        query.append("   SELECT progress.*, homework_state.label as state_label");
        query.append("   FROM " + Diary.DIARY_SCHEMA + ".homework_progress progress");
        query.append("   INNER JOIN " + Diary.DIARY_SCHEMA + ".homework_state ON progress.state_id = homework_state.id");
        query.append("   WHERE  progress.user_id =  '").append(studentId).append("'");
        query.append(" )  as progress_and_state ON (h.id = progress_and_state.homework_id)");
        query.append(" WHERE h.id = ").append(homeworkId);

        proceedHomework(handler, query.toString());
    }

    @Override
    public void getHomework(long homeworkId, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        String query = " SELECT h.*, to_json(type) as type, to_json(session) as session"
        + " FROM " + Diary.DIARY_SCHEMA + ".homework h"
        + " LEFT JOIN " + Diary.DIARY_SCHEMA + ".homework_type AS type ON type.id = h.type_id"
        + " LEFT JOIN " + Diary.DIARY_SCHEMA + ".session AS session ON session.id = h.session_id"
        + " WHERE h.id = " + homeworkId;

        proceedHomework(handler, query);
    }

    private void cleanHomework(JsonObject homework){
        if(homework.getString("type") != null)
            homework.put("type", new JsonObject(homework.getString("type")));

        if(homework.getString("session") != null)
            homework.put("session", new JsonObject(homework.getString("session")));

        if(homework.getString("progress") != null)
            homework.put("progress", new JsonObject(homework.getString("progress")));
    }

    @Override
    public void getOwnHomeworks(String structureId, String startDate, String endDate, UserInfos user, String subjectId, Handler<Either<String, JsonArray>> handler) {
        if (user.getType().equals("Student")) {
            this.getChildHomeworks(structureId, startDate, endDate, user.getUserId(), subjectId, handler);
        } else if (user.getType().equals("Teacher")) {
            this.getHomeworks(structureId, startDate, endDate, user.getUserId(),null, null, subjectId, false, handler);
        }
    }

    @Override
    public void getExternalHomeworks(String startDate, String endDate, String teacherId, String audienceId, String subjectId, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = audienceId != null && !audienceId.equals("") ? Arrays.asList(audienceId) : null;
        List<String> listTeacherId = teacherId != null && !teacherId.equals("") ? Arrays.asList(teacherId) : null;

        this.getHomeworks("", startDate, endDate, null, listAudienceId, listTeacherId, subjectId, true, handler);
    }

    @Override
    public void getChildHomeworks(String structureId, String startDate, String endDate, String childId, String subjectId, Handler<Either<String, JsonArray>> handler) {
        // Get child audiences
        diaryService.getAudienceFromChild(childId, response -> {
            if(response.isRight()){
                List<String> listAudienceId = new ArrayList<>();
                JsonArray result = response.right().getValue();
                for (int i = 0; i < result.size(); i++) {
                    listAudienceId.add(result.getJsonObject(i).getString("audienceId"));
                }
                this.getStudentHomeworks(structureId, childId, startDate, endDate, null, listAudienceId, null, subjectId, true,  handler);
            }
        });
    }

    /**
     * Query homeworks
     * @param structureId return homeworks with structure Id
     * @param startDate return homeworks in the date or after
     * @param endDate return homeworks in the date or before
     * @param ownerId return homeworks with this ownerId
     * @param listAudienceId return homeworks with a audience_id field inside this list
     * @param listTeacherId return homeworks with a teacher_id field inside this list
     * @param onlyPublished returns only published homeworks
     * @param handler function handler data send array of homeworks
     */
    private void getHomeworks(String structureId, String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                              String subjectId, boolean onlyPublished, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query;

        query = this.getCTEHomeworkQuery(structureId, startDate, endDate, ownerId, listAudienceId, listTeacherId, subjectId, onlyPublished, values) +
                this.getSelectHomeworkQuery();

        proceedHomeworks(handler, values, query);
    }

    private void proceedHomework(Handler<Either<String, JsonObject>> handler, String query) {
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(result -> {

            if (result.isRight()) {
                JsonObject homework = result.right().getValue();
                cleanHomework(homework);

                List<String> subjectIds = new ArrayList<>();
                List<String> teacherIds = new ArrayList<>();
                List<String> audienceIds = new ArrayList<>();

                subjectIds.add(homework.getString("subject_id"));
                teacherIds.add(homework.getString("teacher_id"));
                audienceIds.add(homework.getString("audience_id"));


                Future<List<Subject>> subjectsFuture = Future.future();
                Future<List<User>> teachersFuture = Future.future();
                Future<List<Audience>> audiencesFuture = Future.future();

                CompositeFuture.all(subjectsFuture, teachersFuture, audiencesFuture).setHandler(asyncResult -> {
                    if (asyncResult.failed()) {
                        String message = "[Diary@HomeworkServiceImpl::proceedHomework] Failed to get homework. ";
                        LOGGER.error(message + " " + asyncResult.cause());
                        handler.handle(new Either.Left<>(asyncResult.cause().getMessage()));
                    } else {
                        Map<String, Subject> subjectMap = subjectsFuture.result()
                                .stream()
                                .collect(Collectors.toMap(Subject::getId, Subject::clone, (subject1, subject2) -> subject1));
                        Map<String, User> teacherMap = teachersFuture.result()
                                .stream()
                                .collect(Collectors.toMap(User::getId, User::clone, (teacher1, teacher2) -> teacher1));
                        Map<String, Audience> audienceMap = audiencesFuture.result()
                                .stream()
                                .collect(Collectors.toMap(Audience::getId, Audience::clone, (audience1, audience2) -> audience1));

                        if (!homework.getString("subject_id").equals("exceptional")) {
                            homework.put("subject", subjectMap.getOrDefault(homework.getString("subject_id"), new Subject()).toJSON());
                        } else {
                            JsonObject exceptionalSubject = new JsonObject()
                                    .put("id", "exceptional")
                                    .put("name", homework.getString("exceptional_label"));


                            homework.put("subject", new Subject(exceptionalSubject).toJSON());
                        }
                        homework.put("teacher", teacherMap.getOrDefault(homework.getString("teacher_id"), new User()).toJSON());
                        homework.put("audience", audienceMap.getOrDefault(homework.getString("audience_id"), new Audience()).toJSON());

                        handler.handle(new Either.Right<>(homework));
                    }
                });
                this.subjectService.getSubjects(new JsonArray(subjectIds), subjectsFuture);
                this.userService.getTeachers(new JsonArray(teacherIds), teachersFuture);
                this.groupService.getGroups(new JsonArray(audienceIds), audiencesFuture);
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    private void proceedHomeworks(Handler<Either<String, JsonArray>> handler, JsonArray values, String query) {
        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(result -> {
            // Formatting String into JsonObject
            if (result.isRight()) {
                JsonArray arrayHomework = result.right().getValue();

                List<String> subjectIds = new ArrayList<>();
                List<String> teacherIds = new ArrayList<>();
                List<String> audienceIds = new ArrayList<>();
                for (int i = 0; i < arrayHomework.size(); i++) {
                    cleanHomework(arrayHomework.getJsonObject(i));
                    if (!subjectIds.contains(arrayHomework.getJsonObject(i).getString("subject_id"))) {
                        subjectIds.add(arrayHomework.getJsonObject(i).getString("subject_id"));
                    }
                    if (!teacherIds.contains(arrayHomework.getJsonObject(i).getString("teacher_id"))) {
                        teacherIds.add(arrayHomework.getJsonObject(i).getString("teacher_id"));
                    }
                    if (!audienceIds.contains(arrayHomework.getJsonObject(i).getString("audience_id"))) {
                        audienceIds.add(arrayHomework.getJsonObject(i).getString("audience_id"));
                    }
                }
                Future<List<Subject>> subjectsFuture = Future.future();
                Future<List<User>> teachersFuture = Future.future();
                Future<List<Audience>> audiencesFuture = Future.future();

                CompositeFuture.all(subjectsFuture, teachersFuture, audiencesFuture).setHandler(asyncResult -> {
                    if (asyncResult.failed()) {
                        String message = "[Diary@HomeworkServiceImpl::proceedHomeworks] Failed to get homeworks. ";
                        LOGGER.error(message + " " + asyncResult.cause());
                        handler.handle(new Either.Left<>(asyncResult.cause().getMessage()));
                    } else {
                        // for some reason, we still manage to find some "duplicate" data so we use mergeFunction (see collectors.toMap)
                        Map<String, Subject> subjectMap = subjectsFuture.result()
                                .stream()
                                .collect(Collectors.toMap(Subject::getId, Subject::clone, (subject1, subject2) -> subject1));
                        Map<String, User> teacherMap = teachersFuture.result()
                                .stream()
                                .collect(Collectors.toMap(User::getId, User::clone, (teacher1, teacher2) -> teacher1));
                        Map<String, Audience> audienceMap = audiencesFuture.result()
                                .stream()
                                .collect(Collectors.toMap(Audience::getId, Audience::clone, (audience1, audience2) -> audience1));

                        for (int i = 0; i < arrayHomework.size(); i++) {
                            JsonObject homework = arrayHomework.getJsonObject(i);
                            homework.put("subject", subjectMap.getOrDefault(homework.getString("subject_id"), new Subject()).toJSON());
                            homework.put("teacher", teacherMap.getOrDefault(homework.getString("teacher_id"), new User()).toJSON());
                            homework.put("audience", audienceMap.getOrDefault(homework.getString("audience_id"), new Audience()).toJSON());
                        }
                        handler.handle(new Either.Right<>(arrayHomework));
                    }
                });
                this.subjectService.getSubjects(new JsonArray(subjectIds), subjectsFuture);
                this.userService.getTeachers(new JsonArray(teacherIds), teachersFuture);
                this.groupService.getGroups(new JsonArray(audienceIds), audiencesFuture);
            } else {
                handler.handle(new Either.Left<>(result.left().getValue()));
            }
        }));
    }

    private String getSelectHomeworkQuery() {
        String query = " SELECT h.*" +
                " FROM homework_filter h" +
                " LEFT JOIN diary.session s ON (h.session_id = s.id)" +
                " ORDER  BY h.due_date ASC";

        return query;
    }

    private String getWhereContentGetHomeworkQuery(String structureID, String startDate, String endDate, String ownerId,
                                                   List<String> listAudienceId, List<String> listTeacherId,
                                                   String subjectId, boolean onlyPublished, JsonArray values,
                                                   String query) {
        if (startDate != null && endDate != null) {
            query += " AND (h.due_date >= to_date(?,'YYYY-MM-DD')";
            query += " AND h.due_date <= to_date(?,'YYYY-MM-DD')";
            query += ")";
            values.add(startDate);
            values.add(endDate);
        }

        if(structureID != ("")) {
            query += " AND h.structure_id = ?";
            values.add(structureID);
        }

        if (listAudienceId != null && !listAudienceId.isEmpty()) {
            query += " AND h.audience_id IN " + (Sql.listPrepared(listAudienceId.toArray()));
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
        }

        if (listTeacherId != null && !listTeacherId.isEmpty()) {
            query += " AND h.teacher_id IN " + (Sql.listPrepared(listTeacherId.toArray()));
            for (String teacherId : listTeacherId) {
                values.add(teacherId);
            }
        }

        if (subjectId != null && !subjectId.isEmpty()) {
            query += " AND h.subject_id = ?";
            values.add(subjectId);
        }

        if (onlyPublished) {
            query += " AND h.is_published = true";
        }

        if (ownerId != null) {
            query += " AND h.owner_id = ?";
            values.add(ownerId);
        }

        return query;
    }


    private String getCTEHomeworkQuery(String structureID, String startDate, String endDate, String ownerId,
                                       List<String> listAudienceId, List<String> listTeacherId, String subjectId,
                                       boolean onlyPublished, JsonArray values) {
        String query = " WITH homework_filter AS (" +
                        " SELECT h.*, to_json(homework_type) as type " +
                        " FROM " + Diary.DIARY_SCHEMA + ".homework h" +
                        " INNER JOIN diary.homework_type ON h.type_id = homework_type.id";

        query = getWhereContentGetHomeworkQuery(structureID, startDate, endDate, ownerId, listAudienceId, listTeacherId, subjectId, onlyPublished, values, query);
        query += " ) ";

        return query.replaceFirst("AND", "WHERE");
    }

    private String getSelectHomeworkStudentQuery(String studentId) {
       String query = " SELECT h.*, " + " to_json(progress_and_state) as progress" +
                " FROM homework_filter h" +
                " INNER JOIN diary.homework_type AS type ON type.id = h.type_id" +
                " LEFT JOIN (" +
                " SELECT progress.*, homework_state.label as state_label" +
                " FROM diary.homework_progress progress" +
                " INNER JOIN diary.homework_state ON progress.state_id = homework_state.id" +
                " WHERE  progress.user_id = '" + studentId + "'"
                + " )" +
                " AS progress_and_state ON (h.id = progress_and_state.homework_id)" +
                " ORDER BY h.due_date ASC";

        return query.replaceFirst("AND", "WHERE");
    }

    /**
     * Query homeworks
     * @param structureId return homeworks with this structureId
     * @param studentId return homework with this studentId
     * @param startDate return homeworks in the date or after
     * @param endDate return homeworks in the date or before
     * @param ownerId return homeworks with this ownerId
     * @param listAudienceId return homeworks with a audience_id field inside this list
     * @param listTeacherId return homeworks with a teacher_id field inside this list
     * @param onlyPublished returns only published homeworks
     * @param handler function handler data send array of homeworks
     */
    private void getStudentHomeworks(String structureId, String studentId, String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                              String subjectId, boolean onlyPublished, Handler<Either<String, JsonArray>> handler) {

        JsonArray values = new JsonArray();

        String query;
        query = this.getCTEHomeworkQuery(structureId, startDate, endDate, ownerId, listAudienceId, listTeacherId, subjectId, onlyPublished, values)
                + this.getSelectHomeworkStudentQuery(studentId);

        proceedHomeworks(handler, values, query);
    }

    @Override
    public void createHomework(JsonObject homework, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".homework (subject_id, exceptional_label, structure_id, teacher_id, audience_id, estimatedTime, " +
                "color, description, is_published, from_session_id, session_id, due_date, type_id, owner_id " +
                ", created, modified" + ((homework.getBoolean("is_published") == true)? " , publish_date) " : ")" )+
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " +
                "to_date(?,'YYYY-MM-DD'), ?, ?, NOW()," +
                " NOW()"+((homework.getBoolean("is_published") == true)? " , NOW()) " : ")" )+" RETURNING id";

        values.add(homework.getString("subject_id"));

        if (homework.getString("exceptional_label") != null) {
            values.add(homework.getString("exceptional_label"));
        } else {
            values.addNull();
        }

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

        if (homework.getInteger("from_session_id") != null) {
            values.add(homework.getInteger("from_session_id"));
        } else {
            values.addNull();
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
    public void updateHomework(long homeworkId,boolean publishedChanged, JsonObject homework, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".homework " +
                "SET subject_id = ?, exceptional_label = ?, structure_id = ?, audience_id = ?, estimatedTime = ?," +
                " color = ?, description = ?, type_id = ?,  modified = NOW() " ;

        values.add(homework.getString("subject_id"));
        if (homework.getString("exceptional_label") != null) {
            values.add(homework.getString("exceptional_label"));
        } else {
            values.addNull();
        }
        values.add(homework.getString("structure_id"));
        values.add(homework.getString("audience_id"));
        values.add(homework.getInteger("estimatedTime"));
        values.add(homework.getString("color"));
        values.add(homework.getString("description"));
        values.add(homework.getInteger("type_id"));

        if(homework.getBoolean("is_published") != null) {
            query += ", is_published = ?";
            values.add(homework.getBoolean("is_published"));
        }

        if (homework.getInteger("session_id") != null) {
            query += ", session_id = ?";
            values.add(homework.getInteger("session_id"));
        }

        if (homework.getString("due_date") != null) {
            query += ", due_date = ?";
            values.add(homework.getString("due_date"));
        }

        if(publishedChanged && homework.getBoolean("is_published")){
            query +=  ",publish_date = NOW ()  " ;
        }

        query +=  " WHERE id = ?;";
        values.add(homeworkId);

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".homework WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void publishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".homework SET is_published = true, publish_date = NOW() WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void unpublishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".homework SET is_published = false WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    public static final int HOMEWORK_STATE_TODO = 1;
    public static final int HOMEWORK_STATE_DONE = 2;

    @Override
    public void setProgressHomework(long homeworkId, String state, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        int stateId = "done".equals(state) ? HOMEWORK_STATE_DONE : HOMEWORK_STATE_TODO;
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();
        query.append(" INSERT INTO " + Diary.DIARY_SCHEMA + ".homework_progress (homework_id, state_id, user_id)");
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
        query.append("SELECT * FROM " + Diary.DIARY_SCHEMA + ".homework_type " + "WHERE structure_id = ? ORDER BY rank;");
        param.add(structure_id);

        Sql.getInstance().prepared(query.toString(), param, SqlResult.validResultHandler(handler));
    }

    @Override
    public void createHomeworkType(JsonObject homeworkType, Handler<Either<String, JsonObject>> handler) {
        String maxQuery = "Select MAX(rank) as max, nextval('" + Diary.DIARY_SCHEMA + ".homework_type_id_seq') as id from " + Diary.DIARY_SCHEMA + ".homework_type "
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
        String query = " INSERT INTO " + Diary.DIARY_SCHEMA + ".homework_type(structure_id, label, rank)" + "VALUES (?, ?, ?)";
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
        String query = "UPDATE " + Diary.DIARY_SCHEMA + ".homework_type SET structure_id = ?, label = ? WHERE id = ?";
        params.add(homeworkType.getString("structure_id"));
        params.add(homeworkType.getString("label"));
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteHomeworkType(Integer id, String structure_id, Handler<Either<String, JsonObject>> handler) {
        JsonArray params = new JsonArray();
        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".homework_type ht " +
                "WHERE not Exists (SELECT 1 from " + Diary.DIARY_SCHEMA + ".homework h WHERE ht.id =  h.type_id)" +
                "AND not Exists (SELECT 1 from " + Diary.DIARY_SCHEMA + ".progression_homework ph WHERE ht.id = ph.type_id) " +
                "AND Exists (SELECT 1 FROM diary.homework_type htt WHERE structure_id = ? HAVING COUNT(htt.id) > 1) " +
                "AND ht.id = ? RETURNING id";
        params.add(structure_id);
        params.add(id);

        Sql.getInstance().prepared(query, params, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getWorkload(String structureId, String audienceId, String dueDate, boolean isPublished, Handler<Either<String, JsonArray>> handler) {
        JsonArray params = new JsonArray();
        String query = "SELECT COUNT(*) FROM " + Diary.DIARY_SCHEMA + ".homework " +
                "WHERE structure_id = ? AND audience_id = ? AND due_date = ? AND is_published = true";
        params.add(structureId);
        params.add(audienceId);
        params.add(dueDate);

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(handler));
    }

}