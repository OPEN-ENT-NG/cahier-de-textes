package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.general.Attachment;
import fr.openent.diary.model.general.Audience;
import fr.openent.diary.model.general.Context;
import fr.openent.diary.model.general.ResourceState;
import fr.openent.diary.utils.DateUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.json.Json;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlStatementsBuilder;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.text.MessageFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.entcore.common.sql.SqlResult.*;

/**
 * Created by a457593 on 18/02/2016.
 */
public class LessonServiceImpl extends SqlCrudService implements LessonService {

    private DiaryService diaryService;
    private HomeworkService homeworkService;
    private AudienceService audienceService;

    private final static String DATABASE_TABLE ="lesson";
    private final static Logger log = LoggerFactory.getLogger(LessonServiceImpl.class);
    private static final String ID_LESSON_FIELD_NAME = "id";
    private static final String ID_HOMEWORK_FIELD_NAME = "homework_id";
    private static final String LESSON_DATE_FIELD_NAME = "lesson_date";
    private static final String ID_TEACHER_FIELD_NAME = "teacher_id";
    private static final String ID_OWNER_FIELD_NAME = "owner";
    private static final String GESTIONNAIRE_RIGHT = "fr-openent-diary-controllers-LessonController|modifyLesson";
    private static final String JSON_KEY_DOCUMENT_ID = "document_id";
    private static final String JSON_KEY_DOCUMENT_LABEL = "document_label";
    private static final String SQL_KEY_ATTACHMENT_ID = "id";
    private static final String SQL_ATTACHMENT_SEQ_NAME = "diary.attachment_id_seq";
    private static final String SQL_ATTACHMENT_NEXT_VAL_ALIAS = "valid";
    private static final String SQL_ATTACHMENT_TABLE_NAME = "attachment";
    private static final String SQL_LESSON_HAS_ATTACHMENT_TABLE_NAME = "lesson_has_attachment";

    public LessonServiceImpl(final DiaryService diaryService, final AudienceService audienceService,final HomeworkService homeworkService) {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
        this.diaryService = diaryService;
        this.audienceService = audienceService;
        this.homeworkService = homeworkService;
    }




