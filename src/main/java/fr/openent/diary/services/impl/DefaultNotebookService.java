package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.core.enums.DiaryType;
import fr.openent.diary.helper.DiaryTypeHelper;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.helper.NotebookHelper;
import fr.openent.diary.models.Audience;
import fr.openent.diary.models.DiaryTypeModel;
import fr.openent.diary.models.Notebook;
import fr.openent.diary.models.Person.User;
import fr.openent.diary.models.Subject;
import fr.openent.diary.services.GroupService;
import fr.openent.diary.services.NotebookService;
import fr.openent.diary.services.SubjectService;
import fr.openent.diary.services.UserService;
import fr.wseduc.webutils.Either;
import io.vertx.core.*;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static fr.openent.diary.core.enums.DiaryType.HOMEWORK;
import static fr.openent.diary.core.enums.DiaryType.SESSION;

public class DefaultNotebookService implements NotebookService {
    private static final Logger log = LoggerFactory.getLogger(DefaultNotebookService.class);
    private final SubjectService subjectService;
    private final GroupService groupService;
    private final UserService userService;

    public DefaultNotebookService(EventBus eb) {
        this.subjectService = new DefaultSubjectService(eb);
        this.groupService = new DefaultGroupService(eb);
        this.userService = new DefaultUserService();
    }

    @Override
    public void getNotebooks(String structure_id, String start_at, String end_at, List<String> teacher_id, List<String> audience_id,
                             Boolean isVisa, String visaOrder, Boolean isPublished, Integer page, String limit, String offset,
                             Handler<Either<String, JsonObject>> handler) {
        Future<JsonArray> listResultsFuture = Future.future();
        Future<Long> countResultsFuture = Future.future();

        getNotebooksRequest(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, visaOrder, isPublished,
                page, limit, offset, listResultsFuture);
        countRequest(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, isPublished, countResultsFuture);

        CompositeFuture.all(listResultsFuture, countResultsFuture).setHandler(eventResult -> {
            if (eventResult.failed()) {
                handler.handle(new Either.Left<>(eventResult.cause().getMessage()));
                return;
            }

            JsonObject result = new JsonObject()
                    .put("all", listResultsFuture.result())
                    .put("page_count", countResultsFuture.result() <= Diary.PAGE_SIZE ?
                            0 : (long) Math.ceil(countResultsFuture.result() / (double) Diary.PAGE_SIZE));

            if(page != null) {
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

    private void getNotebooksRequest(String structure_id, String start_at, String end_at, List<String> teacher_ids,
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

                        for (Notebook notebook: notebookList) {
                            notebook.setSubject(subjectMap.getOrDefault(notebook.getSubject().getId(), null));
                            notebook.setTeacher(teacherMap.getOrDefault(notebook.getTeacher().getId(), null));
                            notebook.setAudience(audienceMap.getOrDefault(notebook.getAudience().getId(), null));
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

    private void countRequest(String structure_id, String start_at, String end_at, List<String> teacher_id,
                              List<String> audience_id, Boolean isVisa, Boolean isPublished, Future<Long> future) {
        JsonArray params = new JsonArray();
        Sql.getInstance().prepared(queryGetter(true, structure_id, start_at, end_at, teacher_id,
                audience_id, isVisa, null, isPublished, null, null, null, params), params, SqlResult.validUniqueResultHandler(event -> {
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
        if (isVisa == null || isVisa) {
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
                    audience_ids, isPublished, params);
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
                    audience_ids, isPublished, params);

            // filter visa true case
            if (isVisa) {
                selectQuery += "UNION ALL ";
                selectQuery += getSelectNotebookContentQuery(isVisa);
                selectQuery += "INNER JOIN diary.homework_visa ON (notebook.type = '" + HOMEWORK.toString() +
                        "' AND notebook.id = homework_visa.homework_id) " +
                        "INNER JOIN diary.visa ON (homework_visa.visa_id = visa.id) ";
                selectQuery += getFilterSelectQueryNotebook(structure_id, isVisa, start_at, end_at, teacher_ids,
                        audience_ids, isPublished, params);
            }

        }
        return selectQuery + ')';
    }

    private String getSelectNotebookContentQuery(Boolean isVisa) {
        return "SELECT concat(notebook.subject_id, '$', " +
                "notebook.teacher_id, '$', notebook.audience_id) as notebook_id, notebook.subject_id, " +
                "notebook.teacher_id, notebook.audience_id, count(distinct notebook.id) as sessions, MAX(notebook.modified) as modified, " +
                ((isVisa == null || isVisa) ? "MAX(visa.created)" : "null") + " as visa" + " FROM diary.notebook ";
    }

    private String getFilterSelectQueryNotebook(String structure_id, Boolean isVisa, String start_at,
                                                String end_at, List<String> teacher_ids, List<String> audience_ids,
                                                Boolean isPublished, JsonArray params) {

        // structure id
        String query = " WHERE notebook.structure_id = ? ";
        params.add(structure_id);

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
        query += "GROUP BY notebook.subject_id, notebook.teacher_id, notebook.audience_id ";
        return query;
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

                        for (Notebook notebook: notebookList) {
                            notebook.setSubject(subjectMap.getOrDefault(notebook.getSubject().getId(), null));
                            notebook.setTeacher(teacherMap.getOrDefault(notebook.getTeacher().getId(), null));
                            notebook.setAudience(audienceMap.getOrDefault(notebook.getAudience().getId(), null));
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

                for (Notebook notebook: notebookList) {
                    for (DiaryTypeModel diaryType: diaryTypeModelList) {
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
        return ") SELECT * from notebooks ";
    }

    private String getSubQueryJoin(DiaryType diaryType) {
        switch(diaryType) {
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
        if (!subject_id.isEmpty()) {
            query += "AND notebook.subject_id = ? ";
            params.add(subject_id);
        }

        // teacher_id case
        if (!teacher_id.isEmpty()) {
            query += "AND notebook.teacher_id = ? ";
            params.add(teacher_id);
        }

        // audience_id case
        if (!audience_id.isEmpty()) {
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
                "notebook.workload, notebook.estimatedtime" + ((isVisa == null || isVisa) ? ", visa" : " ");
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
