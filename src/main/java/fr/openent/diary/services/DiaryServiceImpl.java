package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.utils.SearchCriterion;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.Either;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryServiceImpl extends SqlCrudService implements DiaryService {

    private final Neo4j neo = Neo4j.getInstance();

    private final String QUERY_RETURN_TYPE_BOTH = "both";
    private final String QUERY_RETURN_TYPE_LESSON = "lesson";
    private final String QUERY_RETURN_TYPE_HOMEWORK = "homework";

    private final static String DATABASE_TABLE ="teacher"; //TODO handle attachments manually or the opposite?
    private final static Logger log = LoggerFactory.getLogger(DiaryServiceImpl.class);
    private static final String TEACHER_ID_FIELD_NAME = "id";
    private static final String TEACHER_DISPLAY_NAME_FIELD_NAME = "teacher_display_name";

    private static final String LESSON_GESTIONNAIRE_RIGHT   = "fr-openent-diary-controllers-LessonController|modifyLesson";
    private static final String HOMEWORK_GESTIONNAIRE_RIGHT = "fr-openent-diary-controllers-HomeworkController|modifyHomework";

    public DiaryServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
    }

    @Override
    public void getOrCreateTeacher(final String teacherId, final String teacherDisplayName, final Handler<Either<String, JsonObject>> handler) {

            log.debug("getOrCreateTeacher: " + teacherId);
            if (StringUtils.isValidIdentifier(teacherId)) {
                retrieveTeacher(teacherId, new Handler<Either<String, JsonObject>>() {
                    @Override
                    public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        if (event.right().getValue().size() == 0) {
                            log.debug("No teacher, create it");
                            createTeacher(teacherId, teacherDisplayName, handler);
                        } else {
                            log.debug("Teacher found");
                            handler.handle(new Either.Right<String, JsonObject>(event.right().getValue().putBoolean("teacherFound", true)));
                        }
                    } else {
                        log.debug("error while retrieve teacher");
                        handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                    }
                    }
                });
            } else {
                String errorMessage = "Invalid teacher identifier.";
                log.debug(errorMessage);
                handler.handle(new Either.Left<String, JsonObject>(errorMessage));
            }
    }

    @Override
    public void retrieveTeacher(String teacherId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM diary.teacher as t WHERE t.id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void createTeacher(final String teacherId, final String teacherDisplayName, final Handler<Either<String, JsonObject>> handler) {
        if(StringUtils.isValidIdentifier(teacherId)) { //TODO change to StringUtils/UUID utils?
            //insert teacher
            JsonObject teacherParams = new JsonObject();
            teacherParams.putString(TEACHER_ID_FIELD_NAME, teacherId);
            teacherParams.putString(TEACHER_DISPLAY_NAME_FIELD_NAME, teacherDisplayName);
            sql.insert("diary.teacher", teacherParams, "id", validUniqueResultHandler(handler));
        } else {
            String errorMessage = "Invalid teacher identifier.";
            handler.handle(new Either.Left<String, JsonObject>(errorMessage));
        }
    }

    /**
     * Creates a subject
     * @param subjectObject
     * @param handler
     */
    @Override
    public void createSubject(final JsonObject subjectObject, final Handler<Either<String, JsonObject>> handler) {

        sql.raw("select nextval('diary.subject_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    log.debug(event.right().getValue());
                    Long nextId = event.right().getValue().getLong("next_id");
                    subjectObject.putNumber("id", nextId);

                    JsonArray parameters = new JsonArray().add(nextId);

                    SqlStatementsBuilder sb = new SqlStatementsBuilder();
                    sb.insert("diary.subject", subjectObject, "id");


                    sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                }
            }
        }));
    }

    @Override
    public void deleteSubject(String subjectId, Handler<Either<String, JsonObject>> handler) {

    }

    @Override
    public void listSubjects(final List<String> schoolIds, final String teacherId, final Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT s.id as id, s.subject_label as label, s.school_id ")
        .append(" FROM diary.subject as s ")
        .append(" WHERE s.school_id in")
        .append(sql.listPrepared(schoolIds.toArray()));

        JsonArray parameters = new JsonArray();
        for (String schoolId : schoolIds) {
            parameters.add(Sql.parseId(schoolId));
        }

        if(teacherId != null && !teacherId.trim().isEmpty()){
            query.append(" and s.teacher_id = ? ");
            parameters.add(teacherId.trim());
        }

        sql.prepared(query.toString(), parameters, SqlResult.validResultHandler(handler));
    }

    @Override
    public void listAudiences(String schoolId, final Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM diary.audience as s WHERE s.school_id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(schoolId));

        sql.prepared(query.toString(), parameters, SqlResult.validResultHandler(handler));
    }

    @Override
    public void createSubjects(List<JsonObject> subjectObjectList, Handler<Either<String, JsonObject>> handler) {

        SqlStatementsBuilder sb = new SqlStatementsBuilder();

        for (JsonObject subject : subjectObjectList) {
            sb.insert("diary.subject", subject, "id");
        }

        sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
    }

    private void addParameterLessonsAndHomeworks(Object parameter, JsonArray parametersLessons, JsonArray parametersHomeworks){
        parametersLessons.add(parameter);
        parametersHomeworks.add(parameter);
    }

    @Override
    public void listPedagogicItems(final UserInfos userInfos, List<SearchCriterion> criteria, List<String> groups, Handler<Either<String, JsonArray>> handler) {

        String queryReturnType = "";
        JsonArray parameters = new JsonArray();

        StringBuilder queryLessons = new StringBuilder();
        queryLessons.append("SELECT 'lesson' as type_item, '' as type_homework, l.id as id, s.subject_label as subject, l.id as lesson_id,")
                .append(" t.teacher_display_name as teacher, a.audience_label as audience, l.lesson_title as title, l.lesson_room as room,")
                .append(" l.lesson_color as color, l.lesson_state as state, l.lesson_date as day, l.lesson_start_time as start_time, l.lesson_end_time as end_time,")
                .append(" date_part('hour', l.lesson_start_time) as time_order, l.lesson_description as description, null as turn_in_type")
                .append(" FROM diary.lesson AS l")
                .append(" JOIN diary.teacher as t ON t.id = l.teacher_id")
                .append(" LEFT JOIN diary.homework as h ON l.id = h.lesson_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = l.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = l.audience_id")
                .append(" LEFT JOIN diary.lesson_shares AS ls ON l.id = ls.resource_id");

        //TODO : add number of homeworks for a lesson

        StringBuilder queryHomeworks = new StringBuilder();
        queryHomeworks.append("SELECT 'homework' as type_item, ht.homework_type_label as type_homework, h.id as id, s.subject_label as subject, h.lesson_id as lesson_id,")
                .append(" t.teacher_display_name as teacher, a.audience_label as audience, h.homework_title as title, '' as room,")
                .append(" h.homework_color as color, h.homework_state as state, h.homework_due_date as day, null as start_time, null as end_time,")
                .append(" 0 as time_order, h.homework_description as description, h.turn_in_type as turn_in_type")
                .append(" FROM diary.homework AS h")
                .append(" JOIN diary.teacher as t ON t.id = h.teacher_id")
                .append(" LEFT JOIN diary.homework_type as ht ON ht.id = h.homework_type_id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" LEFT JOIN diary.homework_shares AS hs ON h.id = hs.resource_id");


        StringBuilder whereLessons = new StringBuilder(" WHERE 1=1 ");
        StringBuilder whereHomeworks = new StringBuilder(" WHERE 1=1 ");
        JsonArray parametersLessons = new JsonArray();
        JsonArray parametersHomeworks = new JsonArray();
        Integer maxResults = null;
        boolean isAscSortOrder = true;

        for (SearchCriterion criterion: criteria) {

            switch (criterion.getType()) {
                case SORT_ORDER:
                                    isAscSortOrder = "ASC".equals(criterion.getValue().toString());
                                    break;
                case EXCLUDE_LESSON_ID:
                                    whereLessons.append(" AND l.id != ?");
                                    parametersLessons.add(criterion.getValue());break;

                case HOMEWORK_LINKED_TO_LESSON:
                                    whereHomeworks.append(" and h.lesson_id IS NOT NULL "); break;

                case START_DATE_TIME:
                                    whereLessons.append(" AND to_timestamp(to_char(l.lesson_date, 'YYYY-MM-DD') || ' ' || to_char(l.lesson_start_time, 'hh24:mi:ss'), 'YYYY-MM-DD hh24:mi:ss') >= to_timestamp(?, 'YYYY-MM-DD hh24:mi:ss')");
                                    parametersLessons.add(criterion.getValue());break;

                case END_DATE_TIME:
                                    whereLessons.append(" AND to_timestamp(to_char(l.lesson_date, 'YYYY-MM-DD') || ' ' || to_char(l.lesson_end_time, 'hh24:mi:ss'), 'YYYY-MM-DD hh24:mi:ss') <= to_timestamp(?, 'YYYY-MM-DD hh24:mi:ss')");
                                    parametersLessons.add(criterion.getValue());break;

                case END_DATE_LESSON:
                                    whereLessons.append(" AND l.lesson_date <= to_date(?,'YYYY-MM-DD')");
                                    parametersLessons.add(criterion.getValue());break;

                case START_DATE:    whereLessons.append(" AND l.lesson_date >= to_date(?,'YYYY-MM-DD')");
                                    whereHomeworks.append(" AND h.homework_due_date >= to_date(?,'YYYY-MM-DD')");
                                    addParameterLessonsAndHomeworks(criterion.getValue(), parametersLessons, parametersHomeworks);break;

                case END_DATE:      whereLessons.append(" AND l.lesson_date <= to_date(?,'YYYY-MM-DD')");
                                    whereHomeworks.append(" AND h.homework_due_date <= to_date(?,'YYYY-MM-DD')");
                                    addParameterLessonsAndHomeworks(criterion.getValue(), parametersLessons, parametersHomeworks);break;

                case AUDIENCE:      whereLessons.append(" AND l.audience_id = ?");
                                    whereHomeworks.append(" AND h.audience_id = ?");
                                    addParameterLessonsAndHomeworks(criterion.getValue(), parametersLessons, parametersHomeworks);break;

                case PUBLISH_STATE: whereLessons.append(" AND l.lesson_state = ?::diary.resource_state");
                                    whereHomeworks.append(" AND h.homework_state = ?::diary.resource_state");
                                    addParameterLessonsAndHomeworks(criterion.getValue(), parametersLessons, parametersHomeworks);break;

                case SUBJECT:       whereLessons.append(" AND l.subject_id = ?");
                                    whereHomeworks.append(" AND h.subject_id = ?");
                                    addParameterLessonsAndHomeworks(criterion.getValue(), parametersLessons, parametersHomeworks);break;

                case SEARCH_TYPE:   queryReturnType = (String) criterion.getValue(); break;

                case LIMIT:         maxResults = (Integer) criterion.getValue(); break;

                case TEACHER:       whereLessons.append(" AND (l.owner = ? OR ls.action = ?) ");
                                    whereHomeworks.append(" AND (h.owner = ? OR hs.action = ?) ");

                                    parametersLessons.add(criterion.getValue());
                                    parametersLessons.add(this.LESSON_GESTIONNAIRE_RIGHT);
                                    parametersHomeworks.add(criterion.getValue());
                                    parametersHomeworks.add(this.HOMEWORK_GESTIONNAIRE_RIGHT);
                                    break;
            }
        }

        //add groups for students
        if (groups != null) {
            String inClause = sql.listPrepared(groups.toArray());
            whereLessons.append(" AND l.audience_id in ");
            whereLessons.append(inClause);
            whereHomeworks.append(" AND h.audience_id in ");
            whereHomeworks.append(inClause);

            for(String groupId : groups){
                parametersLessons.add(Sql.parseId(groupId));
                parametersHomeworks.add(Sql.parseId(groupId));
            }
        }

        queryLessons.append(whereLessons);
        queryHomeworks.append(whereHomeworks);


        StringBuilder queryFull = new StringBuilder("SELECT * FROM ( ");
        if (queryReturnType.equals(QUERY_RETURN_TYPE_LESSON) || queryReturnType.equals(QUERY_RETURN_TYPE_BOTH)) {
            queryFull.append(queryLessons.toString());
        }

        if (queryReturnType.equals(QUERY_RETURN_TYPE_BOTH)) {
            queryFull.append(" UNION ");
        }

        if (queryReturnType.equals(QUERY_RETURN_TYPE_HOMEWORK) || queryReturnType.equals(QUERY_RETURN_TYPE_BOTH)) {
            queryFull.append(queryHomeworks.toString());
        }

        queryFull.append(" ) as req ");

        final String sortOrder = isAscSortOrder ? "ASC" : "DESC";
        queryFull.append(" ORDER BY req.day " + sortOrder + ", req.time_order " + sortOrder);

        if((queryReturnType.equals(QUERY_RETURN_TYPE_LESSON) || queryReturnType.equals(QUERY_RETURN_TYPE_BOTH)) && parametersLessons.size() > 0) {
            for (Object param: parametersLessons) {
                parameters.add(param);
            }
        }

        if((queryReturnType.equals(QUERY_RETURN_TYPE_HOMEWORK) || queryReturnType.equals(QUERY_RETURN_TYPE_BOTH)) && parametersHomeworks.size() > 0) {
            for (Object param: parametersHomeworks) {
                parameters.add(param);
            }
        }

        if (maxResults != null) {
            queryFull.append(" LIMIT ? ");
            parameters.add(maxResults);
        }

        sql.prepared(queryFull.toString(), parameters, SqlResult.validResultHandler(handler));
    }

    /**
     * List children info about parent id
     * @param parentId
     * @param handler
     */
    public void listChildren(final String parentId, final Handler<Either<String, JsonArray>> handler) {


        StringBuilder sb = new StringBuilder("");
        sb.append(" MATCH (n:User {id : {id}}) ");
        sb.append(" WHERE HAS(n.login) ");
        sb.append(" MATCH n<-[:RELATED]-(child:User) ");
        sb.append(" MATCH child-[:IN]->(gp:Group) ");
        sb.append(" MATCH gp-[:DEPENDS]->(c:Class) ");
        sb.append(" RETURN distinct  child.id as id, child.displayName as displayName, c.id as classId, c.name as className ");

        JsonObject params = new JsonObject().putString("id", parentId);
        neo.execute(sb.toString(), params, Neo4jResult.validResultHandler(handler));

    }

    /**
     * Creates diary.subject data from neodb graph or auto-creates default one if none exists in the neo base.
     * @param teacherId
     * @param handler
     */
    public void initTeacherSubjects(final String teacherId, final List<String> schoolIds, final Handler<Either<String, JsonObject>> handler) {


        final String DEFAULT_SUBJECT_LABEL = "Physique";


        StringBuilder sb = new StringBuilder("");
        sb.append(" match (u:User {id : {id}}) where HEAD(u.profiles) = 'Teacher' and has(u.subjectTaught) return u.subjectTaught; ");

        JsonObject params = new JsonObject().putString("id", teacherId);
        neo.execute(sb.toString(), params, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                if ("ok".equals(event.body().getString("status"))) {
                    final JsonArray result = event.body().getArray("result", new JsonArray());


                    sql.raw("select nextval('diary.subject_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
                        @Override
                        public void handle(Either<String, JsonObject> event) {
                            if (event.isRight()) {

                                Long nextId = event.right().getValue().getLong("next_id");

                                final List<JsonObject> subjectLabels = new ArrayList<>();


                                for (String schoolId : schoolIds) {
                                    if (result.size() > 0) {
                                        for (int i = 0; i < result.size(); i++) {
                                            JsonObject jo = result.get(i);
                                            final String subjectTaught = jo.getString("subjectTaught");

                                            JsonObject joSubject = new JsonObject();
                                            joSubject.putString("subject_label", subjectTaught);
                                            joSubject.putString("school_id", schoolId);
                                            joSubject.putString("teacher_id", teacherId);
                                            joSubject.putNumber("id", nextId);

                                            subjectLabels.add(joSubject);

                                            nextId += 1;
                                        }
                                    }
                                    // need create fake subject for current teacher
                                    // if none does not exist in neo graph db
                                    else {
                                        JsonObject joSubject = new JsonObject();
                                        joSubject.putString("subject_label", DEFAULT_SUBJECT_LABEL);
                                        joSubject.putString("school_id", schoolId);
                                        joSubject.putString("teacher_id", teacherId);
                                        joSubject.putNumber("id", nextId);

                                        subjectLabels.add(joSubject);
                                    }
                                }

                                createSubjects(subjectLabels, handler);
                            } else {
                                log.error("diary.subject sequence could not be used.");
                                handler.handle(event.left());
                            }
                        }
                    }));


                } else {
                    handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                }
            }
        });

    }

    @Override
    public void listClasses(final String schoolId, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder("");
        query.append(" match (c:Class)-[BELONGS]->(s:Structure) where s.id={id} return c.id as classId, c.name as className");
        JsonObject params = new JsonObject().putString("id", schoolId);
        neo.execute(query.toString(), params, Neo4jResult.validResultHandler(handler));
    }
}