    /**
     * Retrieves all lessons for a context.
     * @param ctx User context (student/teacher/none)
     * @param userId user's identifier
     * @param schoolIds Structure ids
     * @param memberIds List of sharing members identifier (ENT groups, User and child id if parent).
     * @param startDate Homework due date after this date
     * @param endDate Homework due date before this date
     * @param handler
     */
    private void getLessons(final Context ctx, final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate,
                            final String audienceId, final String subjectId, final Handler<Either<String, JsonArray>> handler) {

        if (isDateValid(startDate) && isDateValid(endDate)) {

            memberIds.add(userId);

            StringBuilder homeworkAggregate = new StringBuilder();
            homeworkAggregate.append("(select json_agg(DISTINCT h.id) FILTER (WHERE h.id IS NOT NULL");
            if (ctx != Context.TEACHER || ctx == Context.EXTERNAL) {
                homeworkAggregate.append(" AND to_timestamp(to_char(l.lesson_date, 'YYYY-MM-DD') || ' ' || to_char(l.lesson_end_time, 'hh24:mi:ss'), 'YYYY-MM-DD hh24:mi:ss') > localtimestamp ");
            }

            homeworkAggregate.append(") from diary.homework h where h.lesson_id = l.id) as homework_ids");


            final JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();

            StringBuilder query = new StringBuilder();
            query.append("SELECT l.id as lesson_id, array_to_json(array_agg(distinct homework)) as homeworks, s.id as subject_id, s.subject_label, l.school_id, t.teacher_display_name, l.teacher_id, ")
                    .append(" a.audience_type, l.audience_id, a.audience_label, l.lesson_title, lesson_room, l.lesson_color, l.lesson_state, ")
                    .append(" l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, l.locked, l.course_id,")
                    .append(" s.original_subject_id as original_subject_id , array_to_json(array_agg(distinct visa)) as visas, ")
                    .append(homeworkAggregate.toString())
                    .append(" FROM diary.lesson AS l")
                    .append(" INNER JOIN diary.teacher as t ON t.id = l.teacher_id")
                    .append(" LEFT JOIN diary.visa as visa ON visa.session_id = l.id")
                    .append(" INNER JOIN diary.subject as s ON s.id = l.subject_id")
                    .append(" LEFT JOIN diary.homework AS homework ON homework.lesson_id = l.id")
                    .append(" INNER JOIN diary.audience as a ON a.id = l.audience_id")
                    .append(" WHERE l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD') ");

            parameters.add(startDate).add(endDate);

            if (ctx == Context.STUDENT || ctx == Context.PARENT || ctx == Context.EXTERNAL) {
                query.append(" AND l.lesson_state = '").append(ResourceState.PUBLISHED.toString()).append("' ");
            }

            if(audienceId != null){
                query.append(" AND l.audience_id = ?");
                parameters.add(audienceId);
            }

            if(subjectId != null){
                query.append(" AND l.subject_id = ?");
                parameters.add(subjectId);
            }

            if (schoolIds != null && !schoolIds.isEmpty()) {
                query.append(" AND l.school_id in").append(sql.listPrepared(schoolIds.toArray()));
                for (String schoolId : schoolIds) {
                    parameters.add(Sql.parseId(schoolId));
                }
            }

            query.append(" AND EXISTS (SELECT 1 FROM diary.lesson_shares ls  ")
                    .append(" LEFT JOIN diary.members AS m ON (ls.member_id = m.id AND m.group_id IS NOT NULL)")
                    .append(" WHERE l.id = ls.resource_id")
                    .append(" AND (ls.member_id IN " + Sql.listPrepared(memberIds.toArray())).append(" OR l.owner = ?) ");


            for (String memberId: memberIds) {
                parameters.add(memberId);
            }

            parameters.add(userId);

            if (ctx == Context.TEACHER || ctx == Context.EXTERNAL) {
                // retrieve lessons whose we are owner and those we have gestionnaire right on
                query.append(" AND (l.owner = ? OR ls.action = ?) ");
                parameters.add(userId);
                parameters.add(this.GESTIONNAIRE_RIGHT);
            }

            query.append(")");
            query.append(" GROUP BY l.id, s.id, t.teacher_display_name, a.audience_type, a.audience_label ");
            query.append(" ORDER BY l.lesson_date ASC");

            sql.prepared(query.toString(), parameters, validResultHandler(handler));
        } else {
            StringBuilder errorMessage = new StringBuilder("Start date and end date must follow the pattern: ");
            errorMessage.append(DateUtils.DATE_FORMAT);
            handler.handle(new Either.Left<String, JsonArray>(errorMessage.toString()));
        }
    }

    /**
     *
     * @param schoolIds Schools the teacher belong to
     * @param startDate
     * @param endDate
     * @param handler
     */
    @Override
    public void getAllLessonsForTeacher(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final String audienceId, final String subjectId, final Handler<Either<String, JsonArray>> handler) {
        getLessons(Context.TEACHER, userId, schoolIds, memberIds, startDate, endDate, audienceId, subjectId,  handler);
    }

    /**
     *
     * @param schoolIds Schools the inspecteur belong to
     * @param startDate
     * @param endDate
     * @param handler
     */
    @Override
    public void getAllLessonsForExternal(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        getLessons(Context.EXTERNAL, userId, schoolIds, memberIds, startDate, endDate, null, null, handler);
    }

