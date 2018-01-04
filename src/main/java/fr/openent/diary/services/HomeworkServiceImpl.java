package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.general.Audience;
import fr.openent.diary.model.general.Context;
import fr.openent.diary.model.general.HomeworkType;
import fr.openent.diary.model.general.ResourceState;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.utils.HandlerUtils;
import fr.openent.diary.utils.SqlMapper;
import fr.wseduc.webutils.Either;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.entcore.common.sql.SqlResult.*;

/**
 * Created by a457593 on 18/02/2016.
 */
public class HomeworkServiceImpl extends SqlCrudService implements HomeworkService {

    private DiaryService diaryService;
    private AudienceService audienceService;
    private NotifyServiceImpl notificationService;

    private final static String DATABASE_TABLE ="homework";
    private final static Logger log = LoggerFactory.getLogger(HomeworkServiceImpl.class);
    private static final String ID_TEACHER_FIELD_NAME = "teacher_id";
    private static final String ID_OWNER_FIELD_NAME = "owner";
    private static final String GESTIONNAIRE_RIGHT = "fr-openent-diary-controllers-HomeworkController|modifyHomework";
    private static final String GESTIONNAIRE_RIGHT_LESSON = "fr-openent-diary-controllers-LessonController|modifyLesson";


    private final Neo4j neo = Neo4j.getInstance();
    /**
     *
     * @param diaryService
     * @param audienceService
     */
    public HomeworkServiceImpl(final DiaryService diaryService, final AudienceService audienceService,  NotifyServiceImpl notificationService) {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
        this.diaryService = diaryService;
        this.audienceService = audienceService;
        this.notificationService=notificationService;
    }

    /**
     * Retrieves all homework for a context.
     * @param ctx User context (student/teacher/none)
     * @param userId user's identifier
     * @param schoolIds Structure ids
     * @param memberIds List of sharing members identifier (ENT groups, User and child id if parent).
     * @param startDate Homework due date after this date
     * @param endDate Homework due date before this date
     * @param lessonId Filter homework belonging to this lesson
     * @param handler
     */
    private void getHomeworks(final Context ctx, final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final String lessonId, final Handler<Either<String, JsonArray>> handler){
        final String DATE_FORMAT = "YYYY-MM-DD";

        memberIds.add(userId);
        final JsonArray parameters = new JsonArray();

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.subject_id, h.school_id, h.audience_id,")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color, h.homework_state,")
                .append(" h.homework_due_date, h.homework_description, h.homework_state, h.homework_type_id, th.homework_type_label,")
                .append(" teacher.teacher_display_name as teacher_display_name,")
                .append(" att.attachments ")
                .append(" FROM diary.homework AS h")

                .append(" INNER JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT OUTER JOIN diary.lesson as l ON l.id = h.lesson_id")
                .append(" INNER JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" INNER JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" INNER JOIN diary.teacher as teacher ON teacher.id = h.teacher_id")
                .append(" LEFT JOIN LATERAL (SELECT json_agg(json_build_object('document_id', a.document_id, 'document_label', a.document_label)) as attachments")
                .append(" FROM diary.homework_has_attachment as ha INNER JOIN diary.attachment a ON ha.attachment_id = a.id")
                .append(" WHERE ha.homework_id = h.id) att ON TRUE");


                query.append(" WHERE 1=1 ");

        if (schoolIds != null && !schoolIds.isEmpty()) {
            query.append(" AND h.school_id in ").append(sql.listPrepared(schoolIds.toArray()));
            for (String schoolId : schoolIds) {
                parameters.add(Sql.parseId(schoolId.trim()));
            }
        }

        if (lessonId != null && !lessonId.isEmpty()) {
            query.append(" AND h.lesson_id = ? ");
            parameters.add(Sql.parseId(lessonId));
        }

