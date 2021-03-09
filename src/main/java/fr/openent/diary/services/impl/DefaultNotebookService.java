package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.core.enums.DiaryType;
import fr.openent.diary.db.DBService;
import fr.openent.diary.helper.DiaryTypeHelper;
import fr.openent.diary.helper.FileHelper;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.helper.NotebookHelper;
import fr.openent.diary.models.*;
import fr.openent.diary.models.Person.User;
import fr.openent.diary.services.*;
import fr.openent.diary.utils.SqlQueryUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.*;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.storage.Storage;

import java.util.*;
import java.util.stream.Collectors;

import static fr.openent.diary.core.enums.DiaryType.HOMEWORK;
import static fr.openent.diary.core.enums.DiaryType.SESSION;

public class DefaultNotebookService extends DBService implements NotebookService {
    private static final Logger log = LoggerFactory.getLogger(DefaultNotebookService.class);
    private final SubjectService subjectService;
    private final GroupService groupService;
    private final UserService userService;
    private final ExportPDFService exportPDFService;
    private final Storage storage;

    public DefaultNotebookService(EventBus eb, Vertx vertx, Storage storage, JsonObject config) {
        this.subjectService = new DefaultSubjectService(eb);
        this.groupService = new DefaultGroupService(eb);
        this.userService = new DefaultUserService();
        this.exportPDFService = new ExportPDFServiceImpl(eb, vertx, storage, config);
        this.storage = storage;
    }

    @Override
    public void get(String structure_id, String start_at, String end_at, List<String> teacher_id, List<String> audience_id,
                    Boolean isVisa, String visaOrder, Boolean isPublished, Integer page, String limit, String offset,
                    Handler<Either<String, JsonObject>> handler) {
        Future<JsonArray> listResultsFuture = Future.future();
        Future<Long> countResultsFuture = Future.future();

        getNotebooks(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, visaOrder, isPublished,
                page, limit, offset, listResultsFuture);
        countRequest(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, visaOrder, isPublished, countResultsFuture);

        CompositeFuture.all(listResultsFuture, countResultsFuture).setHandler(eventResult -> {
            if (eventResult.failed()) {
                handler.handle(new Either.Left<>(eventResult.cause().getMessage()));
                return;
            }

            JsonObject result = new JsonObject()
                    .put("all", listResultsFuture.result())
                    .put("page_count", countResultsFuture.result() <= Diary.PAGE_SIZE ?
                            0 : (long) Math.ceil(countResultsFuture.result() / (double) Diary.PAGE_SIZE));

            if (page != null) {
                result.put("page", page);
            } else {
                if (limit != null) {
                    result.put("limit", limit);
                }
                if (offset != null) {
                    result.put("offset", offset);
                }
            }

            handler.handle(new Either.Right<>(result));
        });
    }

    @Override
    public void getNotebooks(String structure_id, String start_at, String end_at, List<String> teacher_ids,
                             List<String> audience_ids, Boolean isVisa, String visaOrder, Boolean isPublished, Integer page,
                             String limit, String offset, Future<JsonArray> future) {
        JsonArray notebookParams = new JsonArray();
        Future<JsonArray> notebookFuture = Future.future();

        notebookFuture.setHandler(event -> {
            if (event.failed()) {
                String message = "[Diary@DefaultNotebookService::getNotebooksRequest] Failed to retrieve notebooks. ";
                log.error(message + event.cause());
                future.fail(message);
            } else {
                List<Notebook> notebookList = NotebookHelper.toNotebookList(notebookFuture.result());

                List<String> subjectIds = notebookList.stream().map(n -> n.getSubject().getId()).collect(Collectors.toList());
                List<String> teacherIds = notebookList.stream().map(n -> n.getTeacher().getId()).collect(Collectors.toList());
                List<String> audienceIds = notebookList.stream().map(n -> n.getAudience().getId()).collect(Collectors.toList());

                Future<List<Subject>> subjectsFuture = Future.future();
                Future<List<User>> teachersFuture = Future.future();
                Future<List<Audience>> audiencesFuture = Future.future();

                CompositeFuture.all(subjectsFuture, teachersFuture, audiencesFuture).setHandler(result -> {

                    if (result.failed()) {
                        String message = "[Diary@DefaultNotebookService::getNotebooksRequest] Failed to get main line of Notebooks. ";
                        log.error(message + " " + result.cause());
                        future.fail(message);
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

                        for (Notebook notebook : notebookList) {
                            notebook.setSubject(subjectMap.getOrDefault(notebook.getSubject().getId(), new Subject(notebook.getSubject().getId())));
                            notebook.setTeacher(teacherMap.getOrDefault(notebook.getTeacher().getId(), new User(notebook.getTeacher().getId())));
                            notebook.setAudience(audienceMap.getOrDefault(notebook.getAudience().getId(), new Audience(notebook.getAudience().getId())));
                        }
                        future.complete(NotebookHelper.toJsonArray(notebookList));
                    }
                });

                this.subjectService.getSubjects(new JsonArray(subjectIds), subjectsFuture);
                this.userService.getTeachers(new JsonArray(teacherIds), teachersFuture);
                this.groupService.getGroups(new JsonArray(audienceIds), audiencesFuture);
            }
        });

        Sql.getInstance().prepared(queryGetter(false, structure_id, start_at, end_at, teacher_ids, audience_ids,
                isVisa, visaOrder, isPublished, page, limit, offset, notebookParams), notebookParams,
                SqlResult.validResultHandler(FutureHelper.handlerJsonArray(notebookFuture)));
    }