    @Override
    public void getAllLessonsForParent(final String userId, final String childId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {

        diaryService.getAudienceFromChild(childId, event -> {
            if (event.isRight()) {
                JsonArray result = event.right().getValue();
                String audienceId = null;
                if(result.size() > 1){
                    audienceId = result.getJsonObject(0).getString("audienceId");
                }

                getLessons(Context.PARENT, userId, schoolIds, memberIds, startDate, endDate, audienceId, null, handler);
            } else {
                log.error("Teacher couldn't be retrieved or created.");
                handler.handle(event.left());
            }
        });

    }

    @Override
    public void getAllLessonsForStudent(final String userId, final List<String> schoolIds, final List<String> memberIds, final String startDate, final String endDate, final Handler<Either<String, JsonArray>> handler) {
        getLessons(Context.STUDENT, userId, schoolIds, memberIds, startDate, endDate,null, null, handler);
    }

    @Override
    public void getAllLessonsForAudience(String schoolId, String audienceId, String startDate, String endDate, boolean onlyPublished, Handler<Either<String, JsonArray>> handler) {
        final JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();

        StringBuilder query = new StringBuilder();
        query.append("SELECT l.id as lesson_id, s.id as subject_id, array_to_json(array_agg(distinct homework)) as homeworks, s.subject_label, l.school_id, t.teacher_display_name, l.teacher_id, ")
                .append(" a.audience_type, l.audience_id, a.audience_label, l.lesson_title, lesson_room, l.lesson_color, l.lesson_state, ")
                .append(" l.lesson_date, l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, l.locked, l.course_id, ")
                .append(" s.original_subject_id as original_subject_id , array_to_json(array_agg(distinct visa)) as visas ")
                .append(" FROM diary.lesson AS l")
                .append(" INNER JOIN diary.teacher as t ON t.id = l.teacher_id")
                .append(" LEFT JOIN diary.visa as visa ON visa.session_id = l.id")
                .append(" INNER JOIN diary.subject as s ON s.id = l.subject_id")
                .append(" INNER JOIN diary.audience as a ON a.id = l.audience_id")
                .append(" LEFT JOIN diary.homework AS homework ON homework.lesson_id = l.id")
                .append(" WHERE l.lesson_date >= to_date(?,'YYYY-MM-DD') AND l.lesson_date <= to_date(?,'YYYY-MM-DD') ");

        parameters.add(startDate).add(endDate);

        query.append(" AND l.school_id = ? ");
        parameters.add(schoolId);

        query.append(" AND l.audience_id = ? ");
        parameters.add(audienceId);

        if (onlyPublished) {
            query.append(" AND l.lesson_state = 'published' ");
        }

        query.append(" GROUP BY l.id, s.id, t.teacher_display_name, a.audience_type, a.audience_label ");

        sql.prepared(query.toString(), parameters, validResultHandler(handler));
    }

    /**
     * Creates a lesson.
     * To do so teacher and audience must exist in database thus they are auto-created if needed
     *
     * @param lessonObject       Lesson
     * @param teacherId          Teacher id
     * @param teacherDisplayName Displayed name of teacher
     * @param audience           Audience
     * @param handler
     */
    @Override
    public void createLesson(final JsonObject lessonObject, final String teacherId, final String teacherDisplayName, final Audience audience, final Handler<Either<String, JsonObject>> handler) {

        if (lessonObject != null) {
            // auto-creates teacher if it does not exists
            diaryService.getOrCreateTeacher(teacherId, teacherDisplayName, event -> {
                if (event.isRight()) {
                    diaryService.getOrCreateSubject(lessonObject.getString("school_id"), teacherId, lessonObject.getString("subject_id"), event12 -> {
                        if (event12.isRight()) {
                            getOrCreateAudienceAndCreateLesson(lessonObject, teacherId, audience, handler);
                        }
                        else {
                            log.error("Subject couldn't be retrieved or created.");
                            handler.handle(event.left());
                        }
                    });
                }  else {
                    log.error("Teacher couldn't be retrieved or created.");
                    handler.handle(event.left());
                }
            });
        }
    }


    /**
     * fields not present as column in table diary.lesson
     * so need to delete them else will crash on createLesson or updateLesson
     * TODO remove that try getting audience data from other object than lesson JSON one
     * (see {@link fr.openent.diary.controllers.LessonController}
     *
     * @param lessonObject
     */
    private void stripNonLessonFields(final JsonObject lessonObject) {

        lessonObject.remove("audience_type");
        lessonObject.remove("audience_name");
        lessonObject.remove("lesson_id");
        lessonObject.remove("attachments");
    }

    /**
     * Check audience exists and auto-creates it if needed then creates the lesson
     *
     * @param lessonObject  Lesson
     * @param teacherId     Teacher id
     * @param audience    Audience
     * @param handler
     */
    private void getOrCreateAudienceAndCreateLesson(final JsonObject lessonObject, final String teacherId, final Audience audience, final Handler<Either<String, JsonObject>> handler) {

        // check audiences exists and create it if needed
        audienceService.getOrCreateAudience(audience, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {

                // audience exists or created we can then create lesson
                if (event.isRight()) {
                    final JsonArray attachments = lessonObject.getJsonArray("attachments");
                    lessonObject.put(ID_TEACHER_FIELD_NAME, teacherId);
                    lessonObject.put(ID_OWNER_FIELD_NAME, teacherId);

                    //strip non sql field
                    stripNonLessonFields(lessonObject);

                    if (attachments != null && attachments.size() > 0) {
                        createLessonWithAttachments(attachments, lessonObject, teacherId, handler);
                    } else {
                        //insert lesson
                        sql.insert("diary.lesson", lessonObject, "id", validUniqueResultHandler(handler));
                    }
                } else {
                    log.error(MessageFormat.format("Error while getting or creating audience with id ?", audience.getId()));
                    handler.handle(event.left());
                }
            }
        });
    }