        if (startDate != null && !startDate.trim().isEmpty()) {
            query.append(" AND h.homework_due_date >= to_date(?,'").append(DATE_FORMAT).append("') ");
            parameters.add(startDate.trim());
        }

        if (endDate != null && !endDate.trim().isEmpty()) {
            query.append(" AND h.homework_due_date <= to_date(?,'").append(DATE_FORMAT).append("') ");
            parameters.add(endDate.trim());
        }

        if (ctx == Context.STUDENT || ctx == Context.PARENT || ctx == Context.EXTERNAL) {
            query.append(" AND h.homework_state = '").append(ResourceState.PUBLISHED.toString()).append("' ");
        }

        if (ctx != Context.EXTERNAL){
            query.append(" AND ((h.lesson_id IS NOT NULL AND EXISTS (SELECT 1 FROM diary.lesson_shares ls  ")
                    .append(" LEFT JOIN diary.members AS m ON (ls.member_id = m.id AND m.group_id IS NOT NULL)")
                    .append(" WHERE l.id = ls.resource_id")
                    .append(" AND (ls.member_id IN " + Sql.listPrepared(memberIds.toArray())).append(" OR l.owner = ?) ");

            for (final String g : memberIds) {
                parameters.addString(g);
            }
            parameters.add(userId);
        }


        if (ctx == Context.TEACHER) {
            // retrieve homeworks whose lesson we are owner and those we have gestionnaire right on
            query.append(" AND (l.owner = ? OR ls.action = ?) ");
            parameters.add(userId);
            parameters.add(this.GESTIONNAIRE_RIGHT_LESSON);
        }

        if (ctx != Context.EXTERNAL) {
            query.append(")) OR ( h.lesson_id IS NULL AND EXISTS (SELECT 1 FROM diary.homework_shares hs  ")
                    .append(" LEFT JOIN diary.members AS m ON (hs.member_id = m.id AND m.group_id IS NOT NULL)")
                    .append(" WHERE h.id = hs.resource_id")
                    .append(" AND (hs.member_id IN " + Sql.listPrepared(memberIds.toArray())).append(" OR h.owner = ?) ");
            for (final String g : memberIds) {
                parameters.addString(g);
            }
            parameters.add(userId);
        }

        if (ctx == Context.TEACHER) {
            // retrieve homeworks whose we are owner and those we have gestionnaire right on
            query.append(" AND (h.owner = ? OR hs.action = ?) ");
            parameters.add(userId);
            parameters.add(this.GESTIONNAIRE_RIGHT);
        }
        if (ctx != Context.EXTERNAL) {
            query.append(")))");
        }

        query.append(" ORDER BY h.homework_due_date ASC, h.created ASC ");

        log.debug(query);
        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    @Override
    public void getAllHomeworksForALesson(final String userId, final String lessonId, final List<String> memberIds, Handler<Either<String, JsonArray>> handler) {
        getHomeworks(Context.NONE, userId, null, memberIds, null, null, lessonId, handler);
    }

    @Override
    public void getAllHomeworksForTeacher(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        getHomeworks(Context.TEACHER, userId, schoolIds, memberIds, startDate, endDate, null, handler);
    }

    @Override
    public void getAllHomeworksForExternal(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        getHomeworks(Context.EXTERNAL, userId, schoolIds, memberIds, startDate, endDate, null, handler);
    }

    @Override
    public void getExternalHomeworkByLessonId (final String userId,final String lessonId, final List<String> memberIds,Handler<Either<String, JsonArray>> handler){
        getHomeworks(Context.EXTERNAL, userId, null, memberIds, null, null, lessonId, handler);
    }

    @Override
    public void getAllHomeworksForParent(final String userId, final String childId,final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {


        diaryService.listGroupsFromChild(Arrays.asList(childId), new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(Either<String, JsonArray> event) {
                if (event.isRight()) {
                    for (Object result : ((JsonArray) ((Either.Right) event).getValue()).toList()){
                        String groupId  = ((Map<String,String>)result).get("groupId");
                        memberIds.add(groupId);
                    }
                    getHomeworks(Context.PARENT, userId, schoolIds, memberIds, startDate, endDate, null, handler);
                } else {
                    log.error("Teacher couldn't be retrieved or created.");
                    handler.handle(event.left());
                }
            }
        });


    }