    public Future<JsonArray> getNotebooks(String structureId, String starAt, String enAt, List<String> teacherIds,
                                          List<String> audienceIds, Boolean isVisa, String visaOrder, Boolean isPublished, Integer page,
                                          String limit, String offset) {
        Future<JsonArray> future = Future.future();
        getNotebooks(structureId, starAt, enAt, teacherIds, audienceIds, isVisa, visaOrder, isPublished, page,
                limit, offset, future);
        return future;
    }

    private void countRequest(String structure_id, String start_at, String end_at, List<String> teacher_id,
                              List<String> audience_id, Boolean isVisa, String visaOrder, Boolean isPublished, Future<Long> future) {
        JsonArray params = new JsonArray();
        Sql.getInstance().prepared(queryGetter(true, structure_id, start_at, end_at, teacher_id,
                audience_id, isVisa, visaOrder, isPublished, null, null, null, params), params, SqlResult.validUniqueResultHandler(event -> {
            if (event.isLeft()) {
                String message = "[Diary@DefaultNotebookService::countRequest] Failed to count notebooks.";
                log.error(message + " " + event.left().getValue());
                future.fail(message);
            } else {
                Long count = event.right().getValue().getLong("count", 0L);
                future.complete(count);
            }
        }));
    }

    private String queryGetter(boolean isCountQueryString, String structure_id, String start_at, String end_at,
                               List<String> teacher_ids, List<String> audience_ids, Boolean isVisa, String visaOrder,
                               Boolean isPublished, Integer page, String limit, String offset, JsonArray params) {

        return getNotebookCTEQuery(structure_id, start_at, end_at, teacher_ids, audience_ids,
                isVisa, isPublished, params) + getSelectNotebookQuery(isCountQueryString, isVisa, visaOrder, page, limit, offset, params);
    }

    private String getSelectNotebookQuery(boolean isCountQueryString, Boolean isVisa, String visaOrder, Integer page, String limit,
                                          String offset, JsonArray params) {
        if (isCountQueryString) {
            return " SELECT COUNT(DISTINCT notebook_id) FROM notebooks";
        }
        // SELECT DISTINCT on a SELECT in order to keep the distinct and make order by treatment
        String query = " SELECT * FROM (SELECT DISTINCT ON (notebook_id) * FROM notebooks) AS notebooks ";

        // order by visa
        if ((isVisa != null && isVisa) || (visaOrder != null && !visaOrder.isEmpty())) {
            query += "ORDER BY visa " + (visaOrder.equals("ASC") ? visaOrder + " NULLS FIRST " : visaOrder + " NULLS LAST ");
        }

        // paginations cases
        if (page != null) {
            query += "LIMIT " + Diary.PAGE_SIZE + " ";
            query += "OFFSET " + page * Diary.PAGE_SIZE + " ";
        } else {
            if (limit != null) {
                query += "LIMIT ? ";
                params.add(limit);
            }

            if (offset != null) {
                query += "OFFSET ? ";
                params.add(offset);
            }
        }
        return query;
    }