    /**
     * Adds attachments to lesson
     *
     * @param attachments  Attachments
     * @param lessonObject Lesson
     * @param handler
     */
    private void createLessonWithAttachments(final JsonArray attachments, final JsonObject lessonObject, final String teacherId, final Handler<Either<String, JsonObject>> handler) {

        sql.raw("select nextval('diary.lesson_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    log.debug(event.right().getValue());
                    final Long nextLessonId = event.right().getValue().getLong("next_id");
                    lessonObject.put(ID_LESSON_FIELD_NAME, nextLessonId);


                    //check if attachment(s) exists
                    final Set<String> attachmentIds = new HashSet<>();
                    final Map<String, String> documents = new HashMap<String, String>();

                    Iterator<Object> it = attachments.iterator();
                    while (it.hasNext()) {
                        Object object = it.next();
                        if (object instanceof JsonObject) {
                            JsonObject attachment = (JsonObject) object;
                            String entId = attachment.getString(JSON_KEY_DOCUMENT_ID);
                            attachmentIds.add(entId);

                            String documentLabel = attachment.getString(JSON_KEY_DOCUMENT_LABEL);
                            documents.put(entId, documentLabel);
                        }
                    }

                    StringBuilder queryAttachments = new StringBuilder();
                    queryAttachments.append("SELECT document_id, id FROM diary.attachment WHERE document_id in ");
                    queryAttachments.append(sql.listPrepared(attachmentIds.toArray()));

                    JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray(new ArrayList(attachmentIds));

                    sql.prepared(queryAttachments.toString(), parameters, validResultHandler(new Handler<Either<String, JsonArray>>() {
                        @Override
                        public void handle(Either<String, JsonArray> event) {
                            if (event.isRight()) {
                                final JsonArray attachments = event.right().getValue();
                                final Map<String, Long> attachedDocuments = getAttachedDocumentMap(attachmentIds, attachments);

                                int nbNewAttachments = attachmentIds.size() - attachments.size();
                                //get as many nextval as needed
                                StringBuilder nextValQuery = new StringBuilder("SELECT ");
                                for (int i=0; i < nbNewAttachments; i++) {
                                    if (i>0) {
                                        nextValQuery.append(",");
                                    }
                                    nextValQuery.append("nextval('").append(SQL_ATTACHMENT_SEQ_NAME).append("') as ");
                                    nextValQuery.append(SQL_ATTACHMENT_NEXT_VAL_ALIAS).append(i);
                                }
                                nextValQuery.append(";");

                                sql.raw(nextValQuery.toString(), validResultHandler(new Handler<Either<String, JsonArray>>() {
                                    @Override
                                    public void handle(Either<String, JsonArray> event) {
                                        if (event.isRight()) {
                                            //nextIds is a json array with as many columns as next val needed
                                            final JsonArray nextIds = event.right().getValue();

                                            SqlStatementsBuilder sb = new SqlStatementsBuilder();

                                            sb.insert("diary.lesson", lessonObject, "id");

                                            int nextValIndex = 0;
                                            List<Attachment> attachments = new ArrayList<Attachment>();

                                            Iterator<String> entIds = attachedDocuments.keySet().iterator();
                                            while (entIds.hasNext()) {
                                                String entId = entIds.next();
                                                Long sqlId = attachedDocuments.get(entId);
                                                Attachment att = new Attachment(entId, teacherId);
                                                att.setDocumentLabel(documents.get(entId));

                                                if (sqlId == null) {
                                                    Object object = nextIds.getJsonObject(0);
                                                    if (object instanceof JsonObject) {
                                                        JsonObject nextVal = (JsonObject) object;
                                                        String alias = SQL_ATTACHMENT_NEXT_VAL_ALIAS + nextValIndex;
                                                        Long id = nextVal.getLong(alias);
                                                        att.setId(id);
                                                        //add the new attached document
                                                        sb.raw(att.toQuery(DiaryController.DATABASE_SCHEMA, SQL_ATTACHMENT_TABLE_NAME));
                                                    }
                                                    nextValIndex++;
                                                } else {
                                                    att.setId(sqlId);
                                                }
                                                attachments.add(att);
                                            }

                                            // create rows in lesson_has_attachement
                                            for (Attachment att: attachments) {
                                                createLessonHasAttachment(sb, att, nextLessonId);
                                            }

                                            sql.transaction(sb.build(), validUniqueResultHandler(0, handler));
                                        }
                                    }
                                }));
                            }
                        }
                    }));
                }
            }
        }));
    }

    /**
     * Matches in a map all existing sql ids with their ent document id. Some documents can be missing in the DB.
     * @param attachmentIds set of document ids of the lesson's attachments.
     * @param attachments existing attachments in the DB matching the lesson's attachments.
     * @return A Map<Ent document identifier, sql identifier or null> for the lesson's attachments.
     */
    private Map<String, Long> getAttachedDocumentMap(Set<String> attachmentIds, JsonArray attachments) {
        Map<String, Long> attachedDocuments = new HashMap<String, Long>();

        Iterator<String> itIds = attachmentIds.iterator();
        while (itIds.hasNext()) {
            String key = itIds.next();
            attachedDocuments.put(key, null);
        }

        Iterator<Object> itAttach = attachments.iterator();
        while (itAttach.hasNext()) {
            Object object = itAttach.next();
            if (object instanceof JsonObject) {
                JsonObject attachment = (JsonObject) object;
                String documentEntId = attachment.getString(JSON_KEY_DOCUMENT_ID);
                Long sqlId = attachment.getLong(SQL_KEY_ATTACHMENT_ID);
                if (sqlId != null && !StringUtils.isEmpty(documentEntId)) {
                    attachedDocuments.put(documentEntId, sqlId);
                }
            }
        }

        return attachedDocuments;
    }

    private void createLessonHasAttachment(final SqlStatementsBuilder sqlBuilder, Attachment attachment, Long lessonId) {
        StringBuilder query = new StringBuilder("INSERT INTO ");
        query.append(DiaryController.DATABASE_SCHEMA).append(".").append(SQL_LESSON_HAS_ATTACHMENT_TABLE_NAME);
        query.append(" VALUES (?,?);");

        final JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        values.add(lessonId);
        values.add(attachment.getId());

        sqlBuilder.prepared(query.toString(), values);
    }

    @Override
    public void retrieveLesson(String lessonId, Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT l.id as lesson_id, array_to_json(array_agg(distinct homework)) as homeworks, s.subject_label, l.subject_id, l.school_id, l.teacher_id, t.teacher_display_name, a.audience_type,")
                .append(" l.audience_id, a.audience_label, l.lesson_title, l.lesson_room, l.lesson_color, l.lesson_date, l.course_id, ")
                .append(" array_to_json(array_agg(DISTINCT visa)) AS visas, ")
                .append(" l.lesson_start_time, l.lesson_end_time, l.lesson_description, l.lesson_annotation, l.lesson_state ")
                .append(" FROM diary.lesson as l")
                .append(" INNER JOIN diary.subject as s ON s.id = l.subject_id")
                .append(" INNER JOIN diary.audience as a ON a.id = l.audience_id")
                .append(" INNER JOIN diary.teacher as t ON t.id = l.teacher_id")
                .append(" LEFT JOIN diary.visa AS visa ON visa.session_id = l.id")
                .append(" LEFT JOIN diary.homework AS homework ON homework.lesson_id = l.id")
                .append(" WHERE l.id = ? ")
                .append(" GROUP BY l.id, s.id, t.teacher_display_name, a.audience_type, a.audience_label ");

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(lessonId));

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }


    /**
     * Update lesson in db from JSON lesson object
     *
     * @param lessonId     Lesson id
     * @param lessonObject Lesson object
     * @param handler
     */
    @Override
    public void updateLesson(final String lessonId, final JsonObject lessonObject, final Handler<Either<String, JsonObject>> handler) {

        stripNonLessonFields(lessonObject);
        // FIXME have to remove lesson_state field since SQL error on update enum/character varying
        lessonObject.remove("lesson_state");

        StringBuilder sb = new StringBuilder();
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray();
        //TODO query without loops
        for (String attr : lessonObject.fieldNames()) {
            if (attr.equals("lesson_date")) {
                sb.append(attr).append(" = to_date(?, 'YYYY-MM-DD'), ");
            } else if (attr.equals("lesson_start_time") || attr.equals("lesson_end_time")) {
                sb.append(attr).append(" = to_timestamp(?, 'hh24:mi:ss'), ");
            } else {
                sb.append(attr).append(" = ?, ");
            }
            values.add(lessonObject.getValue(attr));
        }

        sb.append(" modified = NOW()");
        StringBuilder query = new StringBuilder("UPDATE diary.lesson ");
        query.append(" SET ").append(sb.toString()).append("WHERE id = ? ");
        sql.prepared(query.toString(), values.add(Sql.parseId(lessonId)), validRowsResultHandler(handler));
    }


    @Override
    public void deleteLesson(final String  lessonId, final Handler<Either<String, JsonObject>> handler) {
        super.delete(lessonId, handler);
    }

    @Override
    public void deleteLessons(final List<String>  lessonIds, final Handler<Either<String, JsonObject>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("DELETE FROM diary.lesson as l where l.id in ");
        query.append(sql.listPrepared(lessonIds.toArray()));

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
        for (Object id: lessonIds) {
            parameters.add(id);
        }

        sql.prepared(query.toString(), parameters, validRowsResultHandler(handler));
    }


    /**
     * Publishes a lesson (changing status from draft to published)
     * Linked homeworks are also published
     *
     * @param lessonId Id of lesson to be deleted
     * @param handler
     */
    public void publishLesson(String lessonId, final UserInfos userInfos, Handler<Either<String, JsonObject>> handler) {
        List<String> idLessonsToDelete = new ArrayList<String>();
        idLessonsToDelete.add(lessonId);
        publishLessons(idLessonsToDelete, userInfos, handler);
    }

    /**
     * Unpublishes a lesson (changing status from published to draft)
     * Linked homeworks are also unpublished
     *
     * @param lessonId Id of lesson to be deleted
     * @param handler
     */
    public void unPublishLesson(String lessonId, Handler<Either<String, JsonObject>> handler) {
        List<String> idLessonsToDelete = new ArrayList<String>();
        idLessonsToDelete.add(lessonId);
        unPublishLessons(idLessonsToDelete, handler);
    }

    /**
     * Publishes lessons (changing status from draft to published)
     * Linked homeworks are also published
     *
     * @param lessonIds Ids of lessons to be deleted
     * @param handler
     */
    @Override
    public void publishLessons(List<String> lessonIds,final UserInfos userInfos, Handler<Either<String, JsonObject>> handler) {
        changeLessonsState(lessonIds, ResourceState.DRAFT, ResourceState.PUBLISHED, userInfos,handler);
    }

    @Override
    public void unPublishLessons(List<String> lessonIds,Handler<Either<String, JsonObject>> handler) {
        changeLessonsState(lessonIds, ResourceState.PUBLISHED, ResourceState.DRAFT, null,handler);
    }

    /**
     * @param lessonIds    Lesson ids to change state
     * @param initialState Initial state of lessons
     * @param finalState   Final state of lessons
     * @param handler
     */
    private void changeLessonsState(final List<String> lessonIds, ResourceState initialState, final ResourceState finalState, final UserInfos userInfos, final Handler<Either<String, JsonObject>> handler) {
        StringBuilder lessonSb = new StringBuilder();
        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();

        for (String id : lessonIds) {
            parameters.add(id);
        }

        // un/publish lessons
        lessonSb.append("UPDATE diary.lesson SET modified = NOW(), lesson_state = '").append(finalState.toString()).append("' ");
        lessonSb.append("WHERE id in ");
        lessonSb.append(sql.listPrepared(lessonIds.toArray()));
        lessonSb.append(" AND lesson_state = '").append(initialState.toString()).append("' ");

        // un/publish associated homeworks
        StringBuilder homeworkSb = new StringBuilder();
        homeworkSb.append("UPDATE diary.homework SET modified = NOW(), homework_state = '").append(finalState.toString()).append("' ");
        homeworkSb.append("WHERE lesson_id in ");
        homeworkSb.append(sql.listPrepared(lessonIds.toArray()));
        homeworkSb.append(" AND homework_state = '").append(initialState.toString()).append("' ");

        SqlStatementsBuilder transactionBuilder = new SqlStatementsBuilder();
        transactionBuilder.prepared(lessonSb.toString(), parameters);
        transactionBuilder.prepared(homeworkSb.toString(), parameters);
        sql.transaction(transactionBuilder.build(), new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                if (finalState == ResourceState.PUBLISHED ){
                    for (String lessonId :  lessonIds ){
                        homeworkService.notifyHomeworkShare(Long.parseLong(lessonId), null, userInfos, new Handler<GenericHandlerResponse>() {
                            @Override
                            public void handle(GenericHandlerResponse event) {
                            }
                        });
                    }
                }
                handler.handle(new Either.Right<String, JsonObject>(event.body()));
            }
        });
    }

    /**
     * Controls the date format. Must be yyyy-MM-dd.
     */
    private boolean isDateValid(String date) {
        if (date == null || !date.matches(DateUtils.DATE_FORMAT_REGEX))
            return false;
        SimpleDateFormat df = new SimpleDateFormat(DateUtils.DATE_FORMAT);
        df.setLenient(false);
        try {
            df.parse(date);
            return true;
        } catch (ParseException ex) {
            return false;
        }
    }
}
