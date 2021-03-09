package fr.openent.diary.services;

import fr.openent.diary.models.NotebookArchive;
import fr.wseduc.webutils.*;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface NotebookArchiveService {

    /**
     * Fetch notebook archives
     *
     * @param structureId       structure identifier
     * @param schoolYear        notebooks school year (ex: 2018-2019)
     * @param teacherNames      list teacher identifiers
     * @param audienceLabels    list audience identifiers
     * @param page              pagination
     * @param limit             limit
     * @param offset            offset
     * @param handler           function handler returning data
     */
    void get(String structureId, String schoolYear, List<String> teacherNames, List<String> audienceLabels,
             Integer page, String limit, String offset, Handler<AsyncResult<JsonObject>> handler);

    void getNotebookArchives(String structureId, String schoolYear, List<String> teacherNames,
                             List<String> audienceLabels, Integer page,
                             String limit, String offset, Future<JsonArray> future);

    Future<JsonArray> getNotebookArchives(String structureId, String schoolYear, List<String> teacherNames,
                             List<String> audienceLabels, Integer page,
                             String limit, String offset);

    /**
     * Get notebook archive years.
     * @param structureId   structure identifier
     * @param handler       function handler returning data
     */
    void getArchiveYears(String structureId, Handler<AsyncResult<JsonArray>> handler);

    /**
     *
     * @param archives archives to remove
     */
    Future<JsonObject> delete(List<NotebookArchive> archives);


    /**
     * Delete old notebooks (sessions + homeworks) and visas.
     * @param structureId   structure identifier
     * @param date          date from which all previous items will be removed
     * @param handler       handler returning success or not
     */
    void deleteOldNotebooksAndVisas(String structureId, String date, Handler<AsyncResult<JsonObject>> handler);


    /**
     * Search distinct teacher in notebook_archive table
     *
     * @param structureId structure identifier
     * @param searchField Query string to filter
     * @param handler     Handler returning data
     */
    void searchTeacher(String structureId, String searchField, Handler<AsyncResult<JsonArray>> handler);

    /**
     * Search distinct audience in notebook_archive table
     *
     * @param structureId structure identifier
     * @param searchField Query string to filter
     * @param handler     Handler returning data
     */
    void searchAudience(String structureId, String searchField, Handler<AsyncResult<JsonArray>> handler);


    /**
     * Retrieve notebook archive pdf ids from id.
     * @param structureId   structure identifier
     * @param archiveId     archive identifiers
     * @param handler       Handler returning data
     */
    void getNotebookArchivePdfInfos(String structureId, List<Integer> archiveId, Handler<AsyncResult<JsonArray>> handler);

    String getPDFName(JsonObject pdfInfos);

    String getZIPName();

    /**
     * Launch notebook archive generation worker.
     * @param structureId   structure identifier
     * @param handler       Handler returning data
     */
    void launchArchivesWorker(String structureId, Integer schoolYear, Handler<Either<String, JsonObject>> handler);
}