    private String getNotebookCTEQuery(String structure_id, String start_at, String end_at,
                                       List<String> teacher_ids, List<String> audience_ids, Boolean isVisa,
                                       Boolean isPublished, JsonArray params) {
        String selectQuery = "WITH notebooks AS (";

        selectQuery += getSelectNotebookContentQuery(isVisa);

        if (isVisa == null) {
            // NONE filter with VISA case
            selectQuery += "LEFT JOIN diary.session_visa ON (notebook.type = '" + SESSION.toString() +
                    "' AND notebook.id = session_visa.session_id) " +
                    "LEFT JOIN diary.homework_visa ON (notebook.type = '" + HOMEWORK.toString() +
                    "' AND notebook.id = homework_visa.homework_id) " +
                    "LEFT JOIN diary.visa ON (session_visa.visa_id = visa.id OR homework_visa.visa_id = visa.id)";

            selectQuery += getFilterSelectQueryNotebook(structure_id, isVisa, start_at, end_at, teacher_ids,
                    audience_ids, isPublished, params, true);
            return selectQuery + ')';
        } else {
            // Filtering with VISA case

            // filter visa true case
            if (isVisa) {
                selectQuery += "INNER JOIN diary.session_visa ON (notebook.type = '" + SESSION.toString() +
                        "' AND notebook.id = session_visa.session_id) " +
                        "INNER JOIN diary.visa ON (session_visa.visa_id = visa.id) ";
            }

            // potentially filter visa false case
            selectQuery += getFilterSelectQueryNotebook(structure_id, isVisa, start_at, end_at, teacher_ids,
                    audience_ids, isPublished, params, null);

            // filter visa true case
            if (isVisa) {
                selectQuery += "UNION ALL ";
                selectQuery += getSelectNotebookContentQuery(isVisa);
                selectQuery += "INNER JOIN diary.homework_visa ON (notebook.type = '" + HOMEWORK.toString() +
                        "' AND notebook.id = homework_visa.homework_id) " +
                        "INNER JOIN diary.visa ON (homework_visa.visa_id = visa.id) ";
                selectQuery += getFilterSelectQueryNotebook(structure_id, isVisa, start_at, end_at, teacher_ids,
                        audience_ids, isPublished, params, null);
            }

        }
        return selectQuery + ')';
    }

    private String getSelectNotebookContentQuery(Boolean isVisa) {
        return "SELECT concat(notebook.subject_id, '$', " +
                "notebook.teacher_id, '$', notebook.audience_id) as notebook_id, notebook.subject_id, " +
                "notebook.teacher_id, notebook.audience_id, notebook.exceptional_label, count(distinct notebook.id) as sessions, MAX(notebook.modified) as modified, " +
                ((isVisa == null || isVisa) ? "MAX(visa.created)" : "null") + " as visa" + " FROM " + Diary.DIARY_SCHEMA + ".notebook ";
    }

    private String getFilterSelectQueryNotebook(String structure_id, Boolean isVisa, String start_at,
                                                String end_at, List<String> teacher_ids, List<String> audience_ids,
                                                Boolean isPublished, JsonArray params, Boolean visaOrderParam) {

        // structure id
        String query = " WHERE notebook.structure_id = ? ";
        params.add(structure_id);

        // NO VISA filter case
        if (isVisa != null && !isVisa) {
            query += "AND NOT EXISTS(SELECT 1 FROM " + Diary.DIARY_SCHEMA + ".session_visa session_visa " +
                    "WHERE notebook.type = '" + SESSION.toString() + "' AND session_visa.session_id = notebook.id) " +
                    "AND NOT EXISTS(SELECT 1 FROM " + Diary.DIARY_SCHEMA + ".homework_visa homework_visa " +
                    "WHERE notebook.type = '" + HOMEWORK.toString() + "' AND homework_visa.homework_id = notebook.id) ";
        }

        // start date case
        if (start_at != null) {
            query += "AND notebook.date >= ? ";
            params.add(start_at);
        }

        // end date case
        if (end_at != null) {
            query += "AND notebook.date <= ? ";
            params.add(end_at);
        }

        // teacher_ids case
        if (teacher_ids != null && !teacher_ids.isEmpty()) {
            query += "AND notebook.teacher_id IN " + Sql.listPrepared(teacher_ids) + " ";
            params.addAll(new JsonArray(teacher_ids));
        }

        // audience_ids case
        if (audience_ids != null && !audience_ids.isEmpty()) {
            query += "AND notebook.audience_id IN " + Sql.listPrepared(audience_ids) + " ";
            params.addAll(new JsonArray(audience_ids));
        }

        // published case
        if (isPublished != null) {
            query += "AND notebook.is_published IS " + isPublished + " ";
        }
        query += "GROUP BY notebook.subject_id, notebook.teacher_id, notebook.audience_id, notebook.exceptional_label ";

        return query;
    }

