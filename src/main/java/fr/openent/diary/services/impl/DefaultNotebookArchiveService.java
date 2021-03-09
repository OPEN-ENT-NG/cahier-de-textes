package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
import fr.openent.diary.db.DBService;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.models.NotebookArchive;
import fr.openent.diary.services.NotebookArchiveService;
import fr.openent.diary.helper.FileHelper;
import fr.openent.diary.utils.DateUtils;
import fr.wseduc.webutils.*;
import io.vertx.core.AsyncResult;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.neo4j.*;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.storage.Storage;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class DefaultNotebookArchiveService extends DBService implements NotebookArchiveService {
    private static final Logger log = LoggerFactory.getLogger(DefaultNotebookArchiveService.class);
    private static final String STATEMENT = "statement";
    private static final String VALUES = "values";
    private static final String ACTION = "action";
    private static final String PREPARED = "prepared";
    private final EventBus eb;

    private final Storage storage;


    public DefaultNotebookArchiveService(EventBus eb, Storage storage) {
        this.eb = eb;
        this.storage = storage;
    }

    @Override
    public void get(String structureId, String schoolYear, List<String> teacherNames, List<String> audienceLabels,
                    Integer page, String limit, String offset, Handler<AsyncResult<JsonObject>> handler) {
        Future<JsonArray> listResultsFuture = Future.future();
        Future<Long> countResultsFuture = Future.future();

        getNotebookArchives(structureId, schoolYear, teacherNames, audienceLabels, page, limit, offset, listResultsFuture);
        countRequest(structureId, schoolYear, teacherNames, audienceLabels, countResultsFuture);

        CompositeFuture.all(listResultsFuture, countResultsFuture).setHandler(eventResult -> {
            if (eventResult.failed()) {
                handler.handle(Future.failedFuture(eventResult.cause().getMessage()));
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

            handler.handle(Future.succeededFuture(result));
        });
    }

    @Override
    public void getNotebookArchives(String structureId, String schoolYear, List<String> teacherNames,
                                    List<String> audienceLabels, Integer page,
                                    String limit, String offset, Future<JsonArray> future) {
        JsonArray params = new JsonArray();
        sql.prepared(queryGetter(false, structureId, schoolYear, teacherNames, audienceLabels,
                page, limit, offset, params), params,
                SqlResult.validResultHandler(FutureHelper.handlerJsonArray(future)));
    }

    @Override
    public Future<JsonArray> getNotebookArchives(String structureId, String schoolYear, List<String> teacherNames,
                                                 List<String> audienceLabels, Integer page,
                                                 String limit, String offset) {
        Future<JsonArray> future = Future.future();
        getNotebookArchives(structureId, schoolYear, teacherNames, audienceLabels, page, limit, offset, future);
        return future;
    }

    private void countRequest(String structureId, String schoolYear, List<String> teacherNames,
                              List<String> audienceLabels, Future<Long> future) {
        JsonArray params = new JsonArray();
        sql.prepared(queryGetter(true, structureId, schoolYear, teacherNames,
                audienceLabels, null, null, null, params), params, SqlResult.validUniqueResultHandler(event -> {
            if (event.isLeft()) {
                String message = "[Diary@DefaultNotebookArchiveService::countRequest] Failed to count notebook archives.";
                log.error(message + " " + event.left().getValue());
                future.fail(message);
                return;
            }
            Long count = event.right().getValue().getLong("count", 0L);
            future.complete(count);
        }));
    }

    private String queryGetter(boolean isCountQueryString, String structureId, String schoolYear, List<String> teacherNames,
                               List<String> audienceLabels, Integer page, String limit,
                               String offset, JsonArray params) {
        String query = isCountQueryString ? " SELECT COUNT(DISTINCT id) " : " SELECT * ";

        query += " FROM " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " WHERE structure_id = ? ";

        params.add(structureId);

        if (schoolYear != null) {
            query += " AND archive_school_year = ? ";
            params.add(schoolYear);
        }

        if (teacherNames != null && !teacherNames.isEmpty()) {
            query += " AND CONCAT(teacher_first_name, ' ', teacher_last_name) IN " + Sql.listPrepared(teacherNames);
            params.addAll(new JsonArray(teacherNames));
        }

        if (audienceLabels != null && !audienceLabels.isEmpty()) {
            query += " AND audience_label IN " + Sql.listPrepared(audienceLabels);
            params.addAll(new JsonArray(audienceLabels));
        }

        // paginations cases
        if (!isCountQueryString) {
            query += " ORDER BY audience_label, subject_label ";
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
        }

        return query;
    }

    @Override
    public void getArchiveYears(String structureId, Handler<AsyncResult<JsonArray>> handler) {
        String query = "SELECT DISTINCT archive_school_year FROM " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " WHERE structure_id = ? ORDER BY archive_school_year DESC ";

        JsonArray params = new JsonArray();
        params.add(structureId);

        sql.prepared(query,params, SqlResult.validResultHandler(FutureHelper.handlerJsonArray(handler)));
    }

    @Override
    public Future<JsonObject> delete(List<NotebookArchive> archives) {
        Future<JsonObject> future = Future.future();
        if (archives == null || archives.isEmpty()) {
            future.complete(new JsonObject().put("success", "ok"));
            return future;
        }

        List<Long> archiveIdsToDelete = new ArrayList<>();
        List<Future<Void>> pdfRemoveFutures = removePdfs(archives, archiveIdsToDelete);

        FutureHelper.join(pdfRemoveFutures).setHandler(result -> {
            deleteArchives(archiveIdsToDelete, future);
        });

        return future;
    }

    private List<Future<Void>> removePdfs(List<NotebookArchive> archives, List<Long> archiveIds) {
        List<Future<Void>> pdfRemoveFutures = new ArrayList<>();

        for (NotebookArchive archive : archives) {
            Future<Void> pdfRemoveFuture = Future.future();
            pdfRemoveFutures.add(pdfRemoveFuture);
            FileHelper.exist(storage, archive.getFileId(), existResult -> {
                if (existResult.result() != null && existResult.result().equals(Boolean.FALSE)) {
                    archiveIds.add(archive.getId());
                    pdfRemoveFuture.complete();
                    return;
                }

                FileHelper.removeFile(storage, archive.getFileId(), result -> {
                    if (result.failed()) {
                        pdfRemoveFuture.fail(result.cause().getMessage());
                        return;
                    }

                    archiveIds.add(archive.getId());
                    pdfRemoveFuture.complete();
                });
            });
        }

        return pdfRemoveFutures;
    }

    private void deleteArchives(List<Long> archiveIds, Handler<AsyncResult<JsonObject>> handler) {
        if (archiveIds == null || archiveIds.isEmpty()) {
            handler.handle(Future.succeededFuture(new JsonObject()));
            return;
        }

        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".notebook_archive WHERE id IN " + Sql.listPrepared(archiveIds);
        sql.prepared(query, new JsonArray(archiveIds), SqlResult.validUniqueResultHandler(FutureHelper.handlerJsonObject(handler)));
    }

    @Override
    public void deleteOldNotebooksAndVisas(String structureId, String date, Handler<AsyncResult<JsonObject>> handler) {

        deleteOldVisas(structureId, date)
                .compose(res -> deleteOldSessionsAndHomeworks(structureId, date))
                .setHandler(result -> {
                    if (result.failed()) {
                        log.error(result.cause());
                        handler.handle(Future.failedFuture(result.cause().getMessage()));
                    } else {
                        handler.handle(Future.succeededFuture(new JsonObject().put("success", "ok")));
                    }
                });
    }

    private Future<Void> deleteOldVisas(String structureId, String date) {
        Future<Void> future = Future.future();

        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".visa v WHERE v.structure_id = ? AND v.created <= ?";
        JsonArray params = new JsonArray()
                .add(structureId)
                .add(date);

        sql.prepared(query, params, SqlResult.validUniqueResultHandler(result -> {
            if (result.isLeft()) {
                String message = "[Diary@DefaultNotebookArchiveService::deleteOldVisas] Failed to delete old visas.";
                log.error(message, result.left().getValue());
                future.fail(message);
            } else {
                future.complete();
            }
        }));
        return future;
    }

    private Future<Void> deleteOldSessionsAndHomeworks(String structureId, String date) {
        Future<Void> future = Future.future();

        JsonArray statements = new JsonArray();
        statements.add(getDeleteOldHomeworksStatement(structureId, date));
        statements.add(getDeleteOldSessionsStatement(structureId, date));

        sql.transaction(statements, SqlResult.validUniqueResultHandler(result -> {
            if (result.isLeft()) {
                String message = "[Diary@DefaultNotebookArchiveService::deleteOldSessionsAndHomeworks] Failed to delete " +
                        "old homeworks and sessions.";
                log.error(message, result.left().getValue());
                future.fail(message);
            } else {
                future.complete();
            }
        }));
        return future;
    }

    private JsonObject getDeleteOldSessionsStatement(String structureId, String date) {
        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".session s WHERE s.structure_id = ? AND s.date <= ?";
        JsonArray params = new JsonArray()
                .add(structureId)
                .add(date);

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    private JsonObject getDeleteOldHomeworksStatement(String structureId, String date) {
        String query = "DELETE FROM " + Diary.DIARY_SCHEMA + ".homework h WHERE structure_id = ? AND due_date <= ?";
        JsonArray params = new JsonArray()
                .add(structureId)
                .add(date);

        return new JsonObject()
                .put(STATEMENT, query)
                .put(VALUES, params)
                .put(ACTION, PREPARED);
    }

    @Override
    public void searchTeacher(String structureId, String searchField, Handler<AsyncResult<JsonArray>> handler) {
        String[] nameParts = searchField != null ? searchField.split(" ") : new String[0];

        String query = " SELECT DISTINCT(CONCAT(teacher_first_name, ' ', teacher_last_name)) as displayName " +
                " FROM " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " WHERE structure_id = ? ";

        JsonArray params = new JsonArray().add(structureId);

        if (nameParts.length == 0) {
            String message = "[Diary@DefaultNotebookArchiveService::searchTeacher] search content is empty";
            log.error(message);
            handler.handle(Future.failedFuture(message));
            return;
        } else {
            List<String> parts = Arrays.stream(nameParts).map(part -> '%' + part.toLowerCase() + '%').collect(Collectors.toList());
            String queryNameParts = Sql.arrayPrepared(parts.toArray(), true);
            query += " AND (lower(unaccent(teacher_first_name)) LIKE ANY " + queryNameParts +
                    " OR lower(unaccent(teacher_last_name)) LIKE ANY " + queryNameParts + ") ";
            params.addAll(new JsonArray(parts))
                    .addAll(new JsonArray(parts));
        }

        sql.prepared(query, params, SqlResult.validResultHandler(FutureHelper.handlerJsonArray(handler)));
    }

    @Override
    public void searchAudience(String structureId, String searchField, Handler<AsyncResult<JsonArray>> handler) {
        String[] labelParts = searchField != null ? searchField.split(" ") : new String[0];

        String query = " SELECT DISTINCT(audience_label)" +
                " FROM " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " WHERE structure_id = ? ";

        JsonArray params = new JsonArray().add(structureId);

        if (labelParts.length == 0) {
            String message = "[Diary@DefaultNotebookArchiveService::searchAudience] search content is empty";
            log.error(message);
            handler.handle(Future.failedFuture(message));
            return;
        } else {
            List<String> parts = Arrays.stream(labelParts).map(part -> '%' + part.toLowerCase() + '%').collect(Collectors.toList());
            query += " AND lower(unaccent(audience_label)) LIKE ANY " + Sql.arrayPrepared(parts.toArray(), true);
            params.addAll(new JsonArray(parts));
        }

        sql.prepared(query, params, SqlResult.validResultHandler(FutureHelper.handlerJsonArray(handler)));
    }


    @Override
    public void getNotebookArchivePdfInfos(String structureId, List<Integer> archiveId, Handler<AsyncResult<JsonArray>> handler) {
        String query = " SELECT file_id, teacher_first_name, teacher_last_name, audience_label, subject_label, archive_school_year" +
                " FROM " + Diary.DIARY_SCHEMA + ".notebook_archive " +
                " WHERE structure_id = ? AND id IN " + (Sql.listPrepared(archiveId.toArray()));


        JsonArray params = new JsonArray().add(structureId);

        for (Integer id : archiveId) {
            params.add(id);
        }

        sql.prepared(query, params, SqlResult.validResultHandler(FutureHelper.handlerJsonArray(handler)));
    }

    public String getPDFName(JsonObject pdfInfos) {
        String teacherName = pdfInfos.getString("teacher_last_name") + "_" + pdfInfos.getString("teacher_first_name");
        String audienceLabel = pdfInfos.getString("audience_label");
        String subjectLabel = pdfInfos.getString("subject_label");
        String dates = pdfInfos.getString("archive_school_year");

        return "archives_" + teacherName + "_" + audienceLabel + "_" + subjectLabel + "_" + dates;
    }

    public String getZIPName() {
        return "archive_" + DateUtils.getCurrentDate(DateUtils.DATE_FORMAT);
    }

    @Override
    public void launchArchivesWorker(String structureId, Integer schoolYear, Handler<Either<String, JsonObject>> handler) {
        getStructure(structureId, res -> {
            if (res.isLeft()) {
                handler.handle(new Either.Left<>("[Diary@DefaultNotebookService::launchArchivesWorker] Error fetching structure data."));
                return;
            }
            JsonObject structure = res.right().getValue().getJsonObject("s").getJsonObject("data");
            Diary.launchNotebookArchiveWorker(eb, new JsonObject().put("structure", structure).put("schoolYear", schoolYear));
            handler.handle(new Either.Right<>(new JsonObject().put("status", "ok")));
        });

    }

    private void getStructure(String id, Handler<Either<String, JsonObject>> handler) {
        String query = "MATCH (s:Structure) WHERE s.id = {id} RETURN s";
        neo4j.execute(query, new JsonObject().put("id", id), Neo4jResult.validUniqueResultHandler(handler));
    }

}