    @Override
    public void getAllHomeworksForStudent(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        getHomeworks(Context.STUDENT, userId, schoolIds, memberIds, startDate, endDate, null, handler);
    }

    @Override
    public void retrieveHomework(String homeworkId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT h.id, h.lesson_id, s.subject_label, h.school_id as structureId, h.audience_id, h.subject_id, h.teacher_id, ")
                .append(" a.audience_type, a.audience_label, h.homework_title, h.homework_color, h.homework_type_id, ")
                .append(" h.homework_due_date, h.homework_description, h.homework_state, th.homework_type_label,")
                .append(" att.attachments ")
                .append(" FROM diary.homework AS h")
                .append(" LEFT JOIN diary.homework_type as th ON h.homework_type_id = th.id")
                .append(" LEFT JOIN diary.subject as s ON s.id = h.subject_id")
                .append(" LEFT JOIN diary.audience as a ON a.id = h.audience_id")
                .append(" LEFT JOIN LATERAL (SELECT json_agg(json_build_object('document_id', a.document_id, 'document_label', a.document_label)) as attachments")
                .append(" FROM diary.homework_has_attachment as ha INNER JOIN diary.attachment a ON ha.attachment_id = a.id")
                .append(" WHERE ha.homework_id = h.id) att ON TRUE")
                .append(" WHERE h.id = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(homeworkId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    @Override
    public void createHomework(final JsonObject homeworkObject, final String teacherId, final String teacherDisplayName, final Audience audience, final Handler<Either<String, JsonObject>> handler) {
        if (homeworkObject != null) {
            stripNonHomeworkFields(homeworkObject);
            audienceService.getOrCreateAudience(audience, new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if (event.isRight()) {
                        diaryService.getOrCreateTeacher(teacherId, teacherDisplayName, new Handler<Either<String, JsonObject>>() {
                            @Override
                            public void handle(Either<String, JsonObject> event) {
                                if (event.isRight()) {
                                    final JsonArray attachments = homeworkObject.getArray("attachments");
                                    homeworkObject.putString(ID_TEACHER_FIELD_NAME, teacherId);
                                    homeworkObject.putString(ID_OWNER_FIELD_NAME, teacherId);
                                    // TPE disabled until working done
                                    if (false && attachments != null && attachments.size() > 0) {
                                        //get next on the sequence to add the homework and value in FK on attachment

                                        sql.raw("select nextval('diary.homework_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
                                            @Override
                                            public void handle(Either<String, JsonObject> event) {
                                                if (event.isRight()) {
                                                    log.debug(event.right().getValue());
                                                    Long nextId = event.right().getValue().getLong("next_id");
                                                    homeworkObject.putNumber("id", nextId);

                                                    JsonArray parameters = new JsonArray().add(nextId);
                                                    for (Object id : attachments) {
                                                        parameters.add(id);
                                                    }

                                                    SqlStatementsBuilder sb = new SqlStatementsBuilder();
                                                    sb.insert("diary.homework", homeworkObject, "id");
                                                    sb.prepared("update diary.attachment set homework_id = ? where id in " +
                                                            sql.listPrepared(attachments.toArray()), parameters);

                                                    sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                                                }
                                            }
                                        }));
                                    } else {
                                        //insert homework
                                        homeworkObject.removeField("attachments");
                                        sql.insert("diary.homework", homeworkObject, "id", validUniqueResultHandler(handler));
                                    }
                                } else {
                                    log.error("Teacher couldn't be retrieved or created.");
                                    handler.handle(event.left());
                                }
                            }
                        });
                    } else {
                        log.error("Audience couldn't be retrieved or created.");
                        handler.handle(event.left());
                    }
                }
            });
        }
    }

    /**
     * fields not as column in table diary.homework so need to delete
     * else will crash on createHomework or updateHomework
     * TODO remove that try getting audience data from other object than homework JSON one
     * (see {@link fr.openent.diary.controllers.LessonController}
     *
     * @param homeworkObject
     */
    private void stripNonHomeworkFields(final JsonObject homeworkObject) {

        homeworkObject.removeField("audience_type");
        homeworkObject.removeField("audience_name");
    }

    @Override
    public void updateHomework(String homeworkId, JsonObject homeworkObject, Handler<Either<String, JsonObject>> handler) {

        // FIXME json sql do not work if SQL enum column
        homeworkObject.removeField("homework_state");

        // TPE 14022017
        homeworkObject.removeField("attachments");
        stripNonHomeworkFields(homeworkObject);

        StringBuilder sb = new StringBuilder();
        JsonArray values = new JsonArray();
        //TODO query without loops
        for (String attr : homeworkObject.getFieldNames()) {
            if (attr.equals("homework_due_date")) {
                sb.append(attr).append(" = to_date(?, 'YYYY-MM-DD'), ");
            } else {
                sb.append(attr).append(" = ?, ");
            }
            values.add(homeworkObject.getValue(attr));
        }

        sb.append(" modified = NOW()");
        StringBuilder query = new StringBuilder("UPDATE diary.homework ");
        query.append(" SET ").append(sb.toString()).append("WHERE id = ? ");
        sql.prepared(query.toString(), values.add(Sql.parseId(homeworkId)), validRowsResultHandler(handler));
    }

    @Override
    public void deleteHomework(final String  homeworkId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(homeworkId, handler);
    }

    @Override
    public void deleteHomeworks(final List<String> homeworkIds, final Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("DELETE FROM diary.homework as h where h.id in ");
        query.append(sql.listPrepared(homeworkIds.toArray()));

        JsonArray parameters = new JsonArray();
        for (Object id : homeworkIds) {
            parameters.add(id);
        }

        sql.prepared(query.toString(), parameters, validRowsResultHandler(handler));
    }

    @Override
    public void publishHomework(final UserInfos userInfos, final Long lessonId,final Integer homeworkId, Handler<Either<String, JsonObject>> handler) {
        List<Integer> ids = new ArrayList<Integer>();
        ids.add(homeworkId);
        publishHomeworks(userInfos,lessonId,ids, handler);
    }

    @Override
    public void publishHomeworks(final UserInfos userInfos, final Long lessonId, final List<Integer> homeworkIds, final Handler<Either<String, JsonObject>> handler) {
        changeHomeworksState(homeworkIds, ResourceState.DRAFT, ResourceState.PUBLISHED, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(final Either<String, JsonObject> event) {
                for (Integer homeWorkId : homeworkIds){
                    notifyHomeworkShare(lessonId, new Long(homeWorkId), userInfos, new Handler<GenericHandlerResponse>() {
                        @Override
                        public void handle(GenericHandlerResponse eventGeneric) {
                            if (!eventGeneric.hasError()){
                                handler.handle(event);
                            }else{
                                handler.handle(event.left());
                            }
                        }
                    });
                }
            }
        });

    }

    /**
     * Unpublishes homeworks
     * @param homeworkIds Array of id homeworks
     * @param handler
     */
    @Override
    public void unPublishHomeworks(List<Integer> homeworkIds, Handler<Either<String, JsonObject>> handler) {
        changeHomeworksState(homeworkIds, ResourceState.PUBLISHED, ResourceState.DRAFT, handler);
    }

    /**
     * Change homework state
     * @param homeworkIds Array of homework ids
     * @param initialState Initial homework state
     * @param finalState Final homework state
     * @param handler
     */
    private void changeHomeworksState(List<Integer> homeworkIds, ResourceState initialState, ResourceState finalState, Handler<Either<String, JsonObject>> handler) {
        StringBuilder sb = new StringBuilder();
        JsonArray parameters = new JsonArray();
        for (Integer id : homeworkIds) {
            parameters.add(id);
        }

        sb.append("UPDATE diary.homework SET  modified = NOW(), homework_state = '").append(finalState).append("' ");
        sb.append("WHERE id in ");
        sb.append(sql.listPrepared(homeworkIds.toArray()));
        sb.append(" and homework_state = '").append(initialState).append("'");

        sql.prepared(sb.toString(), parameters, validRowsResultHandler(handler));
    }

    /**
     * Init diary.homework_type table
     * @param schoolIds Structures of current logged in user
     * @param handler
     */
    public void initHomeworkTypes(final List<String> schoolIds, final Handler<Either<String, JsonObject>> handler) {

        sql.raw("select nextval('diary.homework_type_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {

                    Long nextId = event.right().getValue().getLong("next_id");
                    final String defaultHomeworkTypeLabel = "Devoir Maison";
                    final String defaultHomeworkTypeCategory = "DM";
                    SqlStatementsBuilder sb = new SqlStatementsBuilder();
                    for (final String schoolId : schoolIds) {
                        for (HomeworkType homeworkTypeVal : HomeworkType.values()) {
                            JsonObject homeworkType = new JsonObject();
                            homeworkType.putNumber("id", nextId);
                            homeworkType.putString("school_id", schoolId);
                            homeworkType.putString("homework_type_label", homeworkTypeVal.getLabel());
                            homeworkType.putString("homework_type_category", homeworkTypeVal.getCategory());

                            sb.insert("diary.homework_type", homeworkType, "id");
                            nextId += 1;

                        }
                    }
                    sql.transaction(sb.build(), validUniqueResultHandler(0, handler));

                } else {
                    log.error("diary.homeworktype sequence could not be used.");
                    handler.handle(event.left());
                }
            }
        }));
    }

    @Override
    public void listHomeworkTypes(List<String> schoolIds, Handler<Either<String, JsonArray>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT * FROM diary.homework_type as ht WHERE ht.school_id IN " + Sql.listPrepared(schoolIds.toArray()));

        JsonArray parameters = new JsonArray();

        for (final String schoolId : schoolIds) {
            parameters.addString(schoolId);
        }

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }


    /**
     *
     * @param currentDateFormatted Current date in YYYY-MM-DD format
     * @param handler
     */
    @Override
    public void getHomeworksLoad(final String currentDateFormatted, final String audienceId, Handler<Either<String, JsonArray>> handler) {

        if (currentDateFormatted != null && !currentDateFormatted.isEmpty()) {

            StringBuilder query = new StringBuilder();
            query.append(" select z.day, count(h.*) as countLoad from " );
            query.append(" ( " );
            query.append(" select (date_trunc('week',to_date(?, 'YYYY-MM-DD'))::date) + i as day " );
            query.append(" from generate_series(0,6) i " );
            query.append(" ) z " );
            query.append(" left outer join diary.homework h on h.homework_due_date = z.day and h.audience_id = ? " );
            query.append(" group by z.day order by z.day " );

            JsonArray parameters = new JsonArray();
            parameters.add(currentDateFormatted);
            parameters.add(audienceId);

            sql.prepared(query.toString(), parameters, validResultHandler(handler));
        }
    }


    private void getProfileGroupIdsFromResource(Long lessonId, Long homeworkId, final Handler<HandlerResponse<List<KeyValueModel>>> handler){

        String query;
        JsonArray parameters = new JsonArray();

        /*query = "select distinct 'id' as key,  member_id as value from diary.homework_shares s where s.resource_id in ( " +
                "select distinct id from diary.homework where homework_state = 'published' " +
                " and homework_title = 'Devoir Maison' " +
                "and lesson_id = ? " +
                ") " +
                "union " +
                "select distinct 'id' as key, member_id as value from diary.homework_shares s where s.resource_id in ( " +
                "select distinct id from diary.homework where" +
                " homework_state = 'published' " +
                " and homework_title = 'Devoir Maison' " +
                "and id = ?" +
                ")";
        */

        query = "select distinct to_char(homework_due_date,'DD-MM-YYYY') as key,member_id as value " +
                "  from diary.homework_shares s, " +
                "    diary.homework h     " +
                "  where s.resource_id = ? " +
                "  and s.resource_id = h.id " +
                "  and h.homework_state = 'published'" +
                " union " +
                "select distinct to_char(homework_due_date,'DD-MM-YYYY') as key,member_id as value " +
                "  from diary.homework_shares s, " +
                "    diary.homework h     " +
                "  where h.lesson_id = ? " +
                "  and s.resource_id = h.id " +
                "  and h.homework_state = 'published'"

        ;

        parameters.add(homeworkId);
        parameters.add(lessonId);

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, KeyValueModel.class));

    }

    private void getSharedWithUserIdsFromHomeworkId(final List<KeyValueModel> profileGroupIds,final Handler<HandlerResponse<List<String>>> handler  ){

        if (profileGroupIds.size() == 0 ){
            handler.handle(new HandlerResponse<List<String>>());
        }

        JsonArray profileGroupIdsJson = new JsonArray();
        for (KeyValueModel keyValueModel : profileGroupIds){
            profileGroupIdsJson.add(keyValueModel.getValue());
        }

        String query = "MATCH (p:ProfileGroup) <-[:COMMUNIQUE]-(u:User)  " +
                " where p.id  in {profileGroupsIds} return distinct 'id' as key , u.id as value";
        final JsonObject params = new JsonObject().putArray("profileGroupsIds", profileGroupIdsJson);

        neo.execute(query, params, new Handler<Message<JsonObject>>() {
                    @Override
                    public void handle(Message<JsonObject> event) {
                        if ("ok".equals(event.body().getString("status"))) {
                            JsonArray r = event.body().getArray("result", new JsonArray());
                           // massGroupShare(userInfos,resourceId, getListFromNeoResult(r), actions, handler);
                            List<String> resultList = new ArrayList<String>();
                            for (Object values : r.toList()){
                                resultList.add((String) ((Map<String,String>)values).get("value")) ;
                            }
                            HandlerResponse<List<String>> response = new HandlerResponse<List<String>>();
                            response.setResult(resultList);
                            handler.handle(response);
                        } else {
                            handler.handle(new HandlerResponse<List<String>>("error when trying to get profile groups"));
                        }
                    }
                }
        );


          //      SqlMapper.listMapper(handler, KeyValueModel.class));
    }

    public void notifyHomeworkShare(final Long lessonId,final Long homeworkId,  final UserInfos userInfos ,final Handler<GenericHandlerResponse> handler ){

        getProfileGroupIdsFromResource(lessonId, homeworkId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {
                HandlerUtils.checkGenericError(event,handler);

                if (event.getResult().size() == 0){
                    handler.handle(new GenericHandlerResponse());
                }else{
                    final String date = event.getResult().get(0).getKey();
                    getSharedWithUserIdsFromHomeworkId(event.getResult(), new Handler<HandlerResponse<List<String>>>() {
                        @Override
                        public void handle(HandlerResponse<List<String>> event) {

                            HandlerUtils.checkGenericError(event,handler);

                            List<String> userIds = new ArrayList<String>();

                            for (String value : event.getResult()){
                                userIds.add(value);
                            }

                            notificationService.notifyHomeworks(date,homeworkId,lessonId,userInfos, userIds, NotifyServiceImpl.NotifyEventType.HOMEWORK_EVENT_TYPE);

                            handler.handle(new GenericHandlerResponse());
                        }
                    });
                }
            }
        });

    }

}