    @Override
    public Future<Void> archiveNotebooks(String structureId, String structureName, String date, String archivePeriod, List<Notebook> notebooks) {
        Future<Void> future = Future.future();
        if (notebooks == null || notebooks.isEmpty()) {
            future.complete();
            return future;
        }

        List<Future<JsonObject>> archiveTreatmentsFuture = new ArrayList<>();
        for (Notebook notebook : notebooks) {
            Future<JsonObject> archiveTreatmentFuture = Future.future();
            archiveTreatmentsFuture.add(archiveTreatmentFuture);
            archiveNotebook(structureId, structureName, date, archivePeriod, notebook, archiveTreatmentFuture);
        }

        FutureHelper.any(archiveTreatmentsFuture).setHandler(result -> {
            if (result.failed()) {
                String message = "[Diary@DefaultNotebookService::archiveNotebooks] Failed to archive notebooks";
                log.error(message, result.cause().getMessage());
                future.fail(message);
                return;
            }
            future.complete();
        });

        return future;
    }

    private void archiveNotebook(String structureId, String structureName, String date, String archivePeriod, Notebook notebook, Future<JsonObject> future) {
        NotebookArchive archive = new NotebookArchive(notebook);
        archive.setStructureId(structureId);
        archive.setStructureLabel(structureName);
        archive.setArchiveSchoolYear(archivePeriod);

        Future<List<Notebook>> notebookContentFuture = Future.future();
        getNotebookHomeworksSessions(structureId, date, notebook, notebookContentFuture)
                .compose(notebookContent -> generatePdf(structureName, archivePeriod, notebook, archive, notebookContent))
                .compose(pdf -> saveArchive(archive, notebookContentFuture.result(), archivePeriod))
                .setHandler(result -> {
                    if (result.succeeded()) {
                        future.complete(new JsonObject().put("success", "ok"));
                        return;
                    }
                    String message = "[Diary@DefaultNotebookService::archiveNotebook] Failed to archive notebook";
                    log.error(message, result.cause().getMessage());
                    if (archive.getFileId() == null) {
                        future.fail(message);
                        return;
                    }

                    FileHelper.removeFile(storage, archive.getFileId(), removeResult -> {
                        if (removeResult.failed()) {
                            String error = "[Diary@DefaultNotebookService::archiveNotebook] Failed to remove archive file from id: " +
                                    archive.getFileId();
                            future.fail(error);
                            return;
                        }

                        future.fail(message);
                    });
                });
    }

    private Future<List<Notebook>> getNotebookHomeworksSessions(String structureId, String date,
                                                                Notebook notebook, Future<List<Notebook>> future) {
        getNotebookHomeworksSessions(structureId, null, date, notebook.getSubject().getId(),
                notebook.getTeacher().getId(), notebook.getAudience().getId(), null, null, notebookSessionsResult -> {
                    if (notebookSessionsResult.isLeft()) {
                        future.handle(Future.failedFuture(notebookSessionsResult.left().getValue()));
                        return;
                    }

                    List<Notebook> notebookSessions = NotebookHelper.toNotebookList(notebookSessionsResult.right().getValue());
                    future.handle(Future.succeededFuture(notebookSessions));
                });

        return future;
    }

    private Future<Void> generatePdf(String structureName, String archivePeriod, Notebook notebook,
                                     NotebookArchive archive, List<Notebook> notebookSessions) {
        Future<Void> future = Future.future();
        NotebookPdf notebookPdf = new NotebookPdf(structureName, notebook, notebookSessions);
        exportPDFService.generatePDF(notebookPdf.toJSON(), "notebook-archive.xhtml", buffer -> {
                    if (buffer.failed()) {
                        String message = "[Diary@DefaultNotebookService::archiveNotebooks] Failed to generate PDF";
                        log.error(message, buffer.cause().getMessage());
                        future.fail(message);
                        return;
                    }
                    exportPDFService.storePDF(buffer.result(), getArchiveFileName(archivePeriod, notebookPdf), pdfResult -> {
                        if (pdfResult.isLeft()) {
                            String message = "[Diary@DefaultNotebookService::generateArchivePDF] Failed to save Pdf";
                            log.error(message);
                            future.fail(message);
                            return;
                        }
                        JsonObject file = pdfResult.right().getValue();
                        archive.setFileId(file.getString("_id"));
                        future.complete();
                    });
                });
        return future;
    }

    private String getArchiveFileName(String archivePeriod, NotebookPdf notebookPdf) {
        return archivePeriod + notebookPdf.getAudience() + "-" +
                notebookPdf.getSubject() + "-" + notebookPdf.getTeacher();
    }

    private Future<Void> saveArchive(NotebookArchive archive, List<Notebook> notebookSessions, String archivePeriod) {
        Future<Void> future = Future.future();

        JsonArray statements = new JsonArray()
                .add(createArchiveStatement(archive))
                .addAll(updateNotebooksStatements(notebookSessions, archivePeriod));

        sql.transaction(statements, result -> SqlQueryUtils.getTransactionHandler(result, future));

        return future;
    }

    private JsonObject createArchiveStatement(NotebookArchive archive) {
        String query = "INSERT INTO " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " (structure_id, structure_label, teacher_id, teacher_first_name, teacher_last_name, audience_label, " +
                " subject_label, archive_school_year, file_id) " +
                " VALUES (?,?,?,?,?,?,?,?,?)";

        JsonArray values = new JsonArray()
                .add(archive.getStructureId())
                .add(archive.getStructureLabel())
                .add(archive.getTeacherId())
                .add(archive.getTeacherFirstName())
                .add(archive.getTeacherLastName())
                .add(archive.getAudienceLabel())
                .add(archive.getSubjectLabel())
                .add(archive.getArchiveSchoolYear())
                .add(archive.getFileId());

        return new JsonObject()
                .put("statement", query)
                .put("values", values)
                .put("action", "prepared");
    }

    private JsonArray updateNotebooksStatements(List<Notebook> notebookSessions, String archiveSchoolYear) {
        List<Long> sessionIds = notebookSessions.stream()
                .filter(notebookSession -> notebookSession.getType().equals(Notebook.SESSION_TYPE))
                .map(Notebook::getId)
                .collect(Collectors.toList());

        List<Long> homeworkIds = notebookSessions.stream()
                .filter(notebookSession -> notebookSession.getType().equals(Notebook.HOMEWORK_TYPE))
                .map(Notebook::getId)
                .collect(Collectors.toList());


        JsonArray statements = new JsonArray();

        if (!sessionIds.isEmpty()) {
            statements.add(getUpdateNotebookStatement("session", archiveSchoolYear, sessionIds));
        }

        if (!homeworkIds.isEmpty()) {
            statements.add(getUpdateNotebookStatement("homework", archiveSchoolYear, homeworkIds))
                    .add(removeProgressHomeworksStatement(homeworkIds));
        }

        return statements;
    }

    private JsonObject getUpdateNotebookStatement(String notebookTableName, String archiveSchoolYear, List<Long> ids) {
        String query = "UPDATE " + Diary.DIARY_SCHEMA + "." + notebookTableName +
                " SET archive_school_year = ?" +
                " WHERE id IN " + Sql.listPrepared(ids);

        JsonArray params = new JsonArray().add(archiveSchoolYear)
                .addAll(new JsonArray(ids));

        return new JsonObject()
                .put("statement", query)
                .put("values", params)
                .put("action", "prepared");
    }

    private JsonObject removeProgressHomeworksStatement(List<Long> homeworkIds) {
        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".homework_progress WHERE homework_id IN " + Sql.listPrepared(homeworkIds);

        return new JsonObject()
                .put("statement", query)
                .put("values", new JsonArray(homeworkIds))
                .put("action", "prepared");
    }


    @Override
    public void getNotebookHomeworksSessions(String structure_id, String start_at, String end_at, String subject_id,
                                             String teacher_id, String audience_id, Boolean isVisa, Boolean isPublished,
                                             Handler<Either<String, JsonArray>> handler) {
        fetchNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id, audience_id, isVisa,
                isPublished, event -> {
                    if (event.failed()) {
                        handler.handle(new Either.Left<>(event.cause().getMessage()));
                    } else {
                        List<Notebook> notebookList = event.result();
                        List<String> subjectIds = notebookList.stream().map(n -> n.getSubject().getId()).collect(Collectors.toList());
                        List<String> teacherIds = notebookList.stream().map(n -> n.getTeacher().getId()).collect(Collectors.toList());
                        List<String> audienceIds = notebookList.stream().map(n -> n.getAudience().getId()).collect(Collectors.toList());

                        Future<List<Subject>> subjectsFuture = Future.future();
                        Future<List<User>> teachersFuture = Future.future();
                        Future<List<Audience>> audiencesFuture = Future.future();

                        CompositeFuture.all(subjectsFuture, teachersFuture, audiencesFuture).setHandler(result -> {

                            if (result.failed()) {
                                String message = "[Diary@DefaultNotebookService::getNotebookHomeworksSessions] Failed to get notebooksSessions. ";
                                log.error(message + " " + result.cause());
                                handler.handle(new Either.Left<>(message));
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

                                for (Notebook notebook : notebookList) {
                                    notebook.setSubject(subjectMap.getOrDefault(notebook.getSubject().getId(), new Subject(notebook.getSubject().getId())));
                                    notebook.setTeacher(teacherMap.getOrDefault(notebook.getTeacher().getId(), new User(notebook.getTeacher().getId())));
                                    notebook.setAudience(audienceMap.getOrDefault(notebook.getAudience().getId(), new Audience(notebook.getAudience().getId())));
                                }
                                handler.handle(new Either.Right<>(NotebookHelper.toJsonArray(notebookList)));
                            }
                        });
                        this.subjectService.getSubjects(new JsonArray(subjectIds), subjectsFuture);
                        this.userService.getTeachers(new JsonArray(teacherIds), teachersFuture);
                        this.groupService.getGroups(new JsonArray(audienceIds), audiencesFuture);
                    }
                });
    }

    private void fetchNotebookHomeworksSessions(String structure_id, String start_at, String end_at, String subject_id, String teacher_id,
                                                String audience_id, Boolean isVisa, Boolean isPublished, Handler<AsyncResult<List<Notebook>>> handler) {
        Future<List<Notebook>> notebookHomeworksSessionsFuture = Future.future();
        Future<List<DiaryTypeModel>> diaryTypeFuture = Future.future();

        getNotebookHomeworksSessionsRequest(structure_id, start_at, end_at, subject_id, teacher_id, audience_id,
                isVisa, isPublished, notebookHomeworksSessionsFuture);
        fetchDiaryType(structure_id, diaryTypeFuture);

        CompositeFuture.all(notebookHomeworksSessionsFuture, diaryTypeFuture).setHandler(result -> {
            if (result.failed()) {
                String message = "[Diary@DefaultNotebookService::fetchNotebookHomeworksSessions] Failed to fetch " +
                        "content notebook homeworks and sessions and their corresponding type ";
                log.error(message + result.cause());
                handler.handle(Future.failedFuture(message));
            } else {

                List<Notebook> notebookList = notebookHomeworksSessionsFuture.result();
                List<DiaryTypeModel> diaryTypeModelList = diaryTypeFuture.result();

                for (Notebook notebook : notebookList) {
                    for (DiaryTypeModel diaryType : diaryTypeModelList) {
                        if (notebook.getType().equals(diaryType.getType()) && notebook.getDiaryType().getId().equals(diaryType.getId())) {
                            notebook.setDiaryType(diaryType);
                        }
                    }
                }
                handler.handle(Future.succeededFuture(notebookList));
            }
        });

    }

    private void getNotebookHomeworksSessionsRequest(String structure_id, String start_at, String end_at, String subject_id,
                                                     String teacher_id, String audience_id, Boolean isVisa, Boolean isPublished,
                                                     Handler<AsyncResult<List<Notebook>>> handler) {
        JsonArray params = new JsonArray();

        String query = "WITH notebooks AS ( ";

        query += getHomeworksSessionsSelectQuery(isVisa);

        // no specific filter for VISA case
        if (isVisa == null) {
            query += "LEFT JOIN " + getSubQueryJoin(SESSION) + "  ON (notebook.type = '" + SESSION.toString() + "'" +
                    " AND notebook.id = session_visa.session_id)" +
                    " LEFT JOIN diary.visa ON (session_visa.visa_id = visa.id)";
            query += getFilterQueryNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id,
                    audience_id, isVisa, SESSION.toString(), isPublished, params);
            query += " UNION " + getHomeworksSessionsSelectQuery(isVisa) +
                    " LEFT JOIN " + getSubQueryJoin(HOMEWORK) + " ON (notebook.type = '" + HOMEWORK.toString() + "'" +
                    " AND notebook.id = homework_visa.homework_id)" +
                    " LEFT JOIN diary.visa ON (homework_visa.visa_id = visa.id)";
            query += getFilterQueryNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id,
                    audience_id, isVisa, HOMEWORK.toString(), isPublished, params);

            query += getHomeworksSessionsSelectResultQuery();
        }

        // filter VISA true case
        if (isVisa != null && isVisa) {
            query += "INNER JOIN " + getSubQueryJoin(SESSION) + " ON (notebook.type = '" + SESSION.toString() + "'" +
                    " AND notebook.id = session_visa.session_id)" +
                    " INNER JOIN diary.visa ON (session_visa.visa_id = visa.id)";
            query += getFilterQueryNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id,
                    audience_id, isVisa, SESSION.toString(), isPublished, params);
            query += " UNION " + getHomeworksSessionsSelectQuery(isVisa) +
                    " INNER JOIN " + getSubQueryJoin(HOMEWORK) + " ON (notebook.type = '" + HOMEWORK.toString() + "'" +
                    " AND notebook.id = homework_visa.homework_id)" +
                    " INNER JOIN diary.visa ON (homework_visa.visa_id = visa.id)";
            query += getFilterQueryNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id,
                    audience_id, isVisa, HOMEWORK.toString(), isPublished, params);

            query += getHomeworksSessionsSelectResultQuery();
        }

        // filter VISA false case
        if (isVisa != null && !isVisa) {
            query += getFilterQueryNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id,
                    audience_id, isVisa, null, isPublished, params);
            query += getHomeworksSessionsSelectResultQuery();
        }

        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(event -> {
            if (event.isLeft()) {
                String message = "[Diary@DefaultNotebookService::getNotebookHomeworksSessionsRequest] Failed to get content " +
                        "sessions and homeworks notebooks. ";
                log.error(message + " " + event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            } else {
                handler.handle(Future.succeededFuture(NotebookHelper.toNotebookList(event.right().getValue())));
            }
        }));
    }

    private void getNotebookHomeworksSessionsRequest(String structure_id, String start_at, String end_at, String subject_id,
                                                     String teacher_id, String audience_id, Boolean isVisa, Boolean isPublished,
                                                     Future<List<Notebook>> future) {
        getNotebookHomeworksSessionsRequest(structure_id, start_at, end_at, subject_id, teacher_id, audience_id,
                isVisa, isPublished, event -> {
                    if (event.failed()) {
                        future.fail(event.cause());
                    } else {
                        future.complete(event.result());
                    }
                });
    }

    private String getHomeworksSessionsSelectQuery(Boolean isVisa) {
        return "SELECT notebook.* " + ((isVisa == null || isVisa) ? ", to_jsonb(visa) as visas" : "") + " FROM diary.notebook as notebook ";
    }

    private String getHomeworksSessionsSelectResultQuery() {
        return ") SELECT * from notebooks ORDER BY date DESC";
    }

    private String getSubQueryJoin(DiaryType diaryType) {
        switch (diaryType) {
            case SESSION:
                return "(SELECT DISTINCT ON (session_id) visa_id, session_id FROM diary.session_visa " +
                        "ORDER BY session_id, visa_id DESC) session_visa";
            case HOMEWORK:
                return "(SELECT DISTINCT ON (homework_id) visa_id, homework_id FROM diary.homework_visa " +
                        "ORDER BY homework_id, visa_id DESC) homework_visa";
            default:
                return null;
        }
    }

    private String getFilterQueryNotebookHomeworksSessions(String structure_id, String start_at, String end_at,
                                                           String subject_id, String teacher_id, String audience_id,
                                                           Boolean isVisa, String visaDiaryType, Boolean isPublished,
                                                           JsonArray params) {
        // structure id
        String query = " WHERE notebook.structure_id = ? ";
        params.add(structure_id);

        // VISA filter case for its JOIN
        if (isVisa == null || isVisa) {
            query += "AND notebook.type = '" + visaDiaryType + "' ";
        }

        // NO VISA filter case
        if (isVisa != null && !isVisa) {
            query += "AND NOT EXISTS(SELECT 1 FROM diary.session_visa session_visa " +
                    "WHERE notebook.type = '" + SESSION.toString() + "' AND session_visa.session_id = notebook.id) " +
                    "AND NOT EXISTS(SELECT 1 FROM diary.homework_visa homework_visa " +
                    "WHERE notebook.type = '" + HOMEWORK.toString() + "' AND homework_visa.homework_id = notebook.id) ";
        }

        // start date case
        if (start_at != null) {
            query += "AND notebook.date >= ? ";
            params.add(start_at);
        }

        // end date case
        if (end_at != null) {
            query += "AND notebook.date <= ? ";
            params.add(end_at);
        }

        // subject_id case
        if (subject_id != null) {
            query += "AND notebook.subject_id = ? ";
            params.add(subject_id);
        }

        // teacher_id case
        if (subject_id != null) {
            query += "AND notebook.teacher_id = ? ";
            params.add(teacher_id);
        }

        // audience_id case
        if (subject_id != null) {
            query += "AND notebook.audience_id = ? ";
            params.add(audience_id);
        }

        // published case
        if (isPublished != null) {
            query += "AND notebook.is_published IS " + isPublished + " ";
        }

        query += "GROUP BY notebook.id, notebook.subject_id, notebook.structure_id, notebook.teacher_id, notebook.audience_id, " +
                "notebook.description, notebook.title, notebook.type_id, notebook.modified, notebook.is_published, notebook.date, " +
                "notebook.start_time, notebook.end_time, notebook.type, notebook.session_id, notebook.annotation, " +
                "notebook.workload, notebook.estimatedtime, notebook.exceptional_label" + ((isVisa == null || isVisa) ? ", visa" : " ");
        return query;
    }

    private void fetchDiaryType(String structureId, Handler<AsyncResult<List<DiaryTypeModel>>> handler) {
        String query = "SELECT id, structure_id, label, rank, '" + HOMEWORK.toString() + "' AS type FROM diary.homework_type WHERE structure_id = ? " +
                "UNION SELECT id, structure_id, label, rank, '" + SESSION.toString() + "' AS type FROM diary.session_type WHERE structure_id = ?";
        JsonArray params = new JsonArray().add(structureId).add(structureId);
        Sql.getInstance().prepared(query, params, SqlResult.validResultHandler(event -> {
            if (event.isLeft()) {
                String message = "[Diary@DefaultNotebookService::fetchDiaryType] Failed to fetch homework and session type. ";
                log.error(message + event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            } else {
                handler.handle(Future.succeededFuture(DiaryTypeHelper.toDiaryTypeModelList(event.right().getValue())));
            }
        }));
    }

    private void fetchDiaryType(String structureId, Future<List<DiaryTypeModel>> future) {
        fetchDiaryType(structureId, event -> {
            if (event.failed()) {
                future.fail(event.cause());
            } else {
                future.complete(event.result());
            }
        });
    }
}
